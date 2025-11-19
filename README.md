# PixelMatch - Pokemon-Style Dating Game

A unique dating application that combines nostalgic Pokemon-style gameplay with modern social connection. Users explore a 2D pixel world, encounter other real users, and strike up conversations in a fun, low-pressure environment.

## Concept

PixelMatch reimagines online dating by:
- **Gamifying the experience** - Turn dating into an adventure
- **Reducing pressure** - Organic encounters feel more natural than swiping
- **Nostalgia factor** - Pixel art and Game Boy-style gameplay
- **Fun first** - Build connections through shared exploration

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript
- **Game Engine**: Phaser.js 3.9
- **Styling**: Tailwind CSS 4
- **Authentication**: Clerk (email, phone verification, OAuth)
- **Database** (planned): PostgreSQL with Row Level Security
- **Real-time** (planned): Socket.io or Supabase Realtime

## Current Features

### ✅ Phase 1: Core Gameplay (Complete)
- [x] Next.js 16 project with TypeScript & Tailwind CSS
- [x] Phaser.js 3.9 game engine integration
- [x] Player character with smooth movement (Arrow keys or WASD)
- [x] 2D town world with buildings and collision detection
- [x] Camera system that follows player
- [x] Pixel-perfect retro aesthetic rendering

### ✅ Phase 2: Authentication & Safety (Complete)
- [x] **Clerk Authentication Integration**
  - Email & phone verification
  - OAuth support (Google, Apple, etc.)
  - Secure session management
  - Protected routes middleware
- [x] **Landing Page** with sign-up/sign-in flows
- [x] **Onboarding System**
  - 3-step profile creation
  - Avatar customization (color selection)
  - Interest selection
  - Age verification (18+)
  - Safety guidelines display
- [x] **Safety Components**
  - Report user functionality
  - Block user functionality
  - Safety tips and guidelines
  - In-game safety menu
- [x] **Database Schema Design**
  - User profiles with verification levels
  - Reports & moderation system
  - Block list management
  - Match system structure
  - Message system with toxicity scoring
  - Row Level Security policies

### 🚧 In Progress
- API routes for safety features
- Database integration (Supabase or PostgreSQL)
- Verification badge system

### 📋 Planned Features (Phase 3+)
- **Encounter System**: Location-based user discovery
- **Real-time Chat**: WebSocket messaging between matched users
- **Multiple Towns**: Expandable world map
- **Quest System**: Daily challenges and achievements
- **Profile Cards**: Pokemon "Trainer card" style profiles
- **Photo Verification**: Selfie + ID matching
- **Content Moderation**: AI-powered message filtering

## Getting Started

### Prerequisites
```bash
Node.js 18+ installed
```

### Installation

1. Clone the repository
```bash
git clone <repo-url>
cd app2
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your Clerk API keys:
- Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
- Create a new application
- Copy your Publishable and Secret keys
- Paste them into `.env.local`

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### How to Use

1. **Sign Up**: Click "Start Your Adventure" on the landing page
2. **Verify**: Complete email/phone verification (Clerk handles this)
3. **Onboarding**: Fill out your profile (3-step process)
4. **Play**: Use **Arrow Keys** or **WASD** to explore the world
5. **Safety**: Press `ESC` to access the safety menu (coming soon)

## Project Structure

```
app2/
├── app/                    # Next.js App Router
│   ├── sign-in/           # Clerk sign-in page
│   ├── sign-up/           # Clerk sign-up page
│   ├── onboarding/        # 3-step profile creation
│   ├── game/              # Protected game route
│   ├── globals.css        # Global styles + Tailwind
│   ├── layout.tsx         # Root layout with ClerkProvider
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── GameCanvas.tsx     # Phaser game wrapper
│   └── SafetyMenu.tsx     # Report/block UI component
├── game/                  # Game logic
│   ├── scenes/            # Phaser scenes
│   │   └── MainScene.ts   # Main game scene
│   └── sprites/           # Game sprites
│       └── Player.ts      # Player character
├── types/                 # TypeScript types
│   └── database.ts        # Database schema types
├── database/              # Database files
│   └── schema.sql         # PostgreSQL schema
├── public/                # Static assets
│   └── assets/            # Game assets
├── middleware.ts          # Clerk auth middleware
├── .env.example           # Environment variables template
└── package.json
```

## Development Roadmap

### Phase 1: Core Gameplay ✅
- ✅ Basic game world with Phaser.js
- ✅ Player movement and controls
- ✅ Town environment with collision
- ✅ Camera system

### Phase 2: Authentication & Safety ✅
- ✅ Clerk authentication integration
- ✅ User onboarding flow
- ✅ Profile creation with age verification
- ✅ Safety UI components (report/block)
- ✅ Database schema with RLS
- ✅ Landing page and auth routes

### Phase 3: Database & API (Next)
- Database deployment (Supabase or PostgreSQL)
- API routes for CRUD operations
- Profile storage and retrieval
- Safety features implementation
- Verification badge system

### Phase 4: Real-Time Features
- User presence system (who's online/where)
- Location-based encounter matching
- WebSocket chat system
- Match notifications
- Real-time player positions

### Phase 5: Content & Engagement
- Multiple towns and areas
- Quest system and achievements
- Badge collection
- Daily challenges
- Event system

### Phase 6: Advanced Safety
- Photo verification (selfie + ID)
- AI content moderation (Perspective API)
- Toxicity scoring for messages
- Automated moderation queue
- Appeals system

### Phase 7: Polish & Scale
- Mini-games for matched users
- Enhanced avatar customization
- Mobile app (React Native)
- Sound effects and music
- Performance optimization
- Analytics and monitoring

## Safety & Verification Features

PixelMatch takes user safety seriously with a multi-layered approach:

### Current Safety Implementation
- **Age Verification**: 18+ requirement enforced at signup
- **Email & Phone Verification**: Required via Clerk before accessing the game
- **Report System**: Users can report inappropriate behavior
- **Block System**: Instant blocking prevents future encounters
- **Safety Guidelines**: Displayed during onboarding
- **Row Level Security**: Database policies prevent unauthorized data access

### Planned Safety Features
- **Photo Verification**: Selfie matching with profile photos
- **ID Verification**: Government ID checking via Onfido/Persona
- **Verification Badges**: Visual indicators of verified users
- **Content Moderation**: AI-powered message filtering
- **Toxicity Scoring**: Automatic flagging of harmful messages
- **Rate Limiting**: Prevent spam and harassment
- **Moderation Queue**: Manual review of flagged content
- **Automated Actions**: Auto-ban on multiple valid reports

### Database Security
- Row Level Security (RLS) policies on all tables
- Encrypted sensitive data
- Audit logs for safety incidents
- GDPR-compliant data handling
- User data isolation

## Why This Portfolio Piece Works

1. **Unique Concept** - Stands out from typical CRUD apps
2. **Technical Complexity** - Game engine, auth, real-time features, safety systems
3. **Multiple Disciplines** - Frontend, backend, game dev, UX, security
4. **Safety-First Approach** - Shows understanding of real-world responsibilities
5. **Scalability Story** - Clear path from MVP to full product
6. **Conversation Starter** - Memorable in interviews and demos

## Contributing

This is a portfolio project, but suggestions and feedback are welcome!

## License

MIT

## Contact

Built to showcase full-stack development capabilities for app agency portfolio.
