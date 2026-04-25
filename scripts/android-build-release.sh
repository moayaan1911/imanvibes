#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$ROOT_DIR/scripts/android-env.sh"

cd "$ROOT_DIR"

VERSION="$(node -p "require('./package.json').version")"
OUTPUT_DIR="$ROOT_DIR/release"
OUTPUT_APK="$OUTPUT_DIR/imanvibes-${VERSION}.apk"

printf "sdk.dir=%s\n" "$ANDROID_SDK_ROOT" > android/local.properties

"$ROOT_DIR/scripts/android-sync.sh"

cd "$ROOT_DIR/android"
./gradlew assembleRelease

mkdir -p "$OUTPUT_DIR"
cp "$ROOT_DIR/android/app/build/outputs/apk/release/app-release.apk" "$OUTPUT_APK"

printf "%s\n" "$OUTPUT_APK"
