cmake_minimum_required(VERSION 3.16)
project(viralclip LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

find_package(CURL REQUIRED)
find_package(Threads REQUIRED)

add_executable(viralclip
    src/main.cpp
    src/config.cpp
    src/downloader.cpp
    src/transcriber.cpp
    src/analyzer.cpp
    src/clipper.cpp
    src/server.cpp
    src/utils.cpp
)

target_include_directories(viralclip PRIVATE
    ${CMAKE_SOURCE_DIR}/include
    ${CURL_INCLUDE_DIRS}
)

target_link_libraries(viralclip PRIVATE
    CURL::libcurl
    Threads::Threads
    dl
)
