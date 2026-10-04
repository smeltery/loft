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
cp "$root/apps/macos/Resources/"*.icns "$dest/Resources/"
appex="$dest/PlugIns/LoftProvider.appex/Contents"
mkdir -p "$appex/MacOS"
cp .build/release/LoftProvider "$appex/MacOS/LoftProvider"
cp Info-provider.plist "$appex/Info.plist"
mkdir -p "$appex/Resources"
cp "$root/apps/macos/Resources/Loft.icns" "$appex/Resources/"
if xcrun --find actool >/dev/null 2>&1; then
  partial="$(mktemp -t loft-icon-plist)"
  trap 'rm -f "$partial"' EXIT
  xcrun actool "$root/apps/macos/Resources/Loft.icon" \
    --compile "$dest/Resources" --platform macosx --minimum-deployment-target 14.0 \
    --target-device mac --app-icon Loft --output-partial-info-plist "$partial" \
    --output-format human-readable-text
  /usr/libexec/PlistBuddy -c "Merge $partial" "$dest/Info.plist"
  xcrun actool "$root/apps/macos/Resources/Brand.xcassets" \
    --compile "$appex/Resources" --platform macosx --minimum-deployment-target 14.0 \
    --target-device mac --output-format human-readable-text
else
  # Command Line Tools omit actool; never claim the sidebar symbol was built.
  rm -f "$appex/Resources/Assets.car" "$dest/Resources/Assets.car"
  /usr/libexec/PlistBuddy -c 'Delete :CFBundleIcons' "$appex/Info.plist"
  echo "warning: layered app icon and Finder symbol require Xcode 26+; using legacy icons" >&2
fi
if command -v codesign >/dev/null; then
  codesign --force --sign - --entitlements LoftProvider.entitlements "$dest/PlugIns/LoftProvider.appex"
  codesign --force --sign - --entitlements Loft.entitlements "$root/dist/Loft.app"
fi
echo "built $root/dist/Loft.app"
