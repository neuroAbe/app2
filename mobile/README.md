# CatchFeelings Mobile App 📱

Native iOS and Android app built with Expo React Native.

## 🚀 Features

### Current
- ✅ Landing page with gradient design
- ✅ Authentication (sign-in/sign-up) via Clerk
- ✅ Email verification flow
- ✅ 3-step onboarding (basic info, bio/interests, avatar)
- ✅ Tab navigation (Game, Profile)
- ✅ Profile screen with user details
- ✅ Database integration with Supabase
- ✅ Shared backend with web app

### Coming Soon
- 🚧 Pokemon-style 2D game world (react-native-game-engine)
- 🚧 Touch controls (virtual joystick)
- 🚧 Real-time encounters
- 🚧 In-app chat
- 🚧 Push notifications
- 🚧 Camera integration (photo verification)

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Expo Go app (for testing on device)
- iOS Simulator or Android Emulator (optional)

## 🛠️ Setup

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Configure Environment Variables

Copy `.env` and add your actual keys:

```bash
# Clerk Authentication
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here

# Supabase Database
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Get your keys:**
- Clerk: https://dashboard.clerk.com/
- Supabase: https://supabase.com/dashboard/project/_/settings/api

### 3. Start Development Server

```bash
npm start
```

This will open Expo DevTools. You can:
- Press `i` to open iOS Simulator
- Press `a` to open Android Emulator
- Scan QR code with Expo Go app on your phone

## 📱 Testing

### Expo Go (Easiest)

1. Install Expo Go on your iOS or Android device
2. Run `npm start`
3. Scan the QR code with your camera (iOS) or Expo Go (Android)

### iOS Simulator (macOS only)

```bash
npm run ios
```

### Android Emulator

```bash
npm run android
```

## 🏗️ Project Structure

```
mobile/
├── app/                      # Expo Router screens
│   ├── (auth)/              # Auth screens
│   │   ├── sign-in.tsx      # Sign in page
│   │   ├── sign-up.tsx      # Sign up page
│   │   └── onboarding.tsx   # 3-step onboarding
│   ├── (tabs)/              # Main app tabs
│   │   ├── game.tsx         # Game screen
│   │   └── profile.tsx      # User profile
│   ├── _layout.tsx          # Root layout (Clerk provider)
│   └── index.tsx            # Landing page
├── lib/
│   ├── clerk.ts             # Clerk config + token cache
│   └── supabase.ts          # Supabase client
├── assets/                  # Images, icons, etc.
├── app.json                 # Expo configuration
└── package.json
```

## 🎨 Tech Stack

- **Framework**: Expo SDK 54+ (React Native)
- **Navigation**: Expo Router (file-based routing)
- **Auth**: Clerk Expo SDK
- **Database**: Supabase (PostgreSQL)
- **Styling**: React Native StyleSheet
- **Game Engine**: react-native-game-engine (planned)

## 🔗 Shared Backend

The mobile app shares the same backend as the web app:

- **Database**: Same Supabase PostgreSQL tables
- **Authentication**: Same Clerk project
- **Types**: Shared TypeScript types (in `../shared/`)
- **Schema**: Same database schema (`../shared/database/schema.sql`)

## 📦 Building for Production

### Create Production Builds

Install EAS CLI:

```bash
npm install -g eas-cli
eas login
```

Configure build:

```bash
eas build:configure
```

Build for iOS:

```bash
eas build --platform ios
```

Build for Android:

```bash
eas build --platform android
```

## 🚢 App Store Deployment

### iOS (App Store)

1. **Requirements**:
   - Apple Developer account ($99/year)
   - Bundle ID configured in `app.json`
   - App icons and screenshots

2. **Submit**:
   ```bash
   eas build --platform ios
   eas submit --platform ios
   ```

3. **Review**: Apple typically reviews apps in 1-3 days

### Android (Play Store)

1. **Requirements**:
   - Google Play Console account ($25 one-time)
   - Package name configured in `app.json`
   - App icons and screenshots

2. **Submit**:
   ```bash
   eas build --platform android
   eas submit --platform android
   ```

3. **Review**: Google typically reviews apps within hours

## 🔒 Security & Safety

- **Age Verification**: 18+ enforcement
- **Email Verification**: Required before onboarding
- **Row Level Security**: Database-level access control
- **Secure Token Storage**: expo-secure-store for auth tokens
- **Safety Features**: Report/block system (coming soon)

## 🐛 Troubleshooting

### "Cannot find module 'expo-router'"

```bash
npm install expo-router
```

### Metro bundler errors

Clear cache:

```bash
npx expo start --clear
```

### iOS build fails

Make sure you have latest Xcode and CocoaPods:

```bash
sudo gem install cocoapods
cd ios && pod install
```

## 📖 Documentation

- **Expo**: https://docs.expo.dev/
- **Expo Router**: https://docs.expo.dev/router/introduction/
- **Clerk Expo**: https://clerk.com/docs/quickstarts/expo
- **Supabase**: https://supabase.com/docs

## 🤝 Contributing

This is a portfolio project. See main [README](../README.md) for details.

## 📄 License

MIT

---

Built with ❤️ to showcase cross-platform mobile development.
