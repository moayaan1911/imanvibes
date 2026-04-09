#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$ROOT_DIR/scripts/android-env.sh"

cd "$ROOT_DIR"

printf "sdk.dir=%s\n" "$ANDROID_SDK_ROOT" > android/local.properties

"$ROOT_DIR/scripts/android-sync.sh"

cd "$ROOT_DIR/android"
./gradlew assembleDebug
