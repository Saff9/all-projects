#pragma once

#include <windows.h>
#include <vector>

struct Vec2
{
    float x = 0.0f;
    float y = 0.0f;
};

struct RectF
{
    float x = 0.0f;
    float y = 0.0f;
    float w = 0.0f;
    float h = 0.0f;
};

enum class Season
{
    Spring,
    Summer,
    Autumn,
    Winter
};

enum class BodyKind
{
    Branch,
    Log,
    Stone
};

enum class AnimalKind
{
    Sheep,
    Cow
};

enum class ResourceKind
{
    Wood,
    Stone,
    Herbs
};

enum class Weather
{
    Clear,
    Rain,
    Snow,
    Fog
};

struct PhysicsBody
{
    Vec2 p;
    Vec2 v;
    float radius = 12.0f;
    float mass = 1.0f;
    BodyKind kind = BodyKind::Branch;
};

struct Animal
{
    Vec2 p;
    Vec2 v;
    float phase = 0.0f;
    AnimalKind kind = AnimalKind::Sheep;
};

struct House
{
    Vec2 p;
    bool oldStyle = true;
};

struct Npc
{
    Vec2 p;
    const wchar_t* name = L"";
    const wchar_t* role = L"";
};

struct Inventory
{
    int wood = 0;
    int stone = 0;
    int herbs = 0;
    int wool = 0;
};

struct ResourceNode
{
    Vec2 p;
    ResourceKind kind = ResourceKind::Wood;
    int amount = 1;
    bool depleted = false;
};

struct InputState
{
    bool up = false;
    bool down = false;
    bool left = false;
    bool right = false;
    bool sprint = false;
    bool interactPressed = false;
    bool savePressed = false;
    bool loadPressed = false;
    bool quitPressed = false;
};

struct GameState
{
    Vec2 player = {260.0f, 400.0f};
    Vec2 playerVelocity = {};
    float playerRadius = 13.0f;
    float stamina = 1.0f;
    bool hasWood = false;
    bool bridgeRepaired = false;
    bool homeRepaired = false;
    int questStep = 0;
    Season season = Season::Autumn;
    Weather weather = Weather::Clear;
    float dayTime = 8.0f;
    float messageTimer = 6.0f;
    wchar_t message[160] = L"Storm debris blocks the crossing. Inspect it, then clear a path.";
    Inventory inventory;
    std::vector<PhysicsBody> debris;
    std::vector<Animal> animals;
    std::vector<House> houses;
    std::vector<Npc> npcs;
    std::vector<ResourceNode> resources;
};

void InitGame(GameState& game);
void UpdateGame(GameState& game, const InputState& input, float dt);
void RenderGame(HDC dc, const GameState& game, int width, int height);
const wchar_t* SeasonName(Season season);
const wchar_t* WeatherName(Weather weather);
