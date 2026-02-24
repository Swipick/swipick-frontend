#!/bin/bash
set -e

echo "🧹 Cleaning up old processes..."
killall -9 node Simulator "Expo Go" 2>/dev/null || true
sleep 2

echo "📱 Opening Simulator..."
open -a Simulator
sleep 3

echo "🗑️  Uninstalling old app..."
xcrun simctl uninstall booted com.zenotomiolo.swipick 2>/dev/null || true

echo "📦 Installing fresh build..."
xcrun simctl install booted /Users/ashm4/Projects/swipick-frontend/swipick-mobile/ios/build/Build/Products/Debug-iphonesimulator/Swipick.app

echo "✅ Fresh app installed! Now starting Metro..."
npx expo start
