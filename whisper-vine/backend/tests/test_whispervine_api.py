"""WhisperVine end-to-end API tests (PostgreSQL + JWT + AI moderation/games)."""
from __future__ import annotations
import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://whisper-vine.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

SEED_EMAIL = "creator@gmail.com"
SEED_PASSWORD = "vinepass123"
SEED_VINE_SLUG = "midnight-whispers-4b6bfc"
SEED_CARD_FILENAME = "04b67c5d-88a1-4053-a6a3-3110cfabd8d5.jpg"


# ---------- Fixtures ----------
@pytest.fixture(scope="session")
def http():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def auth_token(http):
    r = http.post(f"{API}/auth/login", json={"email": SEED_EMAIL, "password": SEED_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"Auth login failed: {r.status_code} {r.text}")
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def auth_http(auth_token):
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json", "Authorization": f"Bearer {auth_token}"})
    return s


@pytest.fixture(scope="session")
def seed_vine_id(auth_http):
    r = auth_http.get(f"{API}/vines/{SEED_VINE_SLUG}")
    assert r.status_code == 200, f"Seed vine missing: {r.text}"
    return r.json()["id"]


# ---------- Health ----------
class TestHealth:
    def test_root(self, http):
        r = http.get(f"{API}/")
        assert r.status_code == 200
        d = r.json()
        assert d == {"app": "WhisperVine", "status": "ok"}


# ---------- Auth ----------
class TestAuth:
    def test_login_seed_user(self, http):
        r = http.post(f"{API}/auth/login", json={"email": SEED_EMAIL, "password": SEED_PASSWORD})
        assert r.status_code == 200
        d = r.json()
        assert "access_token" in d and isinstance(d["access_token"], str) and len(d["access_token"]) > 20
        assert d["user"]["email"] == SEED_EMAIL
        assert d["token_type"] == "bearer"

    def test_login_invalid(self, http):
        r = http.post(f"{API}/auth/login", json={"email": SEED_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_me(self, auth_http):
        r = auth_http.get(f"{API}/auth/me")
        assert r.status_code == 200
        d = r.json()
        assert d["email"] == SEED_EMAIL
        assert "id" in d and "nickname" in d

    def test_me_no_token(self, http):
        r = http.get(f"{API}/auth/me")
        assert r.status_code in (401, 403)

    def test_signup_new_user(self, http):
        email = f"TEST_{uuid.uuid4().hex[:8]}@example.com"
        r = http.post(f"{API}/auth/signup", json={"email": email, "nickname": "TestUser", "password": "testpass123"})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["user"]["email"] == email.lower()
        assert "access_token" in d

    def test_signup_duplicate(self, http):
        r = http.post(f"{API}/auth/signup", json={"email": SEED_EMAIL, "nickname": "Dup", "password": "abc123"})
        assert r.status_code == 400


# ---------- Vines ----------
class TestVines:
    def test_discover_public(self, http):
        r = http.get(f"{API}/vines/discover")
        assert r.status_code == 200
        d = r.json()
        assert isinstance(d, list)
        slugs = [v["slug"] for v in d]
        assert SEED_VINE_SLUG in slugs

    def test_get_seed_vine_public(self, http):
        r = http.get(f"{API}/vines/{SEED_VINE_SLUG}")
        assert r.status_code == 200
        d = r.json()
        assert d["slug"] == SEED_VINE_SLUG
        assert d["name"]

    def test_list_my_vines_requires_auth(self, http):
        r = http.get(f"{API}/vines")
        assert r.status_code in (401, 403)

    def test_list_my_vines(self, auth_http):
        r = auth_http.get(f"{API}/vines")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_create_vine_and_get(self, auth_http):
        name = f"TEST Vine {uuid.uuid4().hex[:6]}"
        payload = {
            "name": name,
            "description": "Auto created by test",
            "moderation_strictness": "balanced",
            "requires_approval": False,
            "game_schedule_hour": 20,
        }
        r = auth_http.post(f"{API}/vines", json=payload)
        assert r.status_code == 200, r.text
        v = r.json()
        assert v["name"] == name
        assert v["slug"].startswith("test-vine-")
        # Verify persistence
        r2 = auth_http.get(f"{API}/vines/{v['slug']}")
        assert r2.status_code == 200
        assert r2.json()["id"] == v["id"]


# ---------- Confessions (anonymous + AI moderation) ----------
class TestConfessions:
    def test_submit_anonymous_benign(self, http):
        # No auth header → anonymous
        # Use a unique-ish content so multiple test runs don't deduplicate; classify via Claude
        content = f"I secretly hate small talk. {uuid.uuid4().hex[:6]}"
        r = http.post(f"{API}/confessions/{SEED_VINE_SLUG}", json={"content": content})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["status"] in ("approved", "pending", "rejected")
        # benign content under balanced strictness should be approved (or at worst pending if approval enabled)
        assert d["status"] in ("approved", "pending"), f"benign content got rejected: {d}"

    def test_submit_doxxing_flagged(self, http):
        # Phone number triggers stage1 regex
        content = "My number is 555-123-4567 call me anytime"
        r = http.post(f"{API}/confessions/{SEED_VINE_SLUG}", json={"content": content})
        assert r.status_code == 200
        assert r.json()["status"] == "rejected"

    def test_submit_unknown_vine_404(self, http):
        r = http.post(f"{API}/confessions/does-not-exist-xyz", json={"content": "hello world this is fine"})
        assert r.status_code in (404, 429)

    def test_list_confessions_public(self, http):
        r = http.get(f"{API}/confessions/{SEED_VINE_SLUG}")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_rate_limit_429(self):
        # Use a fresh session with custom UA so we don't share fingerprint with other tests
        s = requests.Session()
        s.headers.update({"Content-Type": "application/json", "User-Agent": f"WV-RateTest-{uuid.uuid4().hex[:8]}"})
        statuses = []
        for i in range(7):
            r = s.post(f"{API}/confessions/{SEED_VINE_SLUG}", json={"content": f"rate test {i} {uuid.uuid4().hex[:4]} something benign"})
            statuses.append(r.status_code)
        assert 429 in statuses, f"Expected 429 within 7 rapid posts, got {statuses}"


# ---------- Confessions admin ----------
class TestConfessionAdmin:
    def test_queue_owner_only(self, auth_http, seed_vine_id):
        r = auth_http.get(f"{API}/confessions/admin/{seed_vine_id}/queue")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_queue_unauth(self, http, seed_vine_id):
        r = http.get(f"{API}/confessions/admin/{seed_vine_id}/queue")
        assert r.status_code in (401, 403)


# ---------- Games ----------
class TestGames:
    def test_get_active_game_public(self, http):
        r = http.get(f"{API}/games/{SEED_VINE_SLUG}/active")
        assert r.status_code == 200
        # may be null or a GameResults object

    def test_start_game_requires_owner(self, http, seed_vine_id):
        r = http.post(f"{API}/games/{seed_vine_id}/start?game_type=would_you_rather")
        assert r.status_code in (401, 403)

    def test_start_wyr_and_vote(self, auth_http, http, seed_vine_id):
        # Start WYR (slow, calls Claude)
        r = auth_http.post(f"{API}/games/{seed_vine_id}/start?game_type=would_you_rather", timeout=60)
        assert r.status_code == 200, r.text
        gs = r.json()
        assert gs["game_type"] == "would_you_rather"
        assert gs["question"] and gs["option_a"] and gs["option_b"]
        assert gs["is_active"] is True
        game_id = gs["id"]

        # Vote anonymously with a unique UA so we don't collide w/ rate limit / earlier votes
        s = requests.Session()
        s.headers.update({"Content-Type": "application/json", "User-Agent": f"WV-Voter-{uuid.uuid4().hex[:8]}"})
        rv = s.post(f"{API}/games/{game_id}/vote", json={"option": "a"})
        assert rv.status_code == 200, rv.text
        results = rv.json()
        assert results["votes_a"] >= 1
        assert results["has_voted"] is True

        # Second vote from same fingerprint → 409
        rv2 = s.post(f"{API}/games/{game_id}/vote", json={"option": "b"})
        assert rv2.status_code == 409

        # End the game so it doesn't pile up
        re = auth_http.post(f"{API}/games/{game_id}/end")
        assert re.status_code == 200

    def test_invalid_game_type(self, auth_http, seed_vine_id):
        r = auth_http.post(f"{API}/games/{seed_vine_id}/start?game_type=bogus")
        assert r.status_code == 400


# ---------- Cards ----------
class TestCards:
    def test_list_cards_public(self, http):
        r = http.get(f"{API}/cards/{SEED_VINE_SLUG}")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_serve_existing_card_image(self, http):
        r = http.get(f"{API}/cards/image/{SEED_CARD_FILENAME}")
        assert r.status_code == 200
        ct = r.headers.get("content-type", "")
        assert "image" in ct, f"unexpected content-type: {ct}"
        assert len(r.content) > 1000

    def test_serve_image_invalid_path(self, http):
        r = http.get(f"{API}/cards/image/..%2Fserver.py")
        # Either 400 (sanitized) or 404
        assert r.status_code in (400, 404)

    def test_generate_card_requires_auth(self, http):
        r = http.post(f"{API}/cards/generate", json={"confession_id": "fake-id"})
        assert r.status_code in (401, 403)


# ---------- Dashboard ----------
class TestDashboard:
    def test_dashboard_owner(self, auth_http, seed_vine_id):
        r = auth_http.get(f"{API}/dashboard/{seed_vine_id}")
        assert r.status_code == 200, r.text
        d = r.json()
        for k in ["total_confessions", "pending_count", "approved_count", "rejected_count",
                  "total_games", "total_cards", "confessions_today"]:
            assert k in d and isinstance(d[k], int)

    def test_dashboard_unauth(self, http, seed_vine_id):
        r = http.get(f"{API}/dashboard/{seed_vine_id}")
        assert r.status_code in (401, 403)

    def test_dashboard_not_owner(self, http, seed_vine_id):
        # Create another user
        email = f"TEST_{uuid.uuid4().hex[:8]}@example.com"
        rs = http.post(f"{API}/auth/signup", json={"email": email, "nickname": "Outsider", "password": "abc12345"})
        assert rs.status_code == 200
        token = rs.json()["access_token"]
        r = http.get(f"{API}/dashboard/{seed_vine_id}", headers={"Authorization": f"Bearer {token}"})
        assert r.status_code == 403
