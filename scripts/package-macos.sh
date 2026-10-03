#!/usr/bin/env bash
# Build Loft.app from the Swift package. macOS only.
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root/apps/macos"
swift build -c release --product Loft
swift build -c release --product LoftProvider
bin=".build/release/Loft"
dest="$root/dist/Loft.app/Contents"
mkdir -p "$dest/MacOS"
cp "$bin" "$dest/MacOS/Loft"
cp Info.plist "$dest/Info.plist"
mkdir -p "$dest/Resources"
cp "$root/apps/macos/Resources/"*.png "$dest/Resources/"
appex="$dest/PlugIns/LoftProvider.appex/Contents"
mkdir -p "$appex/MacOS"
cp .build/release/LoftProvider "$appex/MacOS/LoftProvider"
cp Info-provider.plist "$appex/Info.plist"
if command -v codesign >/dev/null; then
  codesign --force --sign - --entitlements LoftProvider.entitlements "$dest/PlugIns/LoftProvider.appex"
  codesign --force --sign - --entitlements Loft.entitlements "$root/dist/Loft.app"
fi
echo "built $root/dist/Loft.app"
