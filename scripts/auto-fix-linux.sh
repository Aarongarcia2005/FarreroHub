#!/usr/bin/env bash
# Auto-fix script for Linux hosts/containers
# Usage: run from project root: sudo ./scripts/auto-fix-linux.sh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BIN_DIR="$ROOT_DIR/bin"

echo "[fix] Running auto-fix in $ROOT_DIR"

mkdir -p "$BIN_DIR"

install_pkg() {
  echo "[fix] Installing packages: $*"
  if command -v apt-get >/dev/null 2>&1; then
    DEBIAN_FRONTEND=noninteractive apt-get update -y
    apt-get install -y "$@"
  elif command -v apk >/dev/null 2>&1; then
    apk add --no-cache "$@"
  elif command -v yum >/dev/null 2>&1; then
    yum install -y "$@"
  else
    echo "[fix] No supported package manager found (apt/yum/apk). Install python3, pip and ffmpeg manually." >&2
    return 1
  fi
}

echo "[fix] Installing Python3 and ffmpeg (requires root)"
install_pkg python3 python3-dev python3-pip ffmpeg || true

echo "[fix] Ensure pip is available"
if command -v python3 >/dev/null 2>&1 && ! command -v pip3 >/dev/null 2>&1; then
  python3 -m ensurepip --upgrade || true
  python3 -m pip install -U pip || true
fi

echo "[fix] Downloading yt-dlp into ./bin"
YTDLP="$BIN_DIR/yt-dlp"
curl -L -o "$YTDLP" "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp" --fail
chmod +x "$YTDLP"

echo "[fix] Installing node dependencies"
if command -v npm >/dev/null 2>&1; then
  npm install --omit=dev
else
  echo "[fix] npm not found. Please install Node.js and npm, then run 'npm install'" >&2
fi

echo "[fix] Completed. Restart your bot (for example: node index.js)"
echo "[fix] If you run into YouTube CAPTCHA errors, export a cookies.txt file from your browser and place it at the project root." 
