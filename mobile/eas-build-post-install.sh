#!/usr/bin/env bash
set -euo pipefail

# EAS Build post-install hook.
# Runs after npm/node_modules restore (even when the cache is hit),
# ensuring patch-package always applies our podspec patches.
# See: https://docs.expo.dev/build-reference/npm-hooks/
#
# Note: package.json also has "postinstall": "patch-package" for local dev.
# On EAS Cloud, npm postinstall scripts may already have run, so we reverse
# any applied patches first then re-apply to ensure a clean idempotent state.

echo "[eas-hook] Reversing any previously applied patches (idempotent)..."
npx patch-package --reverse 2>/dev/null || true

echo "[eas-hook] Applying patches via patch-package..."
npx patch-package
echo "[eas-hook] patch-package complete."
