# 🐾 PawTime — Focus & Task Management

A modern, minimal productivity web application for focused work and task management. PawTime combines a clean to-do list with a Pomodoro timer to help you stay productive.

## Features

### To-Do List
- ✅ Add, complete, and delete tasks
- 📊 Progress tracking (completed/total tasks)
- 💾 Auto-save to localStorage
- 🎨 Smooth animations for all interactions

### Pomodoro Timer
- ⏱️ 25-minute focused work sessions
- ▶️ Start, Pause, and Reset controls
- 🔔 Audio notification when session completes
- 📈 Track completed Pomodoro sessions
- 💾 Auto-save timer state

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Plain CSS (no dependencies)
- **Font**: Inter (Google Fonts)
- **State Management**: React Hooks + localStorage

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
   ```bash
   cd /Users/anubrataghosh/Projects/PawTime
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The app will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The optimized build will be generated in the `dist/` folder.

## Project Structure

```
PawTime/
├── src/
│   ├── components/
│   │   ├── Header.jsx          # App header with logo
│   │   ├── Header.css
│   │   ├── TodoList.jsx        # To-do list component
│   │   ├── TodoList.css
│   │   ├── PomodoroTimer.jsx   # Pomodoro timer component
│   │   └── PomodoroTimer.css
│   ├── App.jsx                 # Main app component
│   ├── App.css
│   ├── styles.css              # Global styles
│   └── index.jsx               # React entry point
├── index.html                  # HTML entry point
├── package.json
├── vite.config.js
└── README.md
```

## Design

### Color Palette
- **Background**: `#0F0F14` (Dark)
- **Secondary**: `#1A1A21` (Cards)
- **Tertiary**: `#2A2A32` (Inputs)
- **Primary Accent**: `#7C7CF4` (Muted Purple)
- **Text**: `#E5E5E5` (Light)
- **Secondary Text**: `#A8A8B3` (Gray)

### Typography
- **Font**: Inter (Google Fonts)
- **Title**: Bold, letter-spacing: -0.5px
- **Body**: Regular, letter-spacing: 0.3px

### Layout
- **Desktop**: Two-column layout (To-Do on left, Timer on right)
- **Mobile**: Stacked layout (To-Do above Timer)
- **Container Width**: 1000–1200px
- **Padding**: 24–32px

## Features in Detail

### To-Do List
- Type task name and press Enter or click Add
- Click checkbox to mark complete
- Click ✕ button to delete
- Progress bar shows completion percentage
- All tasks saved to browser's localStorage

### Pomodoro Timer
- Default session: 25 minutes
- Timer display with circular progress indicator
- Audio notification when session completes
- Session counter tracks completed Pomodoros
- Timer state persists across sessions
- Beautiful glow animation while running

## Interactions & Animations

- **Add Task**: Fade-in animation (0.3s)
- **Complete Task**: Strike-through + opacity fade
- **Delete Task**: Slide-out animation (0.3s)
- **Button Hover**: Brightness increase + shadow elevation
- **Input Focus**: Subtle purple border highlight
- **Timer Running**: Subtle glow animation

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Future Enhancements

- Dark/Light theme toggle
- Custom timer durations
- Break timer integration
- Task categories/tags
- Data export (JSON/CSV)
- Statistics dashboard
- Sound selection for notifications

## Performance

- Optimized with Vite
- No unnecessary re-renders
- Efficient localStorage operations
- Responsive animations at 60fps
- Minimal CSS (no unused classes)

## License

MIT License — Feel free to use and modify.

---

**Built with ❤️ for focused productivity.**
