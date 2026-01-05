cmake_minimum_required(VERSION 3.20)

project(ValleyboundPrototype LANGUAGES CXX)

add_executable(ValleyboundPrototype WIN32
    src/main.cpp
    src/game.cpp
    src/world.cpp
    src/save.cpp
)

target_compile_features(ValleyboundPrototype PRIVATE cxx_std_17)
target_compile_definitions(ValleyboundPrototype PRIVATE UNICODE _UNICODE)
target_link_libraries(ValleyboundPrototype PRIVATE user32 gdi32)

if(MSVC)
    target_compile_options(ValleyboundPrototype PRIVATE /W4 /permissive-)
else()
    target_compile_options(ValleyboundPrototype PRIVATE -Wall -Wextra -Wpedantic)
endif()
