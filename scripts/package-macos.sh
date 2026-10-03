#!/usr/bin/env bash
# Build Loft.app from the Swift package. macOS only.
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root/apps/macos"
swift build -c release --product Loft
bin=".build/release/Loft"
dest="$root/dist/Loft.app/Contents"
mkdir -p "$dest/MacOS"
cp "$bin" "$dest/MacOS/Loft"
cp Info.plist "$dest/Info.plist"
echo "built $root/dist/Loft.app"
