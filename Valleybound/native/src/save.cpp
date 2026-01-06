#include "save.h"

#include <cstdint>
#include <filesystem>
#include <fstream>

namespace
{
constexpr std::uint32_t SaveMagic = 0x56424E44;
constexpr std::uint32_t SaveVersion = 2;

struct SaveHeader
{
    std::uint32_t magic = SaveMagic;
    std::uint32_t version = SaveVersion;
};

template <typename T>
void WriteValue(std::ofstream& out, const T& value)
{
    out.write(reinterpret_cast<const char*>(&value), sizeof(T));
}

template <typename T>
bool ReadValue(std::ifstream& in, T& value)
{
    in.read(reinterpret_cast<char*>(&value), sizeof(T));
    return static_cast<bool>(in);
}
}

bool SaveGame(const GameState& game, const wchar_t* path)
{
    std::ofstream out(std::filesystem::path(path), std::ios::binary);
    if (!out)
    {
        return false;
    }

    const SaveHeader header;
    WriteValue(out, header);
    WriteValue(out, game.player);
    WriteValue(out, game.stamina);
    WriteValue(out, game.hasWood);
    WriteValue(out, game.bridgeRepaired);
    WriteValue(out, game.homeRepaired);
    WriteValue(out, game.questStep);
    WriteValue(out, game.season);
    WriteValue(out, game.weather);
    WriteValue(out, game.dayTime);
    WriteValue(out, game.inventory);
    const std::uint32_t resourceCount = static_cast<std::uint32_t>(game.resources.size());
    WriteValue(out, resourceCount);
    for (const ResourceNode& resource : game.resources)
    {
        WriteValue(out, resource.depleted);
    }
    return static_cast<bool>(out);
}

bool LoadGame(GameState& game, const wchar_t* path)
{
    std::ifstream in(std::filesystem::path(path), std::ios::binary);
    if (!in)
    {
        return false;
    }

    SaveHeader header;
    if (!ReadValue(in, header) || header.magic != SaveMagic || header.version != SaveVersion)
    {
        return false;
    }

    GameState loaded = game;
    if (!ReadValue(in, loaded.player)) return false;
    if (!ReadValue(in, loaded.stamina)) return false;
    if (!ReadValue(in, loaded.hasWood)) return false;
    if (!ReadValue(in, loaded.bridgeRepaired)) return false;
    if (!ReadValue(in, loaded.homeRepaired)) return false;
    if (!ReadValue(in, loaded.questStep)) return false;
    if (!ReadValue(in, loaded.season)) return false;
    if (!ReadValue(in, loaded.weather)) return false;
    if (!ReadValue(in, loaded.dayTime)) return false;
    if (!ReadValue(in, loaded.inventory)) return false;
    std::uint32_t resourceCount = 0;
    if (!ReadValue(in, resourceCount)) return false;

    loaded.debris = game.debris;
    loaded.animals = game.animals;
    loaded.houses = game.houses;
    loaded.npcs = game.npcs;
    loaded.resources = game.resources;
    if (resourceCount == loaded.resources.size())
    {
        for (ResourceNode& resource : loaded.resources)
        {
            if (!ReadValue(in, resource.depleted)) return false;
        }
    }
    else
    {
        return false;
    }
    game = loaded;
    return true;
}
