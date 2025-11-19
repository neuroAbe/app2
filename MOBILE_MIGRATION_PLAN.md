# Mobile Migration Plan: Next.js → Expo React Native

## Overview

We're migrating PixelMatch from a web-first Next.js app to a mobile-first Expo React Native app that can be published to the App Store and Play Store.

## Why This Migration?

1. **App Store Requirement** - Native apps required for store distribution
2. **Better Performance** - Native rendering vs WebView
3. **One Codebase** - Expo supports iOS, Android, AND web
4. **Native Features** - Camera, push notifications, location services
5. **Early Enough** - Only basic game logic built, minimal loss

## What We Keep (Backend - 100%)

### ✅ Fully Reusable
- **Supabase Database** - All tables, schema, RLS policies
- **API Routes** - Can keep as-is or migrate to Expo API routes
- **Database Schema** (`database/schema.sql`) - No changes needed
- **Clerk Auth** - Has React Native SDK (@clerk/clerk-expo)
- **Business Logic** - Profile creation, safety features, validation
- **Environment Variables** - Same Supabase + Clerk keys

### 📦 What Needs Adaptation
- API route calls (fetch still works, but might move to tRPC later)
- Image uploads (use expo-image-picker)
- File storage (Supabase storage works the same)

## What We Rebuild (Frontend - ~60%)

### 🔄 Major Changes

**1. Tech Stack Changes**
```
Before:                    After:
Next.js 16                 → Expo SDK 51+
Phaser.js                  → React Native Game Engine / Skia
Tailwind CSS               → React Native StyleSheet
HTML/CSS                   → React Native components
Web Canvas                 → Native Canvas / Skia
```

**2. Component Migration**
- Landing Page → Native screens with React Navigation
- Onboarding → Native form components
- Game → React Native Game Engine or Skia Canvas
- Safety Menu → Native modal

**3. Navigation**
```
Before: Next.js App Router
After: React Navigation (Stack, Tab, Drawer navigators)
```

**4. Game Engine**
Options:
- **Option A**: react-native-game-engine (physics, sprites)
- **Option B**: react-native-skia (custom 2D rendering)
- **Option C**: expo-gl + Three.js (3D capable)

**Recommendation**: Start with react-native-game-engine (easiest)

## New Project Structure

```
pixelmatch-mobile/
├── app/                          # Expo Router (similar to Next.js)
│   ├── (auth)/
│   │   ├── sign-in.tsx          # Auth screens
│   │   ├── sign-up.tsx
│   │   └── onboarding.tsx
│   ├── (tabs)/
│   │   ├── game.tsx             # Main game screen
│   │   ├── profile.tsx          # User profile
│   │   └── matches.tsx          # Matches/chat
│   ├── _layout.tsx              # Root layout
│   └── index.tsx                # Landing/splash
├── components/
│   ├── game/
│   │   ├── GameEngine.tsx       # Game logic
│   │   ├── Player.tsx           # Player sprite
│   │   └── Town.tsx             # Game world
│   ├── ui/
│   │   ├── Button.tsx           # Reusable UI
│   │   ├── Input.tsx
│   │   └── SafetyMenu.tsx
│   └── auth/
│       └── ClerkProvider.tsx
├── lib/
│   ├── supabase.ts              # SAME as before
│   ├── api.ts                   # API client
│   └── clerk.ts                 # Clerk config
├── types/
│   └── database.ts              # SAME as before
├── assets/
│   ├── images/
│   ├── sprites/
│   └── sounds/
├── app.json                     # Expo config
├── eas.json                     # Build config (App/Play Store)
└── package.json
```

## Migration Steps

### Phase 1: Setup (Day 1)
1. Create Expo project with TypeScript
2. Install dependencies:
   - @clerk/clerk-expo
   - @supabase/supabase-js
   - react-native-game-engine
   - expo-router
3. Copy environment variables
4. Set up Clerk + Supabase clients
5. Test authentication flow

### Phase 2: Core Screens (Day 1-2)
1. Landing/splash screen
2. Sign-in/sign-up screens (Clerk)
3. Onboarding flow (3 steps)
4. Profile screen
5. Navigation setup

### Phase 3: Game Engine (Day 2-3)
1. Set up game engine
2. Create player sprite
3. Build town world
4. Touch controls (joystick or swipe)
5. Collision detection
6. Camera follow

### Phase 4: Integration (Day 3)
1. Connect onboarding to API
2. Save profiles to Supabase
3. Load user data
4. Safety features (report/block)
5. Test full flow

### Phase 5: Polish (Day 4)
1. Styling and UI polish
2. Loading states
3. Error handling
4. Animations
5. Performance optimization

### Phase 6: Build & Deploy (Day 4-5)
1. Configure app.json (bundle ID, etc.)
2. Set up EAS Build
3. Generate iOS build
4. Generate Android build
5. Test on devices
6. Submit to stores (optional)

## Key Differences to Learn

### 1. Styling
```typescript
// Before (Tailwind)
<div className="bg-blue-600 px-4 py-2 rounded-lg">

// After (React Native)
<View style={styles.button}>
  ...
</View>

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  }
});
```

### 2. Navigation
```typescript
// Before (Next.js)
import { useRouter } from 'next/navigation';
const router = useRouter();
router.push('/game');

// After (Expo Router)
import { useRouter } from 'expo-router';
const router = useRouter();
router.push('/game');
// (Actually very similar!)
```

### 3. Game Rendering
```typescript
// Before (Phaser)
this.add.sprite(x, y, 'player');

// After (react-native-game-engine)
<GameEngine
  entities={{
    player: { position: { x, y }, renderer: PlayerSprite }
  }}
/>
```

## Dependencies

### Must Install
```json
{
  "expo": "~51.0.0",
  "expo-router": "^3.5.0",
  "@clerk/clerk-expo": "latest",
  "@supabase/supabase-js": "^2.x",
  "react-native-game-engine": "^1.x",
  "react-native-gesture-handler": "^2.x",
  "expo-linear-gradient": "^13.x",
  "expo-image-picker": "^15.x"
}
```

### Optional (Later)
- expo-notifications (push)
- expo-location (GPS encounters)
- expo-camera (photo verification)
- @react-native-community/netinfo (offline mode)

## API Integration

Good news: Almost no changes needed!

```typescript
// Both use fetch()
const response = await fetch('https://your-api.com/profile', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

## Testing Strategy

1. **Expo Go App** - Quick testing during development
2. **Dev Build** - Custom native code testing
3. **TestFlight** (iOS) - Beta testing
4. **Internal Testing** (Android) - Beta testing
5. **Physical Devices** - Test on real phones

## Store Submission Checklist

### App Store (iOS)
- [ ] Apple Developer account ($99/year)
- [ ] App Bundle ID
- [ ] App icons (all sizes)
- [ ] Screenshots (all device sizes)
- [ ] Privacy policy URL
- [ ] App description
- [ ] Age rating
- [ ] Build uploaded via EAS

### Play Store (Android)
- [ ] Google Play Console account ($25 one-time)
- [ ] Package name
- [ ] App icons
- [ ] Screenshots
- [ ] Privacy policy
- [ ] Content rating
- [ ] APK/AAB uploaded

## Timeline Estimate

- **Setup**: 2-4 hours
- **Core Screens**: 4-6 hours
- **Game Engine**: 6-8 hours
- **Integration**: 3-4 hours
- **Polish**: 4-6 hours
- **Build Setup**: 2-3 hours

**Total: 2-3 days of focused work**

## Cost Considerations

### Free
- Expo development
- Supabase free tier
- Clerk free tier
- EAS Build (limited builds/month)

### Paid
- Apple Developer: $99/year
- Google Play: $25 one-time
- Expo EAS (for more builds): $29/month (optional)

## Next Steps

1. Create Expo project in separate directory
2. Migrate backend config
3. Build auth screens
4. Build game engine
5. Connect everything
6. Test and polish

---

**Ready to start?** Let's create the Expo project!
