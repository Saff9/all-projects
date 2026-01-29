#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"
export PATH="$HOME/.deno/bin:$PATH"
echo "Starting ViralClip Engine..."
echo "Web UI: http://localhost:${1:-8080}"
echo ""
./build/viralclip "${1:-8080}"
