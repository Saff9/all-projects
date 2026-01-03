#include "game_state.h"

#include <EGL/egl.h>
#include <GLES2/gl2.h>
#include <android/log.h>
#include <android_native_app_glue.h>

#include <chrono>
#include <cmath>
#include <vector>

#define LOGI(...) ((void)__android_log_print(ANDROID_LOG_INFO, "Valleybound", __VA_ARGS__))

namespace
{
struct Engine
{
    android_app* app = nullptr;
    EGLDisplay display = EGL_NO_DISPLAY;
    EGLSurface surface = EGL_NO_SURFACE;
    EGLContext context = EGL_NO_CONTEXT;
    int width = 0;
    int height = 0;
    bool ready = false;
    GLuint program = 0;
    GLint posLoc = -1;
    GLint colorLoc = -1;
    GameState game;
    TouchInput input;
    bool hasGame = false;
};

constexpr float WorldW = 1200.0f;
constexpr float WorldH = 720.0f;

float ToX(float x)
{
    return (x / WorldW) * 2.0f - 1.0f;
}

float ToY(float y)
{
    return 1.0f - (y / WorldH) * 2.0f;
}

GLuint CompileShader(GLenum type, const char* source)
{
    GLuint shader = glCreateShader(type);
    glShaderSource(shader, 1, &source, nullptr);
    glCompileShader(shader);
    return shader;
}

void DrawTriangles(Engine& engine, const std::vector<float>& vertices, float r, float g, float b)
{
    glUseProgram(engine.program);
    glUniform4f(engine.colorLoc, r, g, b, 1.0f);
    glVertexAttribPointer(engine.posLoc, 2, GL_FLOAT, GL_FALSE, 0, vertices.data());
    glEnableVertexAttribArray(engine.posLoc);
    glDrawArrays(GL_TRIANGLES, 0, static_cast<GLsizei>(vertices.size() / 2));
}

void DrawRect(Engine& engine, float x, float y, float w, float h, float r, float g, float b)
{
    const float x0 = ToX(x);
    const float y0 = ToY(y);
    const float x1 = ToX(x + w);
    const float y1 = ToY(y + h);
    const std::vector<float> v = {
        x0, y0, x1, y0, x1, y1,
        x0, y0, x1, y1, x0, y1
    };
    DrawTriangles(engine, v, r, g, b);
}

void DrawCircle(Engine& engine, float x, float y, float radius, float r, float g, float b)
{
    std::vector<float> v;
    constexpr int segments = 24;
    for (int i = 0; i < segments; ++i)
    {
        const float a0 = (static_cast<float>(i) / segments) * 6.2831853f;
        const float a1 = (static_cast<float>(i + 1) / segments) * 6.2831853f;
        v.push_back(ToX(x));
        v.push_back(ToY(y));
        v.push_back(ToX(x + std::cos(a0) * radius));
        v.push_back(ToY(y + std::sin(a0) * radius));
        v.push_back(ToX(x + std::cos(a1) * radius));
        v.push_back(ToY(y + std::sin(a1) * radius));
    }
    DrawTriangles(engine, v, r, g, b);
}

void DrawLineRect(Engine& engine, float x0, float y0, float x1, float y1, float width, float r, float g, float b)
{
    const float dx = x1 - x0;
    const float dy = y1 - y0;
    const float len = std::sqrt(dx * dx + dy * dy);
    if (len <= 0.001f) return;
    const float nx = -dy / len * width * 0.5f;
    const float ny = dx / len * width * 0.5f;
    const std::vector<float> v = {
        ToX(x0 + nx), ToY(y0 + ny), ToX(x1 + nx), ToY(y1 + ny), ToX(x1 - nx), ToY(y1 - ny),
        ToX(x0 + nx), ToY(y0 + ny), ToX(x1 - nx), ToY(y1 - ny), ToX(x0 - nx), ToY(y0 - ny)
    };
    DrawTriangles(engine, v, r, g, b);
}

bool InitDisplay(Engine& engine)
{
    const EGLint attribs[] = {
        EGL_RENDERABLE_TYPE, EGL_OPENGL_ES2_BIT,
        EGL_SURFACE_TYPE, EGL_WINDOW_BIT,
        EGL_BLUE_SIZE, 8,
        EGL_GREEN_SIZE, 8,
        EGL_RED_SIZE, 8,
        EGL_DEPTH_SIZE, 0,
        EGL_NONE
    };
    EGLint format;
    EGLint numConfigs;
    EGLConfig config;

    engine.display = eglGetDisplay(EGL_DEFAULT_DISPLAY);
    eglInitialize(engine.display, nullptr, nullptr);
    eglChooseConfig(engine.display, attribs, &config, 1, &numConfigs);
    eglGetConfigAttrib(engine.display, config, EGL_NATIVE_VISUAL_ID, &format);
    ANativeWindow_setBuffersGeometry(engine.app->window, 0, 0, format);

    const EGLint contextAttribs[] = {EGL_CONTEXT_CLIENT_VERSION, 2, EGL_NONE};
    engine.surface = eglCreateWindowSurface(engine.display, config, engine.app->window, nullptr);
    engine.context = eglCreateContext(engine.display, config, nullptr, contextAttribs);
    eglMakeCurrent(engine.display, engine.surface, engine.surface, engine.context);
    eglQuerySurface(engine.display, engine.surface, EGL_WIDTH, &engine.width);
    eglQuerySurface(engine.display, engine.surface, EGL_HEIGHT, &engine.height);

    const char* vs = "attribute vec2 aPos; void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }";
    const char* fs = "precision mediump float; uniform vec4 uColor; void main(){ gl_FragColor = uColor; }";
    GLuint vert = CompileShader(GL_VERTEX_SHADER, vs);
    GLuint frag = CompileShader(GL_FRAGMENT_SHADER, fs);
    engine.program = glCreateProgram();
    glAttachShader(engine.program, vert);
    glAttachShader(engine.program, frag);
    glLinkProgram(engine.program);
    glDeleteShader(vert);
    glDeleteShader(frag);
    engine.posLoc = glGetAttribLocation(engine.program, "aPos");
    engine.colorLoc = glGetUniformLocation(engine.program, "uColor");

    glViewport(0, 0, engine.width, engine.height);
    engine.ready = true;
    return true;
}

void TermDisplay(Engine& engine)
{
    if (engine.display != EGL_NO_DISPLAY)
    {
        eglMakeCurrent(engine.display, EGL_NO_SURFACE, EGL_NO_SURFACE, EGL_NO_CONTEXT);
        if (engine.context != EGL_NO_CONTEXT) eglDestroyContext(engine.display, engine.context);
        if (engine.surface != EGL_NO_SURFACE) eglDestroySurface(engine.display, engine.surface);
        eglTerminate(engine.display);
    }
    engine.ready = false;
    engine.display = EGL_NO_DISPLAY;
    engine.context = EGL_NO_CONTEXT;
    engine.surface = EGL_NO_SURFACE;
}

void Render(Engine& engine)
{
    if (!engine.ready) return;

    glViewport(0, 0, engine.width, engine.height);
    glClearColor(0.12f, 0.14f, 0.12f, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT);

    DrawRect(engine, 0, 0, WorldW, 155, 0.79f, 0.73f, 0.55f);
    DrawRect(engine, 0, 155, WorldW, WorldH - 155, 0.45f, 0.44f, 0.25f);

    for (int i = 0; i < 7; ++i)
    {
        DrawCircle(engine, 140.0f + i * 170.0f, 130.0f, 92.0f, 0.55f, 0.53f, 0.47f);
        DrawCircle(engine, 140.0f + i * 170.0f, 68.0f, 26.0f, 0.93f, 0.91f, 0.87f);
    }

    DrawRect(engine, 210, 455, 250, 155, 0.29f, 0.44f, 0.45f);
    DrawRect(engine, 430, 420, 205, 135, 0.41f, 0.47f, 0.25f);
    DrawRect(engine, 690, 360, 230, 150, 0.32f, 0.43f, 0.27f);
    DrawRect(engine, 405, 155, 260, 170, 0.38f, 0.49f, 0.33f);
    DrawRect(engine, 755, 175, 210, 115, 0.42f, 0.40f, 0.29f);
    DrawRect(engine, 865, 520, 230, 120, 0.55f, 0.44f, 0.26f);

    DrawLineRect(engine, 40, 575, 565, 385, 30, 0.28f, 0.50f, 0.59f);
    DrawLineRect(engine, 565, 385, 1160, 315, 30, 0.28f, 0.50f, 0.59f);
    DrawLineRect(engine, 40, 575, 565, 385, 3, 0.82f, 0.91f, 0.93f);
    DrawLineRect(engine, 565, 385, 1160, 315, 3, 0.82f, 0.91f, 0.93f);

    DrawRect(engine, 523, 376, 84, 18, engine.game.bridgeRepaired ? 0.54f : 0.31f, 0.24f, 0.18f);

    for (int i = 0; i < 34; ++i)
    {
        const float x = 80.0f + static_cast<float>((i * 89) % 1030);
        const float y = 210.0f + static_cast<float>((i * 53) % 390);
        DrawRect(engine, x - 4, y + 12, 8, 24, 0.29f, 0.21f, 0.15f);
        if (i % 3 == 0) DrawCircle(engine, x, y, 21, 0.70f, 0.34f, 0.17f);
        else DrawCircle(engine, x, y, 16, 0.15f, 0.24f, 0.20f);
    }

    const std::array<Vec2, 7> houses = {{{175,500}, {235,520}, {318,350}, {492,470}, {548,505}, {850,220}, {920,560}}};
    for (Vec2 h : houses)
    {
        DrawRect(engine, h.x - 22, h.y - 14, 44, 32, 0.56f, 0.39f, 0.26f);
        DrawCircle(engine, h.x, h.y - 18, 28, 0.35f, 0.20f, 0.15f);
    }

    for (const Resource& resource : engine.game.resources)
    {
        if (resource.depleted) continue;
        if (resource.kind == ResourceKind::Wood) DrawCircle(engine, resource.p.x, resource.p.y, 10, 0.53f, 0.35f, 0.20f);
        if (resource.kind == ResourceKind::Stone) DrawCircle(engine, resource.p.x, resource.p.y, 10, 0.53f, 0.52f, 0.48f);
        if (resource.kind == ResourceKind::Herbs) DrawCircle(engine, resource.p.x, resource.p.y, 10, 0.34f, 0.59f, 0.30f);
    }

    for (const Body& body : engine.game.debris)
    {
        DrawCircle(engine, body.p.x, body.p.y, body.radius, 0.50f, 0.34f, 0.22f);
    }

    for (const Animal& animal : engine.game.animals)
    {
        if (animal.kind == AnimalKind::Sheep) DrawCircle(engine, animal.p.x, animal.p.y, 14, 0.93f, 0.90f, 0.85f);
        else DrawCircle(engine, animal.p.x, animal.p.y, 18, 0.54f, 0.42f, 0.29f);
    }

    for (const Marker& marker : engine.game.markers)
    {
        DrawCircle(engine, marker.p.x, marker.p.y, 7, 0.91f, 0.76f, 0.35f);
    }

    DrawCircle(engine, engine.game.player.x, engine.game.player.y, 17, 0.13f, 0.15f, 0.14f);
    DrawCircle(engine, engine.game.player.x, engine.game.player.y, 13, 0.16f, 0.36f, 0.45f);
    DrawCircle(engine, engine.game.player.x, engine.game.player.y - 15, 8, 0.95f, 0.83f, 0.68f);

    DrawCircle(engine, 110, 610, 42, 0.13f, 0.15f, 0.14f);
    DrawCircle(engine, 110 + engine.input.move.x * 24.0f, 610 + engine.input.move.y * 24.0f, 18, 0.84f, 0.77f, 0.55f);
    DrawCircle(engine, 1080, 610, 42, 0.55f, 0.40f, 0.25f);

    eglSwapBuffers(engine.display, engine.surface);
}

void HandleCommand(android_app* app, int32_t cmd)
{
    Engine* engine = static_cast<Engine*>(app->userData);
    if (cmd == APP_CMD_INIT_WINDOW && app->window)
    {
        InitDisplay(*engine);
    }
    else if (cmd == APP_CMD_TERM_WINDOW)
    {
        TermDisplay(*engine);
    }
}

int32_t HandleInput(android_app* app, AInputEvent* event)
{
    Engine* engine = static_cast<Engine*>(app->userData);
    if (AInputEvent_getType(event) != AINPUT_EVENT_TYPE_MOTION) return 0;

    const int action = AMotionEvent_getAction(event) & AMOTION_EVENT_ACTION_MASK;
    const float x = AMotionEvent_getX(event, 0);
    const float y = AMotionEvent_getY(event, 0);

    if (action == AMOTION_EVENT_ACTION_UP || action == AMOTION_EVENT_ACTION_CANCEL)
    {
        engine->input.move = {};
        return 1;
    }

    if (x < engine->width * 0.45f)
    {
        const float nx = (x - engine->width * 0.18f) / (engine->width * 0.12f);
        const float ny = (y - engine->height * 0.76f) / (engine->height * 0.18f);
        engine->input.move = {std::fmax(-1.0f, std::fmin(1.0f, nx)), std::fmax(-1.0f, std::fmin(1.0f, ny))};
    }
    else if (action == AMOTION_EVENT_ACTION_DOWN)
    {
        engine->input.actionPressed = true;
    }

    return 1;
}
}

void android_main(android_app* app)
{
    app_dummy();

    Engine engine;
    engine.app = app;
    app->userData = &engine;
    app->onAppCmd = HandleCommand;
    app->onInputEvent = HandleInput;
    InitGame(engine.game);

    auto last = std::chrono::steady_clock::now();
    float accumulator = 0.0f;
    constexpr float fixedStep = 1.0f / 60.0f;

    while (true)
    {
        int events;
        android_poll_source* source;
        while (ALooper_pollOnce(engine.ready ? 0 : -1, nullptr, &events, reinterpret_cast<void**>(&source)) >= 0)
        {
            if (source) source->process(app, source);
            if (app->destroyRequested)
            {
                TermDisplay(engine);
                return;
            }
        }

        const auto now = std::chrono::steady_clock::now();
        float dt = std::chrono::duration<float>(now - last).count();
        last = now;
        if (dt > 0.25f) dt = 0.25f;
        accumulator += dt;

        while (accumulator >= fixedStep)
        {
            UpdateGame(engine.game, engine.input, fixedStep);
            engine.input.actionPressed = false;
            accumulator -= fixedStep;
        }

        Render(engine);
    }
}
