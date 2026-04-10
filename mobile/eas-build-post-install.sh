#!/usr/bin/env bash
set -euo pipefail

# EAS Build post-install hook.
# Runs after npm/node_modules restore (even when the cache is hit),
# ensuring patch-package always applies our podspec patches.
# See: https://docs.expo.dev/build-reference/npm-hooks/

echo "[eas-hook] Running patch-package to apply podspec patches..."
npx patch-package
echo "[eas-hook] patch-package complete."
