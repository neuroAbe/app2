# 🎮 CatchFeelings Prototype Testing Guide

## Quick Start

### Option 1: Test on Your Phone (Recommended)

1. **Install Expo Go app** on your phone:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Start the development server:**
   ```bash
   cd mobile
   npm start
   ```

3. **Scan the QR code** that appears with:
   - iOS: Camera app
   - Android: Expo Go app

4. **Play the prototype!**

### Option 2: Test on Simulator/Emulator

**iOS Simulator (Mac only):**
```bash
cd mobile
npm run ios
```

**Android Emulator:**
```bash
cd mobile
npm run android
```

## What to Test

### 1. Core Gameplay Loop (5-10 minutes)

**Test the full encounter flow multiple times:**

1. **Walk Around**
   - Use joystick to move your character
   - Explore the starter town
   - Does movement feel responsive?

2. **Trigger Encounter**
   - Tap the "🎯 Encounter" button (bottom right)
   - View random user profile
   - **Note:** Does the profile feel interesting?

3. **Browse Profile**
   - Read bio and interests
   - Check ice breaker question
   - **Decide:** Say Hi or Keep Walking?

4. **Chat Flow**
   - Tap "Say Hi 💬"
   - Send 3+ messages
   - Wait for auto-replies
   - **Note:** Does conversation feel natural or forced?

5. **Match**
   - After 3+ messages, match button appears
   - Tap "💕 Match with [Name]"
   - Watch success animation
   - **Note:** Does matching feel rewarding?

6. **Repeat**
   - Match counter updates in HUD (top right)
   - Trigger more encounters
   - Try meeting all 8 users

### 2. Specific Things to Try

- [ ] Match with at least 3 different users
- [ ] Try "Keep Walking" to skip someone
- [ ] Send different types of messages (short, long, emoji)
- [ ] Test on different screen sizes (if possible)
- [ ] Leave app and come back (does state persist?)

### 3. Note Your Reactions

**Keep track of:**

✅ **What felt GOOD:**
- Which parts were fun?
- What made you smile?
- What felt rewarding?

❌ **What felt BAD:**
- What was confusing?
- What was boring?
- What felt tedious?

🤔 **What was MISSING:**
- What did you expect to happen?
- What would make it more fun?
- What features would you add?

## Feedback Questions

After testing, answer these:

### Engagement
1. **Would you use this for 10 minutes daily?** (Yes/No/Maybe)
2. **Did you want to keep playing or stop?**
3. **What was most fun?**
4. **What was least fun?**

### Core Mechanic
5. **Did encounters feel exciting or tedious?**
6. **Was the chat natural or awkward?**
7. **Did matching feel meaningful or arbitrary?**

### First Impressions
8. **What confused you?**
9. **What surprised you (good or bad)?**
10. **If you could change ONE thing, what would it be?**

### Comparison
11. **How does this compare to Tinder/Bumble?**
12. **What's better?**
13. **What's worse?**

### Would You...
14. **Show this to a friend?** (Yes/No)
15. **Pay $9.99/month for premium features?** (Yes/No)
16. **Recommend improvements?** (List 3)

## Known Issues (Prototype Limitations)

These are intentional for v1:

- **Not real users** - Using 8 mock profiles
- **Auto-replies** - Conversation simulated
- **No proximity matching** - Button trigger instead
- **No persistence** - Matches reset on app restart
- **Simple animations** - Basic success screen
- **No real matching logic** - Everyone matches

## What Success Looks Like

**Good signs:**
- You tested for 10+ minutes without being asked
- You wanted to match with most users
- You smiled during the success animation
- You asked "can I add my real friends?"

**Bad signs:**
- You stopped after 2 encounters
- Chat felt robotic
- Matching felt pointless
- You were bored

## Next Steps After Testing

**If it's FUN:**
1. Add proximity-based real encounters
2. Integrate real user database
3. Add mini-games for variety
4. Build activity scheduling

**If it's NOT FUN:**
1. Identify the biggest problem
2. Prototype a fix
3. Test again
4. Iterate

---

## Technical Notes

### If Something Breaks

**App won't start:**
```bash
cd mobile
rm -rf node_modules
npm install --legacy-peer-deps
npm start
```

**Hot reload not working:**
- Press `r` in terminal to reload
- Or shake device → "Reload"

**Encounter button not responding:**
- Check console for errors
- Reload app

### Development Commands

```bash
# Start dev server
npm start

# Start with cache clearing
npm start -- --clear

# Run on specific platform
npm run ios     # iOS simulator
npm run android # Android emulator
npm run web     # Browser (limited features)
```

---

## Share Your Feedback

After testing, share your thoughts:

1. **Quick verbal feedback** - Tell a friend what you thought
2. **Written notes** - Use the questions above
3. **Screen recording** - Record your first play session
4. **Bug reports** - Note anything that broke

**Remember:** Honest feedback is more valuable than nice feedback!

---

*Last updated: 2025-11-19*
*Prototype version: 0.1.0*
