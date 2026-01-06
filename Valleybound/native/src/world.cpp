#include "world.h"

#include <cmath>

float Distance(Vec2 a, Vec2 b)
{
    const float dx = a.x - b.x;
    const float dy = a.y - b.y;
    return std::sqrt(dx * dx + dy * dy);
}

Vec2 Normalize(Vec2 v)
{
    const float length = std::sqrt(v.x * v.x + v.y * v.y);
    if (length <= 0.0001f)
    {
        return {};
    }

    return {v.x / length, v.y / length};
}

bool CrossingCleared(const GameState& game)
{
    const Vec2 crossing = {565.0f, 385.0f};
    for (const PhysicsBody& body : game.debris)
    {
        if (Distance(body.p, crossing) < 58.0f)
        {
            return false;
        }
    }

    return true;
}

void CreatePrototypeWorld(GameState& game)
{
    game.debris = {
        {{548.0f, 385.0f}, {}, 15.0f, 1.3f, BodyKind::Branch},
        {{583.0f, 398.0f}, {}, 18.0f, 1.7f, BodyKind::Log},
        {{573.0f, 365.0f}, {}, 13.0f, 2.2f, BodyKind::Stone},
    };

    game.animals = {
        {{760.0f, 420.0f}, {}, 0.0f, AnimalKind::Sheep},
        {{805.0f, 438.0f}, {}, 1.7f, AnimalKind::Sheep},
        {{825.0f, 395.0f}, {}, 2.6f, AnimalKind::Sheep},
        {{515.0f, 520.0f}, {}, 0.8f, AnimalKind::Cow},
        {{555.0f, 492.0f}, {}, 1.9f, AnimalKind::Cow},
    };

    game.houses = {
        {{175.0f, 500.0f}, true},
        {{235.0f, 520.0f}, false},
        {{318.0f, 350.0f}, true},
        {{492.0f, 470.0f}, true},
        {{548.0f, 505.0f}, false},
        {{850.0f, 220.0f}, false},
        {{920.0f, 560.0f}, false},
    };

    game.npcs = {
        {{525.0f, 455.0f}, L"Ghulam Nabi", L"Carpenter"},
        {{345.0f, 330.0f}, L"Zooni", L"Family house"},
        {{780.0f, 455.0f}, L"Rafiq", L"Shepherd"},
        {{895.0f, 250.0f}, L"Nargis", L"Trader"},
    };

    game.resources = {
        {{455.0f, 485.0f}, ResourceKind::Wood, 2, false},
        {{430.0f, 510.0f}, ResourceKind::Wood, 1, false},
        {{610.0f, 360.0f}, ResourceKind::Stone, 2, false},
        {{705.0f, 455.0f}, ResourceKind::Herbs, 1, false},
        {{735.0f, 470.0f}, ResourceKind::Herbs, 1, false},
    };
}
