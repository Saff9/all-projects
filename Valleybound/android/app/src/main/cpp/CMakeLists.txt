cmake_minimum_required(VERSION 3.22.1)

project(valleybound_android LANGUAGES C CXX)

set(NATIVE_APP_GLUE "${ANDROID_NDK}/sources/android/native_app_glue")

add_library(native_app_glue STATIC
    "${NATIVE_APP_GLUE}/android_native_app_glue.c"
)

target_include_directories(native_app_glue PUBLIC "${NATIVE_APP_GLUE}")

add_library(valleybound SHARED
    android_main.cpp
    game_state.cpp
)

target_compile_features(valleybound PRIVATE cxx_std_17)
target_include_directories(valleybound PRIVATE "${NATIVE_APP_GLUE}")

find_library(android-lib android)
find_library(egl-lib EGL)
find_library(gles-lib GLESv2)
find_library(log-lib log)

target_link_libraries(valleybound
    native_app_glue
    ${android-lib}
    ${egl-lib}
    ${gles-lib}
    ${log-lib}
)
