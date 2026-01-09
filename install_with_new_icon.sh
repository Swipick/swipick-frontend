#!/bin/bash
set -e

echo "🎨 Installing Swipick with new icon..."

# Wait for build to complete
if [ ! -f "ios/build/Build/Products/Debug-iphonesimulator/Swipick.app/Info.plist" ]; then
  echo "❌ Build not complete. Please wait for xcodebuild to finish."
  exit 1
fi

echo "✅ Build found!"

# Kill old processes
echo "🧹 Cleaning up old processes..."
killall -9 node Simulator 2>/dev/null || true
sleep 2

# Open simulator
echo "📱 Opening Simulator..."
open -a Simulator
sleep 3

# Uninstall old app
echo "🗑️  Uninstalling old app..."
xcrun simctl uninstall booted com.swipick.app 2>/dev/null || true

# Install new app with new icon
echo "📦 Installing new app with updated icon..."
xcrun simctl install booted ios/build/Build/Products/Debug-iphonesimulator/Swipick.app

echo "🚀 Launching app..."
xcrun simctl launch booted com.swipick.app

echo ""
echo "✨ Done! Your new icon should now be visible on the home screen!"
echo "💡 Press ⌘+Shift+H to go to home screen and see your new icon"
