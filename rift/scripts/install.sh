#!/bin/sh
# rift install script
# usage: curl -fsSL https://raw.githubusercontent.com/Saff9/rift/main/scripts/install.sh | sh
# or:   sh install.sh [version]
#
# downloads the latest rift binary for your platform and installs it
# to /usr/local/bin (or ~/.local/bin if no sudo).

set -e

VERSION="${1:-latest}"
PREFIX="${PREFIX:-/usr/local/bin}"

# detect platform
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

case "$OS" in
    linux)  OS=linux ;;
    darwin) OS=macos ;;
    *) echo "error: unsupported OS: $OS" >&2; exit 1 ;;
esac

case "$ARCH" in
    x86_64|amd64) ARCH=x86_64 ;;
    aarch64|arm64) ARCH=aarch64 ;;
    *) echo "error: unsupported arch: $ARCH" >&2; exit 1 ;;
esac

if [ "$VERSION" = "latest" ]; then
    URL="https://github.com/Saff9/rift/releases/latest/download/rift-${OS}-${ARCH}"
else
    URL="https://github.com/Saff9/rift/releases/download/${VERSION}/rift-${OS}-${ARCH}"
fi

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

echo "downloading rift $VERSION for $OS/$ARCH..."
if command -v curl >/dev/null 2>&1; then
    curl -fsSL -o "$TMP/rift" "$URL"
elif command -v wget >/dev/null 2>&1; then
    wget -qO "$TMP/rift" "$URL"
else
    echo "error: need curl or wget" >&2
    exit 1
fi

chmod +x "$TMP/rift"

# try /usr/local/bin first, fall back to ~/.local/bin
if [ -w "$PREFIX" ] 2>/dev/null; then
    mv "$TMP/rift" "$PREFIX/rift"
    BIN="$PREFIX/rift"
else
    echo "no write access to $PREFIX, using ~/.local/bin"
    mkdir -p "$HOME/.local/bin"
    mv "$TMP/rift" "$HOME/.local/bin/rift"
    BIN="$HOME/.local/bin/rift"
    case ":$PATH:" in
        *":$HOME/.local/bin:"*) ;;
        *) echo "note: add ~/.local/bin to your PATH" >&2 ;;
    esac
fi

echo "installed: $BIN"
"$BIN" --version
