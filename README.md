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
- **Future**: PostgreSQL, NextAuth.js, Socket.io for real-time features

## Current Features (MVP - Phase 1)

### ✅ Completed
- [x] Next.js project setup with TypeScript
- [x] Phaser.js game engine integration
- [x] Player character with smooth movement (Arrow keys or WASD)
- [x] 2D town world with:
  - Buildings with collision detection
  - Paths and walkable areas
  - Camera following player
- [x] Pixel art aesthetic with proper rendering

### 🚧 In Progress
- Database schema design
- Authentication system
- User profiles and avatar customization

### 📋 Planned Features
- **Encounter System**: Random meetings with real users in the same area
- **Chat System**: Real-time in-game dialogue
- **Multiple Towns**: Different areas to explore
- **Quest System**: Daily challenges to encourage engagement
- **Badges/Achievements**: Gamification elements
- **Profile Cards**: "Trainer card" style user profiles

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

3. Run the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Controls
- **Arrow Keys** or **WASD**: Move your character
- Walk around the town and explore!

## Project Structure

```
app2/
├── app/                 # Next.js App Router
│   ├── globals.css     # Global styles + Tailwind
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page (loads game)
├── components/         # React components
│   └── GameCanvas.tsx  # Phaser game wrapper
├── game/              # Game logic
│   ├── scenes/        # Phaser scenes
│   │   └── MainScene.ts  # Main game scene
│   └── sprites/       # Game sprites
│       └── Player.ts     # Player character
├── public/            # Static assets
│   └── assets/       # Game assets (sprites, tilesets)
└── package.json
```

## Development Roadmap

### Phase 1: Core Gameplay ✅
- Basic game world
- Player movement
- Town environment

### Phase 2: User System (Next)
- User authentication
- Profile creation
- Avatar customization
- Database setup

### Phase 3: Social Features
- User encounter system
- Real-time chat
- Match notifications
- Friend system

### Phase 4: Engagement
- Quest system
- Achievements/badges
- Multiple towns
- Events and festivals

### Phase 5: Polish
- Mini-games for matched users
- Enhanced customization
- Mobile optimization (PWA/React Native)
- Sound effects and music

## Why This Portfolio Piece Works

1. **Unique Concept** - Stands out from typical CRUD apps
2. **Technical Complexity** - Game engine, real-time features, matching algorithms
3. **Multiple Disciplines** - Frontend, backend, game dev, UX design
4. **Scalability Story** - Clear path from MVP to full product
5. **Conversation Starter** - Memorable in interviews and demos

## Contributing

This is a portfolio project, but suggestions and feedback are welcome!

## License

MIT

## Contact

Built to showcase full-stack development capabilities for app agency portfolio.
