#!/bin/bash
# Build nearU for native platforms
# Usage: ./scripts/build-native.sh [android|ios|all]

set -e

PLATFORM=${1:-all}
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "=== Building web assets (Next.js static export) ==="
npm run build

echo "=== Syncing web assets to native platforms ==="
npx cap sync

case $PLATFORM in
  android)
    echo "=== Opening Android Studio ==="
    npx cap open android
    ;;
  ios)
    # Requires macOS with Xcode installed
    if [[ "$OSTYPE" == "darwin"* ]]; then
      echo "=== Opening Xcode ==="
      npx cap open ios
    else
      echo "WARNING: iOS build requires macOS with Xcode."
      echo "Transfer the ios/ directory to a Mac and open with:"
      echo "  npx cap open ios"
    fi
    ;;
  all)
    echo ""
    echo "=== Build complete. Next steps: ==="
    echo "  Android: npx cap open android  (requires Android Studio)"
    echo "  iOS:     npx cap open ios       (requires macOS + Xcode)"
    echo ""
    echo "Or run directly:"
    echo "  Android: cd android && ./gradlew assembleDebug"
    echo "  iOS:     cd ios && xcodebuild -workspace App.xcworkspace -scheme App"
    ;;
esac

echo "Done."
