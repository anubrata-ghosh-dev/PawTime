# PawTime

#### Video Demo: https://youtu.be/oSwrdVSPTwg
#### Description:
A productivity app that combines a to-do list with a Pomodoro timer. I built this because I wanted a simpler alternative to complicated task managers—something that's actually fun to use.

## What It Does

**To-Do List**
- Add, mark complete, and delete tasks
- See how many tasks you've finished today
- Tasks save to your browser automatically

**Pomodoro Timer**
- 25-minute focus sessions (can't change the time, but that's kinda the point)
- Start/pause/reset buttons
- Beep sound when you finish a session
- Keeps track of how many sessions you've done

**The Kitten**
- A pet that reacts to what you're doing
- Meows if you hover over it
- Gets happy when you complete tasks
- Gets sad if you're inactive for too long (it's just a fun way to keep you engaged)

## How to Run It

You need Node.js installed.

```bash
npm install
npm run dev
```

It'll open at `http://localhost:3000`.

To build for production:
```bash
npm run build
```

## How It's Built

- **React 18** for the UI
- **Vite** as the build tool (way faster than Create React App)
- **Plain CSS** with CSS variables for theming
- **Firebase** for authentication and storing tasks in the cloud
- **localStorage** as a backup for the timer state

The design is minimal and light. I used Fredoka font and a pastel color palette because it feels less stressful than dark mode.

## Project Structure

```
src/
├── components/
│   ├── Header.jsx
│   ├── TodoList.jsx
│   ├── PomodoroTimer.jsx
│   ├── Auth.jsx
│   ├── LandingPage.jsx
│   └── [css files]
├── App.jsx
├── firebase.js
├── index.jsx
└── styles.css
```

## Challenges I Faced

1. **Kitten animations** - I wanted the kitten to transition smoothly between states. I used setTimeout and refs to handle the timing, which took a while to get right.

2. **Timer persistence** - Keeping the timer state across page refreshes required localStorage. At first I was only saving on unmount, but that missed quick reloads.

3. **Task sorting** - I wanted to show today's tasks first, then pending tasks below. Sorting arrays and using useMemo for this was more complex than it sounds.

4. **Canvas animation on landing page** - Preloading 640+ images for the sequence animation and rendering them smoothly was tricky. I had to optimize the canvas rendering and use easing functions for smooth scrolling.

5. **Firebase rules** - Getting the Firestore security rules right took time. Users should only see their own tasks.

## What I'd Do Differently (If I Had More Time)

- Add a break timer (5 min) after each Pomodoro
- Let users customize the timer length
- Add a simple stats view (completed sessions this week, etc.)
- Dark mode toggle
- Export tasks to CSV

## What It Doesn't Do

- No time tracking for tasks
- No recurring/recurring tasks
- No task priorities or due dates
- The kitten is just for fun—it doesn't affect your tasks

## Browser Support

Works on Chrome, Firefox, Safari, and Edge. Mobile works but the layout isn't perfect on very small screens.
