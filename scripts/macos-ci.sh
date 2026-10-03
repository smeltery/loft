#!/usr/bin/env bash
# Run Swift tests/build on macOS; skip on other hosts so Linux CI stays green.
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
cmd="${1:-test}"

if [ "$(uname -s)" != "Darwin" ]; then
  echo "macos: skip $cmd on $(uname -s)"
  exit 0
fi

cd "$root/apps/macos"
case "$cmd" in
  test) swift run LoftKitCheck && swift build --product Loft && swift build --product LoftProvider ;;
  build) swift build --product Loft && swift build --product LoftProvider ;;
  *) echo "usage: $0 test|build" >&2; exit 1 ;;
esac
