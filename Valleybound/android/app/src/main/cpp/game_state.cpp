#include "game_state.h"

#include <algorithm>
#include <cmath>

namespace
{
constexpr Vec2 Crossing = {565.0f, 385.0f};
constexpr Vec2 FamilyHouse = {330.0f, 342.0f};
constexpr Vec2 StraySheep = {795.0f, 410.0f};
constexpr Vec2 RoofRepair = {318.0f, 350.0f};
constexpr Vec2 RiverA = {40.0f, 575.0f};
constexpr Vec2 RiverB = {565.0f, 385.0f};
constexpr Vec2 RiverC = {1160.0f, 315.0f};

float Distance(Vec2 a, Vec2 b)
{
    const float dx = a.x - b.x;
    const float dy = a.y - b.y;
    return std::sqrt(dx * dx + dy * dy);
}

Vec2 Normalize(Vec2 v)
{
    const float length = std::sqrt(v.x * v.x + v.y * v.y);
    if (length <= 0.0001f) return {};
    return {v.x / length, v.y / length};
}

float DistanceToSegment(Vec2 p, Vec2 a, Vec2 b)
{
    const Vec2 ab = {b.x - a.x, b.y - a.y};
    const Vec2 ap = {p.x - a.x, p.y - a.y};
    const float ab2 = ab.x * ab.x + ab.y * ab.y;
    if (ab2 <= 0.0001f) return Distance(p, a);
    float t = (ap.x * ab.x + ap.y * ab.y) / ab2;
    t = std::clamp(t, 0.0f, 1.0f);
    return Distance(p, {a.x + ab.x * t, a.y + ab.y * t});
}

bool CrossingCleared(const GameState& game)
{
    for (const Body& body : game.debris)
    {
        if (Distance(body.p, Crossing) < 58.0f) return false;
    }
    return true;
}

void SetMessage(GameState& game, const char* message)
{
    game.message = message;
    game.messageTimer = 4.5f;
}

bool TryCollect(GameState& game)
{
    for (Resource& resource : game.resources)
    {
        if (resource.depleted || Distance(game.player, resource.p) > 45.0f) continue;

        if (resource.kind == ResourceKind::Wood)
        {
            game.wood += resource.amount;
            SetMessage(game, "Collected wood. Use it for bridge and roof repairs.");
        }
        else if (resource.kind == ResourceKind::Stone)
        {
            game.stone += resource.amount;
            SetMessage(game, "Collected stone. Heavy repair systems will use it later.");
        }
        else
        {
            game.herbs += resource.amount;
            SetMessage(game, "Collected herbs. Zooni can use these at the family house.");
        }

        resource.depleted = true;
        if (game.questStep == 1 && game.wood >= 2) game.questStep = 2;
        return true;
    }

    return false;
}

void Interact(GameState& game)
{
    if (TryCollect(game)) return;

    if (Distance(game.player, Crossing) < 54.0f)
    {
        if (game.questStep == 0)
        {
            game.questStep = 1;
            SetMessage(game, "Clear debris and gather two wood bundles.");
        }
        else if (game.questStep == 2)
        {
            if (!CrossingCleared(game))
            {
                SetMessage(game, "The crossing is blocked. Push branches and stone away.");
                return;
            }
            if (game.wood < 2)
            {
                SetMessage(game, "The bridge needs two wood bundles.");
                return;
            }
            game.wood -= 2;
            game.bridgeRepaired = true;
            game.questStep = 3;
            SetMessage(game, "Bridge repaired. Go check the family house.");
        }
        return;
    }

    if (Distance(game.player, FamilyHouse) < 54.0f && game.questStep == 3)
    {
        game.questStep = 4;
        SetMessage(game, "The house needs roof work. First help Rafiq with the sheep.");
        return;
    }

    if (Distance(game.player, StraySheep) < 54.0f && game.questStep == 4)
    {
        game.wool += 1;
        game.questStep = 5;
        SetMessage(game, "Sheep safe. Gather wood and herbs to repair the roof.");
        return;
    }

    if (Distance(game.player, RoofRepair) < 54.0f && game.questStep == 5)
    {
        if (game.wood < 1 || game.herbs < 1)
        {
            SetMessage(game, "Roof repair needs one wood and one herb bundle.");
            return;
        }
        game.wood -= 1;
        game.herbs -= 1;
        game.homeRepaired = true;
        game.questStep = 6;
        SetMessage(game, "Family roof patched. The home base is secured.");
    }
}
}

void InitGame(GameState& game)
{
    game.debris = {
        {{548.0f, 385.0f}, {}, 15.0f, 1.3f},
        {{583.0f, 398.0f}, {}, 18.0f, 1.7f},
        {{573.0f, 365.0f}, {}, 13.0f, 2.2f},
    };

    game.resources = {
        {{455.0f, 485.0f}, ResourceKind::Wood, 2, false},
        {{430.0f, 510.0f}, ResourceKind::Wood, 1, false},
        {{610.0f, 360.0f}, ResourceKind::Stone, 2, false},
        {{705.0f, 455.0f}, ResourceKind::Herbs, 1, false},
        {{735.0f, 470.0f}, ResourceKind::Herbs, 1, false},
    };

    game.animals = {
        {{760.0f, 420.0f}, {}, AnimalKind::Sheep, 0.0f},
        {{805.0f, 438.0f}, {}, AnimalKind::Sheep, 1.7f},
        {{825.0f, 395.0f}, {}, AnimalKind::Sheep, 2.6f},
        {{515.0f, 520.0f}, {}, AnimalKind::Cow, 0.8f},
        {{555.0f, 492.0f}, {}, AnimalKind::Cow, 1.9f},
    };

    game.markers = {{
        {Crossing, "Crossing"},
        {{455.0f, 485.0f}, "Wood"},
        {FamilyHouse, "House"},
        {RoofRepair, "Roof"},
        {StraySheep, "Sheep"},
    }};
}

void UpdateGame(GameState& game, const TouchInput& input, float dt)
{
    if (input.actionPressed) Interact(game);

    game.dayTime += dt * 0.035f;
    if (game.dayTime >= 24.0f) game.dayTime -= 24.0f;

    Vec2 move = Normalize(input.move);
    const float winterFactor = game.season == Season::Winter ? 0.72f : 1.0f;
    const float speed = 205.0f * winterFactor;
    game.velocity = {move.x * speed, move.y * speed};
    game.player.x += game.velocity.x * dt;
    game.player.y += game.velocity.y * dt;

    game.stamina = std::clamp(game.stamina + dt * 0.05f, 0.0f, 1.0f);

    for (Body& body : game.debris)
    {
        const Vec2 delta = {body.p.x - game.player.x, body.p.y - game.player.y};
        const float len = std::sqrt(delta.x * delta.x + delta.y * delta.y);
        const float overlap = 13.0f + body.radius - len;
        if (overlap > 0.0f && len > 0.001f)
        {
            const Vec2 n = {delta.x / len, delta.y / len};
            const float push = 170.0f / body.mass;
            body.v.x += n.x * push * dt * 8.0f;
            body.v.y += n.y * push * dt * 8.0f;
            game.player.x -= n.x * overlap * 0.25f;
            game.player.y -= n.y * overlap * 0.25f;
        }

        body.p.x += body.v.x * dt;
        body.p.y += body.v.y * dt;
        body.v.x *= std::pow(0.18f, dt);
        body.v.y *= std::pow(0.18f, dt);
    }

    for (Animal& animal : game.animals)
    {
        const float scareRange = animal.kind == AnimalKind::Sheep ? 70.0f : 45.0f;
        if (Distance(animal.p, game.player) < scareRange)
        {
            Vec2 away = Normalize({animal.p.x - game.player.x, animal.p.y - game.player.y});
            animal.v.x += away.x * 85.0f * dt;
            animal.v.y += away.y * 85.0f * dt;
        }
        else
        {
            animal.phase += dt;
            animal.v.x += std::cos(animal.phase * 0.9f) * 7.0f * dt;
            animal.v.y += std::sin(animal.phase * 0.7f) * 7.0f * dt;
        }

        animal.p.x += animal.v.x * dt;
        animal.p.y += animal.v.y * dt;
        animal.v.x *= std::pow(0.35f, dt);
        animal.v.y *= std::pow(0.35f, dt);
    }

    const float riverDistance = std::min(DistanceToSegment(game.player, RiverA, RiverB), DistanceToSegment(game.player, RiverB, RiverC));
    const bool onBridge = game.bridgeRepaired && Distance(game.player, Crossing) < 52.0f;
    if (riverDistance < 23.0f && !onBridge)
    {
        game.player.x += 86.0f * dt;
        game.player.y -= 26.0f * dt;
        if (game.messageTimer <= 0.0f) SetMessage(game, "The river current is pushing you.");
    }

    game.player.x = std::clamp(game.player.x, 25.0f, 1175.0f);
    game.player.y = std::clamp(game.player.y, 180.0f, 695.0f);
    game.messageTimer = std::max(0.0f, game.messageTimer - dt);
}
