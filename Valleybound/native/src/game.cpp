#include "game.h"

#include "world.h"

#include <algorithm>
#include <cmath>
#include <cwchar>

namespace
{
constexpr Vec2 Crossing = {565.0f, 385.0f};
constexpr Vec2 WoodPile = {455.0f, 485.0f};
constexpr Vec2 FamilyHouse = {330.0f, 342.0f};
constexpr Vec2 StraySheep = {795.0f, 410.0f};
constexpr Vec2 RoofRepair = {318.0f, 350.0f};
constexpr Vec2 RiverA = {40.0f, 575.0f};
constexpr Vec2 RiverB = {565.0f, 385.0f};
constexpr Vec2 RiverC = {1160.0f, 315.0f};

COLORREF Rgb(int r, int g, int b)
{
    return RGB(r, g, b);
}

void SetMessage(GameState& game, const wchar_t* text)
{
    std::wcsncpy(game.message, text, 159);
    game.message[159] = L'\0';
    game.messageTimer = 4.5f;
}

float SeasonSpeedFactor(Season season)
{
    return season == Season::Winter ? 0.72f : 1.0f;
}

float WeatherSpeedFactor(Weather weather)
{
    if (weather == Weather::Rain) return 0.88f;
    if (weather == Weather::Snow) return 0.78f;
    if (weather == Weather::Fog) return 0.94f;
    return 1.0f;
}

float DistanceToSegment(Vec2 p, Vec2 a, Vec2 b)
{
    const Vec2 ab = {b.x - a.x, b.y - a.y};
    const Vec2 ap = {p.x - a.x, p.y - a.y};
    const float ab2 = ab.x * ab.x + ab.y * ab.y;
    if (ab2 <= 0.0001f) return Distance(p, a);

    float t = (ap.x * ab.x + ap.y * ab.y) / ab2;
    t = std::clamp(t, 0.0f, 1.0f);
    const Vec2 closest = {a.x + ab.x * t, a.y + ab.y * t};
    return Distance(p, closest);
}

void FillRectF(HDC dc, float x, float y, float w, float h, COLORREF color)
{
    HBRUSH brush = CreateSolidBrush(color);
    RECT rect = {
        static_cast<LONG>(x),
        static_cast<LONG>(y),
        static_cast<LONG>(x + w),
        static_cast<LONG>(y + h)
    };
    FillRect(dc, &rect, brush);
    DeleteObject(brush);
}

void FillEllipse(HDC dc, float x, float y, float rx, float ry, COLORREF color)
{
    HBRUSH brush = CreateSolidBrush(color);
    HBRUSH oldBrush = static_cast<HBRUSH>(SelectObject(dc, brush));
    HPEN pen = CreatePen(PS_SOLID, 1, color);
    HPEN oldPen = static_cast<HPEN>(SelectObject(dc, pen));
    Ellipse(dc,
        static_cast<int>(x - rx),
        static_cast<int>(y - ry),
        static_cast<int>(x + rx),
        static_cast<int>(y + ry));
    SelectObject(dc, oldBrush);
    SelectObject(dc, oldPen);
    DeleteObject(brush);
    DeleteObject(pen);
}

void DrawLine(HDC dc, Vec2 a, Vec2 b, COLORREF color, int width)
{
    HPEN pen = CreatePen(PS_SOLID, width, color);
    HPEN oldPen = static_cast<HPEN>(SelectObject(dc, pen));
    MoveToEx(dc, static_cast<int>(a.x), static_cast<int>(a.y), nullptr);
    LineTo(dc, static_cast<int>(b.x), static_cast<int>(b.y));
    SelectObject(dc, oldPen);
    DeleteObject(pen);
}

void DrawTextLine(HDC dc, int x, int y, const wchar_t* text, COLORREF color)
{
    SetBkMode(dc, TRANSPARENT);
    SetTextColor(dc, color);
    TextOutW(dc, x, y, text, static_cast<int>(std::wcslen(text)));
}

void DrawRegion(HDC dc, RectF r, const wchar_t* name, COLORREF color)
{
    FillRectF(dc, r.x, r.y, r.w, r.h, color);
    DrawTextLine(dc, static_cast<int>(r.x + 14.0f), static_cast<int>(r.y + 12.0f), name, Rgb(245, 239, 218));
}

void DrawHouse(HDC dc, const House& house)
{
    const COLORREF wall = house.oldStyle ? Rgb(139, 98, 67) : Rgb(184, 180, 167);
    const COLORREF roof = house.oldStyle ? Rgb(90, 50, 39) : Rgb(91, 96, 92);
    FillRectF(dc, house.p.x - 22.0f, house.p.y - 14.0f, 44.0f, 32.0f, wall);

    POINT roofPoints[3] = {
        {static_cast<LONG>(house.p.x - 28.0f), static_cast<LONG>(house.p.y - 14.0f)},
        {static_cast<LONG>(house.p.x), static_cast<LONG>(house.p.y - 40.0f)},
        {static_cast<LONG>(house.p.x + 28.0f), static_cast<LONG>(house.p.y - 14.0f)}
    };
    HBRUSH brush = CreateSolidBrush(roof);
    HBRUSH oldBrush = static_cast<HBRUSH>(SelectObject(dc, brush));
    Polygon(dc, roofPoints, 3);
    SelectObject(dc, oldBrush);
    DeleteObject(brush);

    if (house.oldStyle)
    {
        DrawLine(dc, {house.p.x - 18.0f, house.p.y - 10.0f}, {house.p.x + 18.0f, house.p.y + 12.0f}, Rgb(55, 36, 27), 2);
        DrawLine(dc, {house.p.x + 18.0f, house.p.y - 10.0f}, {house.p.x - 18.0f, house.p.y + 12.0f}, Rgb(55, 36, 27), 2);
    }
}

void DrawDebris(HDC dc, const PhysicsBody& body)
{
    if (body.kind == BodyKind::Stone)
    {
        FillEllipse(dc, body.p.x, body.p.y, body.radius, body.radius, Rgb(104, 103, 95));
        return;
    }

    const COLORREF color = body.kind == BodyKind::Log ? Rgb(109, 67, 40) : Rgb(130, 81, 47);
    FillRectF(dc, body.p.x - body.radius - 12.0f, body.p.y - 5.0f, body.radius * 2.0f + 24.0f, 10.0f, color);
}

void DrawAnimal(HDC dc, const Animal& animal)
{
    if (animal.kind == AnimalKind::Sheep)
    {
        FillEllipse(dc, animal.p.x, animal.p.y, 15.0f, 10.0f, Rgb(238, 231, 217));
        FillEllipse(dc, animal.p.x + 14.0f, animal.p.y - 2.0f, 7.0f, 7.0f, Rgb(216, 205, 187));
    }
    else
    {
        FillEllipse(dc, animal.p.x, animal.p.y, 20.0f, 13.0f, Rgb(138, 106, 74));
        FillEllipse(dc, animal.p.x + 18.0f, animal.p.y - 2.0f, 9.0f, 9.0f, Rgb(91, 63, 47));
    }
}

void DrawNpc(HDC dc, const Npc& npc)
{
    FillEllipse(dc, npc.p.x, npc.p.y, 10.0f, 10.0f, Rgb(62, 76, 118));
    FillEllipse(dc, npc.p.x, npc.p.y - 12.0f, 6.0f, 6.0f, Rgb(229, 191, 151));
    DrawTextLine(dc, static_cast<int>(npc.p.x + 13.0f), static_cast<int>(npc.p.y - 18.0f), npc.name, Rgb(236, 232, 212));
}

void DrawMarker(HDC dc, Vec2 p, const wchar_t* label, bool done)
{
    FillEllipse(dc, p.x, p.y, 9.0f, 9.0f, done ? Rgb(110, 166, 111) : Rgb(232, 195, 90));
    DrawTextLine(dc, static_cast<int>(p.x + 14.0f), static_cast<int>(p.y - 13.0f), label, Rgb(255, 247, 214));
}

void DrawResource(HDC dc, const ResourceNode& resource)
{
    if (resource.depleted)
    {
        return;
    }

    COLORREF color = Rgb(134, 90, 52);
    const wchar_t* label = L"Wood";
    if (resource.kind == ResourceKind::Stone)
    {
        color = Rgb(135, 132, 122);
        label = L"Stone";
    }
    else if (resource.kind == ResourceKind::Herbs)
    {
        color = Rgb(87, 151, 76);
        label = L"Herbs";
    }

    FillEllipse(dc, resource.p.x, resource.p.y, 10.0f, 10.0f, color);
    DrawTextLine(dc, static_cast<int>(resource.p.x + 13.0f), static_cast<int>(resource.p.y - 12.0f), label, Rgb(238, 231, 204));
}

bool TryCollectResource(GameState& game)
{
    for (ResourceNode& resource : game.resources)
    {
        if (resource.depleted || Distance(game.player, resource.p) >= 45.0f)
        {
            continue;
        }

        if (resource.kind == ResourceKind::Wood)
        {
            game.inventory.wood += resource.amount;
            game.hasWood = true;
            SetMessage(game, L"Collected wood. It can repair bridges, roofs, and animal shelters.");
        }
        else if (resource.kind == ResourceKind::Stone)
        {
            game.inventory.stone += resource.amount;
            SetMessage(game, L"Collected stone. Heavy repairs will need it later.");
        }
        else
        {
            game.inventory.herbs += resource.amount;
            SetMessage(game, L"Collected herbs. Villagers can use these for medicine and trade.");
        }

        resource.depleted = true;
        MessageBeep(MB_OK);
        return true;
    }

    return false;
}

void Interact(GameState& game)
{
    if (TryCollectResource(game))
    {
        if (game.questStep == 1 && game.inventory.wood >= 2)
        {
            game.questStep = 2;
        }
        return;
    }

    for (const Npc& npc : game.npcs)
    {
        if (Distance(game.player, npc.p) < 48.0f)
        {
            if (std::wcscmp(npc.name, L"Ghulam Nabi") == 0)
            {
                SetMessage(game, L"Ghulam Nabi: Good timber bends before it breaks. Clear the crossing first.");
            }
            else if (std::wcscmp(npc.name, L"Zooni") == 0)
            {
                SetMessage(game, L"Zooni: The old house needs roof work before winter.");
            }
            else if (std::wcscmp(npc.name, L"Rafiq") == 0)
            {
                SetMessage(game, L"Rafiq: Walk slow near sheep. They trust quiet feet.");
            }
            else
            {
                SetMessage(game, L"Nargis: Roads decide trade. Repair routes and the valley breathes again.");
            }
            MessageBeep(MB_OK);
            return;
        }
    }

    if (Distance(game.player, Crossing) < 54.0f)
    {
        if (game.questStep == 0)
        {
            game.questStep = 1;
            SetMessage(game, L"Clear the branches and stones, then collect wood from the orchard side.");
        }
        else if (game.questStep == 2)
        {
            if (!CrossingCleared(game))
            {
                SetMessage(game, L"The crossing is still blocked. Push debris away from the marker.");
                return;
            }

            game.bridgeRepaired = true;
            game.inventory.wood = std::max(0, game.inventory.wood - 2);
            game.questStep = 3;
            SetMessage(game, L"Bridge patched. The route to the family house is open.");
            MessageBeep(MB_OK);
        }
        return;
    }

    if (Distance(game.player, WoodPile) < 54.0f && game.questStep == 1)
    {
        SetMessage(game, L"Search nearby wood piles and press F to collect repair material.");
        return;
    }

    if (Distance(game.player, RoofRepair) < 54.0f && game.questStep == 5)
    {
        if (game.inventory.wood < 1 || game.inventory.herbs < 1)
        {
            SetMessage(game, L"The family house roof needs 1 wood and 1 herb bundle before nightfall.");
            return;
        }

        game.inventory.wood -= 1;
        game.inventory.herbs -= 1;
        game.homeRepaired = true;
        game.questStep = 6;
        SetMessage(game, L"Family house roof patched. This is now a safe home base.");
        MessageBeep(MB_OK);
        return;
    }

    if (Distance(game.player, FamilyHouse) < 54.0f && game.questStep == 3)
    {
        game.questStep = 4;
        SetMessage(game, L"The old house can be restored. First, help Rafiq with the stray sheep.");
        return;
    }

    if (Distance(game.player, StraySheep) < 54.0f && game.questStep == 4)
    {
        game.inventory.wool += 1;
        game.questStep = 5;
        SetMessage(game, L"Rafiq's sheep is safe. Gather wood and herbs to patch the family roof.");
        MessageBeep(MB_OK);
    }
}

void UpdatePhysics(GameState& game, float dt)
{
    for (PhysicsBody& body : game.debris)
    {
        const Vec2 delta = {body.p.x - game.player.x, body.p.y - game.player.y};
        const float len = std::sqrt(delta.x * delta.x + delta.y * delta.y);
        const float overlap = game.playerRadius + body.radius - len;
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
        body.p.x = std::clamp(body.p.x, 30.0f, 1170.0f);
        body.p.y = std::clamp(body.p.y, 185.0f, 690.0f);
    }
}

void UpdateAnimals(GameState& game, float dt)
{
    for (Animal& animal : game.animals)
    {
        const float scareRange = animal.kind == AnimalKind::Sheep ? 70.0f : 45.0f;
        const float d = Distance(animal.p, game.player);
        if (d < scareRange)
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
        animal.p.x = std::clamp(animal.p.x, 420.0f, 900.0f);
        animal.p.y = std::clamp(animal.p.y, 360.0f, 560.0f);
    }
}

void UpdateRiverCurrent(GameState& game, float dt)
{
    const float riverDistance = std::min(DistanceToSegment(game.player, RiverA, RiverB), DistanceToSegment(game.player, RiverB, RiverC));
    const bool onBridge = game.bridgeRepaired && Distance(game.player, Crossing) < 52.0f;
    if (riverDistance > 23.0f || onBridge)
    {
        return;
    }

    const Vec2 current = {86.0f, -26.0f};
    game.player.x += current.x * dt;
    game.player.y += current.y * dt;
    game.stamina = std::max(0.0f, game.stamina - dt * 0.1f);
    if (game.messageTimer <= 0.0f)
    {
        SetMessage(game, L"The river current is pushing you. Use the repaired bridge or move out fast.");
    }
}

void UpdateDayWeather(GameState& game, float dt)
{
    game.dayTime += dt * 0.035f;
    if (game.dayTime >= 24.0f) game.dayTime -= 24.0f;

    if (game.season == Season::Winter)
    {
        game.weather = Weather::Snow;
    }
    else if (game.dayTime > 5.0f && game.dayTime < 7.0f)
    {
        game.weather = Weather::Fog;
    }
    else if (game.season == Season::Spring && game.dayTime > 14.0f && game.dayTime < 18.0f)
    {
        game.weather = Weather::Rain;
    }
    else
    {
        game.weather = Weather::Clear;
    }
}
}

const wchar_t* SeasonName(Season season)
{
    switch (season)
    {
    case Season::Spring: return L"Spring";
    case Season::Summer: return L"Summer";
    case Season::Autumn: return L"Autumn";
    case Season::Winter: return L"Winter";
    }

    return L"Unknown";
}

const wchar_t* WeatherName(Weather weather)
{
    switch (weather)
    {
    case Weather::Clear: return L"Clear";
    case Weather::Rain: return L"Rain";
    case Weather::Snow: return L"Snow";
    case Weather::Fog: return L"Fog";
    }

    return L"Unknown";
}

void InitGame(GameState& game)
{
    CreatePrototypeWorld(game);
}

void UpdateGame(GameState& game, const InputState& input, float dt)
{
    UpdateDayWeather(game, dt);

    if (input.interactPressed)
    {
        Interact(game);
    }

    Vec2 move = {};
    if (input.up) move.y -= 1.0f;
    if (input.down) move.y += 1.0f;
    if (input.left) move.x -= 1.0f;
    if (input.right) move.x += 1.0f;
    move = Normalize(move);

    const bool canSprint = input.sprint && game.stamina > 0.05f;
    const float sprintFactor = canSprint ? 1.45f : 1.0f;
    const float speed = 205.0f * sprintFactor * SeasonSpeedFactor(game.season) * WeatherSpeedFactor(game.weather);
    game.playerVelocity = {move.x * speed, move.y * speed};
    game.player.x += game.playerVelocity.x * dt;
    game.player.y += game.playerVelocity.y * dt;

    if (canSprint && (move.x != 0.0f || move.y != 0.0f))
    {
        game.stamina = std::max(0.0f, game.stamina - dt * 0.22f);
    }
    else
    {
        game.stamina = std::min(1.0f, game.stamina + dt * 0.12f);
    }

    game.player.x = std::clamp(game.player.x, 25.0f, 1175.0f);
    game.player.y = std::clamp(game.player.y, 180.0f, 695.0f);

    UpdatePhysics(game, dt);
    UpdateAnimals(game, dt);
    UpdateRiverCurrent(game, dt);
    game.messageTimer = std::max(0.0f, game.messageTimer - dt);
}

void RenderGame(HDC dc, const GameState& game, int width, int height)
{
    const COLORREF sky = game.season == Season::Winter ? Rgb(184, 198, 207) : Rgb(201, 185, 141);
    const COLORREF grass = game.season == Season::Winter ? Rgb(217, 223, 216) : Rgb(116, 111, 63);
    const COLORREF river = game.season == Season::Winter ? Rgb(106, 168, 188) : Rgb(71, 127, 150);
    const COLORREF mountain = game.season == Season::Winter ? Rgb(223, 231, 231) : Rgb(141, 134, 121);
    const COLORREF chinar = game.season == Season::Autumn ? Rgb(180, 87, 43) : Rgb(71, 122, 61);

    FillRectF(dc, 0.0f, 0.0f, static_cast<float>(width), static_cast<float>(height), sky);

    for (int i = 0; i < 7; ++i)
    {
        POINT p[3] = {
            {50 + i * 170, 160},
            {140 + i * 170, 45 + (i % 2) * 20},
            {240 + i * 170, 165}
        };
        HBRUSH brush = CreateSolidBrush(mountain);
        HBRUSH oldBrush = static_cast<HBRUSH>(SelectObject(dc, brush));
        Polygon(dc, p, 3);
        SelectObject(dc, oldBrush);
        DeleteObject(brush);
    }

    FillRectF(dc, 0.0f, 155.0f, static_cast<float>(width), static_cast<float>(height - 155), grass);

    DrawRegion(dc, {210, 455, 250, 155}, L"Srinagar Lake District", Rgb(74, 111, 115));
    DrawRegion(dc, {430, 420, 205, 135}, L"Budgam Orchard Plain", Rgb(104, 121, 63));
    DrawRegion(dc, {690, 360, 230, 150}, L"Pahalgam Shepherd River", Rgb(82, 109, 69));
    DrawRegion(dc, {405, 155, 260, 170}, L"Gulmarg Flower Meadow", Rgb(96, 124, 84));
    DrawRegion(dc, {755, 175, 210, 115}, L"Baramulla Trade Road", Rgb(107, 101, 74));
    DrawRegion(dc, {865, 520, 230, 120}, L"Jammu Warm Foothills", Rgb(140, 112, 67));

    DrawLine(dc, {40, 575}, {565, 385}, river, 30);
    DrawLine(dc, {565, 385}, {1160, 315}, river, 30);
    DrawLine(dc, {40, 575}, {565, 385}, Rgb(210, 232, 236), 3);
    DrawLine(dc, {565, 385}, {1160, 315}, Rgb(210, 232, 236), 3);

    FillRectF(dc, Crossing.x - 42.0f, Crossing.y - 9.0f, 84.0f, 18.0f, game.bridgeRepaired ? Rgb(138, 104, 68) : Rgb(79, 61, 46));

    for (int i = 0; i < 34; ++i)
    {
        const float x = 80.0f + static_cast<float>((i * 89) % 1030);
        const float y = 210.0f + static_cast<float>((i * 53) % 390);
        FillRectF(dc, x - 4.0f, y + 12.0f, 8.0f, 24.0f, Rgb(75, 53, 39));
        FillEllipse(dc, x, y, i % 3 == 0 ? 21.0f : 16.0f, i % 3 == 0 ? 21.0f : 16.0f, i % 3 == 0 ? chinar : Rgb(38, 61, 52));
    }

    for (const House& house : game.houses) DrawHouse(dc, house);
    for (const ResourceNode& resource : game.resources) DrawResource(dc, resource);
    for (const Npc& npc : game.npcs) DrawNpc(dc, npc);
    for (const Animal& animal : game.animals) DrawAnimal(dc, animal);
    for (const PhysicsBody& body : game.debris) DrawDebris(dc, body);

    DrawMarker(dc, Crossing, L"Broken crossing", game.bridgeRepaired);
    DrawMarker(dc, WoodPile, L"Wood pile", game.hasWood);
    DrawMarker(dc, FamilyHouse, L"Family house", game.questStep >= 4);
    DrawMarker(dc, RoofRepair, L"Roof repair", game.homeRepaired);
    DrawMarker(dc, StraySheep, L"Stray sheep", game.questStep >= 5);

    FillEllipse(dc, game.player.x, game.player.y, game.playerRadius + 4.0f, game.playerRadius + 4.0f, Rgb(34, 39, 37));
    FillEllipse(dc, game.player.x, game.player.y, game.playerRadius, game.playerRadius, Rgb(40, 93, 114));
    FillEllipse(dc, game.player.x, game.player.y - 15.0f, 8.0f, 8.0f, Rgb(243, 211, 174));

    FillRectF(dc, 0.0f, 0.0f, static_cast<float>(width), 72.0f, Rgb(20, 24, 22));
    wchar_t line[220];
    std::swprintf(line, 220, L"Valleybound C++ Prototype | Season: %ls | Weather: %ls | Time: %02d:00 | Stamina: %d%% | F5 Save / F9 Load",
        SeasonName(game.season),
        WeatherName(game.weather),
        static_cast<int>(game.dayTime),
        static_cast<int>(game.stamina * 100.0f));
    DrawTextLine(dc, 16, 12, line, Rgb(245, 239, 218));

    const wchar_t* quests[] = {
        L"Task: inspect the broken crossing",
        L"Task: collect wood and push debris aside",
        L"Task: repair the crossing",
        L"Task: check the family house",
        L"Task: find Rafiq's stray sheep",
        L"Task: repair the family roof",
        L"Prototype complete: home base secured"
    };
    DrawTextLine(dc, 16, 38, quests[std::clamp(game.questStep, 0, 6)], Rgb(214, 198, 140));

    wchar_t inventoryLine[180];
    std::swprintf(inventoryLine, 180, L"Inventory  Wood:%d  Stone:%d  Herbs:%d  Wool:%d",
        game.inventory.wood,
        game.inventory.stone,
        game.inventory.herbs,
        game.inventory.wool);
    DrawTextLine(dc, 720, 38, inventoryLine, Rgb(196, 214, 186));

    if (game.weather == Weather::Fog)
    {
        for (int y = 96; y < height; y += 36)
        {
            DrawLine(dc, {0.0f, static_cast<float>(y)}, {static_cast<float>(width), static_cast<float>(y + 12)}, Rgb(185, 191, 184), 2);
        }
    }

    if (game.messageTimer > 0.0f)
    {
        FillRectF(dc, 16.0f, 88.0f, 760.0f, 34.0f, Rgb(28, 33, 30));
        DrawTextLine(dc, 28, 96, game.message, Rgb(248, 239, 211));
    }
}
