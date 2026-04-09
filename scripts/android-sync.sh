#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$ROOT_DIR/scripts/android-env.sh"

cd "$ROOT_DIR"

CAPACITOR_EXPORT=1 npm run build:capacitor

rm -rf \
  "$ROOT_DIR/out/og" \
  "$ROOT_DIR/out/opengraph-image" \
  "$ROOT_DIR/out/temp" \
  "$ROOT_DIR/out/screenshots" \
  "$ROOT_DIR/out/llms.txt" \
  "$ROOT_DIR/out/robots.txt" \
  "$ROOT_DIR/out/sitemap.xml" \
  "$ROOT_DIR/out/manifest.webmanifest" \
  "$ROOT_DIR/out/sw.js" \
  "$ROOT_DIR/out/favicon.ico" \
  "$ROOT_DIR/out/file.svg" \
  "$ROOT_DIR/out/globe.svg" \
  "$ROOT_DIR/out/next.svg" \
  "$ROOT_DIR/out/vercel.svg" \
  "$ROOT_DIR/out/window.svg" \
  "$ROOT_DIR/out/icon1Circular.png" \
  "$ROOT_DIR/out/icon1Original.png" \
  "$ROOT_DIR/out/icon2Original.png"

npx cap sync android
