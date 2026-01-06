#include "game.h"
#include "save.h"

#include <windows.h>

namespace
{
GameState gGame;
InputState gInput;
bool gRunning = true;
const wchar_t SavePath[] = L"valleybound_save.dat";

struct BackBuffer
{
    HDC dc = nullptr;
    HBITMAP bitmap = nullptr;
    HGDIOBJ oldBitmap = nullptr;
    int width = 0;
    int height = 0;
};

BackBuffer gBackBuffer;

void ReleaseBackBuffer()
{
    if (gBackBuffer.dc)
    {
        SelectObject(gBackBuffer.dc, gBackBuffer.oldBitmap);
        DeleteObject(gBackBuffer.bitmap);
        DeleteDC(gBackBuffer.dc);
        gBackBuffer = {};
    }
}

void ResizeBackBuffer(HDC windowDc, int width, int height)
{
    if (gBackBuffer.dc && gBackBuffer.width == width && gBackBuffer.height == height)
    {
        return;
    }

    ReleaseBackBuffer();
    gBackBuffer.dc = CreateCompatibleDC(windowDc);
    gBackBuffer.bitmap = CreateCompatibleBitmap(windowDc, width, height);
    gBackBuffer.oldBitmap = SelectObject(gBackBuffer.dc, gBackBuffer.bitmap);
    gBackBuffer.width = width;
    gBackBuffer.height = height;
}

LRESULT CALLBACK WindowProc(HWND hwnd, UINT message, WPARAM wParam, LPARAM lParam)
{
    switch (message)
    {
    case WM_DESTROY:
        SaveGame(gGame, SavePath);
        ReleaseBackBuffer();
        gRunning = false;
        PostQuitMessage(0);
        return 0;
    case WM_KEYDOWN:
        if ((lParam & (1 << 30)) == 0)
        {
            if (wParam == 'F') gInput.interactPressed = true;
            if (wParam == VK_F5) gInput.savePressed = true;
            if (wParam == VK_F9) gInput.loadPressed = true;
        }
        if (wParam == VK_ESCAPE)
        {
            gRunning = false;
            DestroyWindow(hwnd);
        }
        if (wParam == '1') gGame.season = Season::Spring;
        if (wParam == '2') gGame.season = Season::Summer;
        if (wParam == '3') gGame.season = Season::Autumn;
        if (wParam == '4') gGame.season = Season::Winter;
        return 0;
    default:
        return DefWindowProcW(hwnd, message, wParam, lParam);
    }
}

void PollInput()
{
    gInput.up = (GetAsyncKeyState('W') & 0x8000) || (GetAsyncKeyState(VK_UP) & 0x8000);
    gInput.down = (GetAsyncKeyState('S') & 0x8000) || (GetAsyncKeyState(VK_DOWN) & 0x8000);
    gInput.left = (GetAsyncKeyState('A') & 0x8000) || (GetAsyncKeyState(VK_LEFT) & 0x8000);
    gInput.right = (GetAsyncKeyState('D') & 0x8000) || (GetAsyncKeyState(VK_RIGHT) & 0x8000);
    gInput.sprint = (GetAsyncKeyState(VK_SHIFT) & 0x8000) != 0;
}
}

int WINAPI wWinMain(HINSTANCE instance, HINSTANCE, PWSTR, int showCommand)
{
    const wchar_t className[] = L"ValleyboundPrototypeWindow";

    WNDCLASSW wc = {};
    wc.lpfnWndProc = WindowProc;
    wc.hInstance = instance;
    wc.lpszClassName = className;
    wc.hCursor = LoadCursor(nullptr, IDC_ARROW);
    wc.hbrBackground = reinterpret_cast<HBRUSH>(COLOR_WINDOW + 1);
    RegisterClassW(&wc);

    HWND hwnd = CreateWindowExW(
        0,
        className,
        L"Valleybound - Native C++ Prototype",
        WS_OVERLAPPEDWINDOW | WS_VISIBLE,
        CW_USEDEFAULT,
        CW_USEDEFAULT,
        1280,
        800,
        nullptr,
        nullptr,
        instance,
        nullptr);

    if (!hwnd)
    {
        return 1;
    }

    ShowWindow(hwnd, showCommand);
    InitGame(gGame);
    LoadGame(gGame, SavePath);

    LARGE_INTEGER frequency;
    LARGE_INTEGER lastCounter;
    QueryPerformanceFrequency(&frequency);
    QueryPerformanceCounter(&lastCounter);
    float accumulator = 0.0f;
    constexpr float fixedStep = 1.0f / 60.0f;

    MSG msg = {};
    while (gRunning)
    {
        while (PeekMessageW(&msg, nullptr, 0, 0, PM_REMOVE))
        {
            TranslateMessage(&msg);
            DispatchMessageW(&msg);
        }

        LARGE_INTEGER currentCounter;
        QueryPerformanceCounter(&currentCounter);
        float dt = static_cast<float>(currentCounter.QuadPart - lastCounter.QuadPart) / static_cast<float>(frequency.QuadPart);
        lastCounter = currentCounter;
        if (dt > 0.25f) dt = 0.25f;
        accumulator += dt;

        PollInput();
        if (gInput.savePressed)
        {
            SaveGame(gGame, SavePath);
            gInput.savePressed = false;
        }
        if (gInput.loadPressed)
        {
            LoadGame(gGame, SavePath);
            gInput.loadPressed = false;
        }
        while (accumulator >= fixedStep)
        {
            UpdateGame(gGame, gInput, fixedStep);
            gInput.interactPressed = false;
            accumulator -= fixedStep;
        }
        gInput.interactPressed = false;

        RECT client;
        GetClientRect(hwnd, &client);
        const int width = client.right - client.left;
        const int height = client.bottom - client.top;

        HDC windowDc = GetDC(hwnd);
        ResizeBackBuffer(windowDc, width, height);

        RenderGame(gBackBuffer.dc, gGame, width, height);
        BitBlt(windowDc, 0, 0, width, height, gBackBuffer.dc, 0, 0, SRCCOPY);
        ReleaseDC(hwnd, windowDc);

        Sleep(1);
    }

    SaveGame(gGame, SavePath);
    ReleaseBackBuffer();
    return 0;
}
