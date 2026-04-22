#!/usr/bin/env bash
set -euo pipefail

echo "[eas-hook] Running patch-package to apply podspec patches..."
npx patch-package
echo "[eas-hook] patch-package complete."
