# Swipick Mobile

React Native mobile application for Swipick - Football prediction game with swipe gestures.

## 📱 Tech Stack

- **React Native** 0.81.5
- **Expo** SDK 54
- **TypeScript** 5.9.2
- **React Navigation** - Navigation
- **Firebase** - Authentication & Push Notifications
- **Zustand** - State Management
- **React Native Reanimated** - Animations
- **React Native Gesture Handler** - Swipe gestures
- **Axios** - API requests
- **React Query** - Data fetching & caching

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- iOS Simulator (Xcode on Mac) or Android Emulator (Android Studio)
- Expo Go app (for testing on physical devices)

### Installation

```bash
# Install dependencies
npm install

# Start Metro bundler
npm start

# Run on specific platforms
npm run ios      # iOS Simulator
npm run android  # Android Emulator
npm run web      # Web browser
```

## 🔧 Configuration

### Environment Variables

Configure your environment variables in `app.json` under the `extra` field:

```json
"extra": {
  "bffUrl": "https://your-backend.railway.app",
  "gamingApiUrl": "https://your-gaming-api.railway.app",
  "firebaseApiKey": "your_api_key",
  "firebaseProjectId": "your_project_id",
  // ... other Firebase config
}
```

See `.env.example` for all required variables.

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Use your existing Swipick project or create a new one
3. Get configuration from Project Settings → General
4. Add the values to `app.json` under `extra` field
5. Enable Authentication → Email/Password method

## 📁 Project Structure

```
src/
├── screens/         # Screen components
├── components/      # Reusable components
├── navigation/      # Navigation configuration
├── services/        # API, auth, storage services
├── store/          # Zustand state management
├── hooks/          # Custom React hooks
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── config/         # App configuration
├── theme/          # Styling & theming
└── assets/         # Images, fonts, animations
```

## 🎯 Development Status

### ✅ Phase 1 - Completed
- [x] Project initialization
- [x] Folder structure
- [x] Dependencies installation
- [x] Navigation skeleton
- [x] Theme configuration
- [x] Firebase setup
- [x] Environment configuration

### 🚧 Phase 2 - Next Steps
- [ ] Implement authentication screens
- [ ] Setup auth state management
- [ ] Create auth service
- [ ] Test Firebase auth flow

### 📋 Upcoming Phases
- Phase 3: Core Features - Gioca (Swipe cards)
- Phase 4: Results Screen
- Phase 5: Profile & Settings
- Phase 6: Polish & Testing
- Phase 7: Deployment

## 📖 Key Features to Implement

1. **Authentication**
   - Email/Password login
   - Registration
   - Password reset
   - Session persistence

2. **Gioca Screen**
   - Swipeable match cards
   - Prediction recording (1, X, 2, Skip)
   - Progress tracking
   - Live & Test modes

3. **Results Screen**
   - Weekly results view
   - Success meter
   - Prediction reveal
   - Statistics

4. **Profile Screen**
   - User statistics
   - Settings
   - Account management

## 🔗 Related Repositories

- **Backend**: [Swipick Backend Repository]
- **PWA**: [Swipick PWA Repository]
- **Migration Plan**: See `../REACT_NATIVE_MIGRATION_PLAN.md`

## 📚 Documentation

- [Expo Documentation](https://docs.expo.dev)
- [React Navigation](https://reactnavigation.org)
- [Firebase React Native](https://rnfirebase.io)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated)

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run linter
npm run lint
```

## 📦 Building for Production

### iOS

```bash
# Build for iOS
eas build --platform ios

# Submit to App Store
eas submit --platform ios
```

### Android

```bash
# Build for Android
eas build --platform android

# Submit to Play Store
eas submit --platform android
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

[Your License Here]
