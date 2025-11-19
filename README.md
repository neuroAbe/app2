# PixelMatch - Pokemon-Style Dating App

A unique dating application that combines nostalgic Pokemon-style gameplay with modern social connection. Available on **Web** and **Mobile** (iOS & Android).

## 📱 Project Structure

This is a **monorepo** containing both web and mobile applications sharing a common backend.

```
pixelmatch/
├── web/                    # Next.js web application
├── mobile/                 # Expo React Native mobile app (iOS/Android)
├── shared/                 # Shared code between web and mobile
│   ├── types/             # TypeScript types
│   └── database/          # Database schema
├── MOBILE_MIGRATION_PLAN.md
├── SUPABASE_SETUP.md
└── README.md (this file)
```

##🌐 Web App (Next.js)

Full-featured web application with game engine, authentication, and database integration.

**[→ Go to Web App README](./web/README.md)**

**Quick Start:**
```bash
cd web
npm install
cp .env.example .env.local
# Add your Clerk and Supabase keys to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📱 Mobile App (React Native)

Native iOS and Android app built with Expo. **Coming Soon!**

**Quick Start:**
```bash
cd mobile
npm install
npm start
```

---

## 🔗 Shared Backend

Both apps share the same backend infrastructure:

- **Authentication**: Clerk (email, phone, OAuth)
- **Database**: Supabase PostgreSQL with Row Level Security
- **API**: REST APIs for profiles, safety features, matches
- **Storage**: Supabase Storage for user photos

### Database Setup

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed database configuration instructions.

The database schema is in `shared/database/schema.sql` and is used by both web and mobile apps.

---

## ✨ Features

### Current (Web App)
- ✅ Pokemon-style 2D game world
- ✅ User authentication & verification
- ✅ 3-step onboarding with profile creation
- ✅ Safety features (report/block)
- ✅ Database persistence
- ✅ Landing page & responsive UI

### Coming Soon (Mobile App)
- 🚧 Native iOS & Android apps
- 🚧 Touch controls (joystick & gestures)
- 🚧 Push notifications
- 🚧 Camera integration (photo verification)
- 🚧 App Store & Play Store distribution

### Planned (Both Platforms)
- Real-time user presence
- Location-based encounters
- In-game chat system
- Multiple towns & areas
- Quest system & achievements
- Photo verification

---

## 🚀 Tech Stack

### Web
- Next.js 16 (App Router)
- TypeScript
- Phaser.js (game engine)
- Tailwind CSS
- Clerk (auth)
- Supabase (database)

### Mobile
- Expo SDK 51+
- React Native
- TypeScript
- React Native Game Engine
- Clerk Expo SDK
- Supabase

### Shared
- PostgreSQL (Supabase)
- REST APIs
- TypeScript types
- Database schema

---

## 📖 Documentation

- **[Web App README](./web/README.md)** - Web-specific setup and features
- **[Mobile Migration Plan](./MOBILE_MIGRATION_PLAN.md)** - Strategy for mobile app development
- **[Supabase Setup](./SUPABASE_SETUP.md)** - Database configuration guide

---

## 🔒 Safety & Security

PixelMatch prioritizes user safety:

- **Age Verification**: 18+ enforcement
- **Identity Verification**: Email & phone required
- **Report System**: Users can report inappropriate behavior
- **Block System**: Instant blocking prevents future encounters
- **Row Level Security**: Database-level access control
- **Content Moderation**: Planned AI-powered filtering

See [Supabase Setup](./SUPABASE_SETUP.md) for security configuration details.

---

## 📱 App Store Deployment

### iOS (App Store)
- Requires Apple Developer account ($99/year)
- Build with EAS Build
- Submit via App Store Connect

### Android (Play Store)
- Requires Google Play Console ($25 one-time)
- Build with EAS Build
- Submit via Play Console

See [Mobile Migration Plan](./MOBILE_MIGRATION_PLAN.md) for deployment checklist.

---

## 🤝 Contributing

This is a portfolio project showcasing full-stack development capabilities.

---

## 📄 License

MIT

---

## 🎯 Why This Project?

1. **Unique Concept** - Pokemon-style dating stands out
2. **Cross-Platform** - Web + iOS + Android from one codebase
3. **Safety-First** - Production-ready security features
4. **Scalable Architecture** - Monorepo with shared backend
5. **Portfolio Showcase** - Demonstrates full-stack + mobile skills

---

Built with ❤️ to showcase app development agency capabilities.
