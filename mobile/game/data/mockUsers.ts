/**
 * Mock user data for encounter prototype
 * In production, this will come from Supabase based on proximity
 */

export interface MockUser {
  id: string;
  displayName: string;
  age: number;
  bio: string;
  interests: string[];
  avatarColor: string;
  distance: number; // meters
  iceBreaker: string;
}

export const MOCK_USERS: MockUser[] = [
  {
    id: 'user_001',
    displayName: 'Alex',
    age: 26,
    bio: 'Coffee enthusiast and weekend hiker. Always up for trying new restaurants!',
    interests: ['Coffee', 'Hiking', 'Food', 'Photography'],
    avatarColor: '#ef4444',
    distance: 250,
    iceBreaker: "What's your go-to coffee order?",
  },
  {
    id: 'user_002',
    displayName: 'Sam',
    age: 24,
    bio: 'Indie game developer by day, concert-goer by night. Looking for adventure!',
    interests: ['Gaming', 'Music', 'Coding', 'Art'],
    avatarColor: '#8b5cf6',
    distance: 180,
    iceBreaker: 'Last concert you went to?',
  },
  {
    id: 'user_003',
    displayName: 'Jordan',
    age: 28,
    bio: 'Yoga instructor who loves dogs and brunch. Let\'s explore the city together!',
    interests: ['Yoga', 'Dogs', 'Brunch', 'Travel'],
    avatarColor: '#10b981',
    distance: 420,
    iceBreaker: 'Favorite brunch spot in town?',
  },
  {
    id: 'user_004',
    displayName: 'Morgan',
    age: 25,
    bio: 'Bookworm and aspiring chef. Always experimenting with new recipes.',
    interests: ['Reading', 'Cooking', 'Wine', 'Theater'],
    avatarColor: '#f59e0b',
    distance: 320,
    iceBreaker: 'What book are you reading right now?',
  },
  {
    id: 'user_005',
    displayName: 'Casey',
    age: 27,
    bio: 'Graphic designer with a passion for street art and skateboarding.',
    interests: ['Art', 'Skateboarding', 'Design', 'Photography'],
    avatarColor: '#06b6d4',
    distance: 500,
    iceBreaker: 'Coolest street art you\'ve seen recently?',
  },
  {
    id: 'user_006',
    displayName: 'Riley',
    age: 29,
    bio: 'Fitness trainer who loves meal prep and motivational quotes.',
    interests: ['Fitness', 'Nutrition', 'Meditation', 'Running'],
    avatarColor: '#ec4899',
    distance: 150,
    iceBreaker: 'Morning workout or evening workout?',
  },
  {
    id: 'user_007',
    displayName: 'Taylor',
    age: 23,
    bio: 'Film student with dreams of becoming a director. Let\'s debate movies!',
    interests: ['Movies', 'Photography', 'Writing', 'Coffee'],
    avatarColor: '#6366f1',
    distance: 280,
    iceBreaker: 'Most overrated movie of all time?',
  },
  {
    id: 'user_008',
    displayName: 'Avery',
    age: 30,
    bio: 'Marine biologist who spends weekends at the beach. Ocean lover!',
    interests: ['Ocean', 'Diving', 'Conservation', 'Travel'],
    avatarColor: '#14b8a6',
    distance: 610,
    iceBreaker: 'Beach day or mountain day?',
  },
];

/**
 * Get a random user for encounter
 */
export const getRandomUser = (): MockUser => {
  const randomIndex = Math.floor(Math.random() * MOCK_USERS.length);
  return MOCK_USERS[randomIndex];
};

/**
 * Get user by ID
 */
export const getUserById = (id: string): MockUser | undefined => {
  return MOCK_USERS.find(user => user.id === id);
};
