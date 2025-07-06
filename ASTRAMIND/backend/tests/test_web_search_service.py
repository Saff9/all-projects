import pytest


@pytest.mark.anyio
async def test_web_search_fallback_never_raises():
    from services.web_search import web_search_fallback

    data = web_search_fallback("anything")
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "title" in data[0]
