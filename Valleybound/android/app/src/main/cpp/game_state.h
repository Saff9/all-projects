#pragma once

#include <array>
#include <vector>

struct Vec2
{
    float x = 0.0f;
    float y = 0.0f;
};

enum class Season
{
    Spring,
    Summer,
    Autumn,
    Winter
};

enum class ResourceKind
{
    Wood,
    Stone,
    Herbs
};

enum class AnimalKind
{
    Sheep,
    Cow
};

struct Body
{
    Vec2 p;
    Vec2 v;
    float radius = 12.0f;
    float mass = 1.0f;
};

struct Resource
{
    Vec2 p;
    ResourceKind kind = ResourceKind::Wood;
    int amount = 1;
    bool depleted = false;
};

struct Animal
{
    Vec2 p;
    Vec2 v;
    AnimalKind kind = AnimalKind::Sheep;
    float phase = 0.0f;
};

struct Marker
{
    Vec2 p;
    const char* label = "";
};

struct TouchInput
{
    Vec2 move;
    bool actionPressed = false;
};

struct GameState
{
    Vec2 player = {260.0f, 400.0f};
    Vec2 velocity = {};
    float stamina = 1.0f;
    int questStep = 0;
    bool bridgeRepaired = false;
    bool homeRepaired = false;
    int wood = 0;
    int stone = 0;
    int herbs = 0;
    int wool = 0;
    Season season = Season::Autumn;
    float dayTime = 8.0f;
    float messageTimer = 5.0f;
    const char* message = "Inspect the broken crossing, gather wood, and open the valley route.";
    std::vector<Body> debris;
    std::vector<Resource> resources;
    std::vector<Animal> animals;
    std::array<Marker, 5> markers;
};

void InitGame(GameState& game);
void UpdateGame(GameState& game, const TouchInput& input, float dt);
