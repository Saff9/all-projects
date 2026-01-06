#pragma once

#include "game.h"

bool SaveGame(const GameState& game, const wchar_t* path);
bool LoadGame(GameState& game, const wchar_t* path);
