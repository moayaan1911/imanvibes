#!/usr/bin/env bash

set -euo pipefail

if [[ -z "${JAVA_HOME:-}" ]]; then
  if command -v brew >/dev/null 2>&1; then
    BREW_JAVA_PREFIX="$(brew --prefix openjdk@21 2>/dev/null || true)"
    if [[ -n "$BREW_JAVA_PREFIX" && -d "$BREW_JAVA_PREFIX/libexec/openjdk.jdk/Contents/Home" ]]; then
      export JAVA_HOME="$BREW_JAVA_PREFIX/libexec/openjdk.jdk/Contents/Home"
    fi
  fi
fi

if [[ -z "${ANDROID_SDK_ROOT:-}" ]]; then
  if [[ -d "/opt/homebrew/share/android-commandlinetools" ]]; then
    export ANDROID_SDK_ROOT="/opt/homebrew/share/android-commandlinetools"
  elif [[ -d "$HOME/Library/Android/sdk" ]]; then
    export ANDROID_SDK_ROOT="$HOME/Library/Android/sdk"
  fi
fi

if [[ -z "${JAVA_HOME:-}" || ! -d "${JAVA_HOME}" ]]; then
  echo "JAVA_HOME is not configured. Install a JDK first." >&2
  exit 1
fi

if [[ -z "${ANDROID_SDK_ROOT:-}" || ! -d "${ANDROID_SDK_ROOT}" ]]; then
  echo "ANDROID_SDK_ROOT is not configured. Install Android SDK command-line tools first." >&2
  exit 1
fi

export PATH="$JAVA_HOME/bin:$PATH"
