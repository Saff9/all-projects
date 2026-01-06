#pragma once

#include "game.h"

void CreatePrototypeWorld(GameState& game);
bool CrossingCleared(const GameState& game);
float Distance(Vec2 a, Vec2 b);
Vec2 Normalize(Vec2 v);
