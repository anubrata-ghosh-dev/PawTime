import { useCallback, useEffect, useRef, useState } from 'react'
import Header from './components/Header'
import TodoList from './components/TodoList'
import PomodoroTimer from './components/PomodoroTimer'
import Auth from './components/Auth'
import LandingPage from './components/LandingPage'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import './App.css'

// Kitten has 4 states: idle (default), focused (timer running), happy (task completed), sad (inactive)
// The kitten reverts to its previous state after showing happy/sad
const kittenStates = {
  idle: {
    image: '/assets/kitten/ideal.png',
    text: 'Ready to focus',
  },
  focused: {
    image: '/assets/kitten/focused.png',
    text: 'Focus mode on',
  },
  happy: {
    image: '/assets/kitten/happy.png',
    text: 'Nice one!',
  },
  sad: {
    image: '/assets/kitten/sad.png',
    text: 'Still here?',
  },
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const [kittenState, setKittenStateName] = useState('idle')
  const [isKittenVisible, setIsKittenVisible] = useState(true)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [centralSpeak, setCentralSpeak] = useState('')

  const kittenTimersRef = useRef({ transition: null, revert: null, inactivity: null })
  const centralSpeakTimerRef = useRef(null)
  const meowAudioRef = useRef(null)
  const kittenStateRef = useRef('idle')
  const isTimerRunningRef = useRef(false)
  const lastHoverMeowRef = useRef(0)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    kittenStateRef.current = kittenState
  }, [kittenState])

  useEffect(() => {
    isTimerRunningRef.current = isTimerRunning
  }, [isTimerRunning])

  const applyKittenState = useCallback((nextState) => {
    setKittenStateName(nextState)
    setIsKittenVisible(true)
  }, [])

  const setKittenState = useCallback((nextState, revertDelay = null) => {
    window.clearTimeout(kittenTimersRef.current.transition)
    window.clearTimeout(kittenTimersRef.current.revert)
    setIsKittenVisible(false)

    kittenTimersRef.current.transition = window.setTimeout(() => {
      applyKittenState(nextState)

      if (revertDelay !== null) {
        kittenTimersRef.current.revert = window.setTimeout(() => {
          setKittenState(isTimerRunningRef.current ? 'focused' : 'idle')
        }, revertDelay)
      }
    }, 150)
  }, [applyKittenState])

  const resetInactivity = useCallback(() => {
    window.clearTimeout(kittenTimersRef.current.inactivity)

    if (isTimerRunningRef.current) return

    kittenTimersRef.current.inactivity = window.setTimeout(() => {
      setKittenState('sad')
    }, 15000)
  }, [setKittenState])

  const handleUserActivity = useCallback(() => {
    resetInactivity()
    if (kittenStateRef.current === 'sad') setKittenState('idle')
  }, [resetInactivity, setKittenState])

  useEffect(() => {
    const handleMouseMove = () => handleUserActivity()
    const handleKeyDown = () => handleUserActivity()

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('keydown', handleKeyDown)
    resetInactivity()

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('keydown', handleKeyDown)
      window.clearTimeout(kittenTimersRef.current.transition)
      window.clearTimeout(kittenTimersRef.current.revert)
      window.clearTimeout(kittenTimersRef.current.inactivity)
      window.clearTimeout(centralSpeakTimerRef.current)
    }
  }, [handleUserActivity, resetInactivity])

  const speakCentral = useCallback((text, ms = 1600) => {
    window.clearTimeout(centralSpeakTimerRef.current)
    setCentralSpeak(text)
    if (ms > 0) {
      centralSpeakTimerRef.current = window.setTimeout(() => setCentralSpeak(''), ms)
    }
  }, [])

  const playMeow = useCallback(async () => {
    try {
      if (!meowAudioRef.current) {
        meowAudioRef.current = new Audio('/meow.mp3')
        meowAudioRef.current.preload = 'auto'
        meowAudioRef.current.volume = 0.8
      }

      meowAudioRef.current.currentTime = 0
      await meowAudioRef.current.play()
      speakCentral('Meow!', 1200)
    } catch (e) {
      // Browsers may block autoplay until a user gesture occurs.
    }
  }, [speakCentral])

  const handleKittenHover = useCallback(() => {
    const now = Date.now()
    if (now - lastHoverMeowRef.current < 1400) return

    lastHoverMeowRef.current = now
    playMeow()
  }, [playMeow])

  const handleTaskCompleted = useCallback(() => {
    setKittenState('happy', 2000)
    speakCentral('Nice!')
  }, [setKittenState, speakCentral])

  const handleTimerStart = useCallback(() => {
    setIsTimerRunning(true)
    setKittenState('focused')
    speakCentral('Focus!')
  }, [setKittenState, speakCentral])

  const handleTimerReset = useCallback(() => {
    setIsTimerRunning(false)
    setKittenState('idle')
    speakCentral('')
  }, [setKittenState, speakCentral])

  const handleTimerRunningChange = useCallback((running) => {
    setIsTimerRunning(running)
    if (running) {
      setKittenState('focused')
      return
    }

    resetInactivity()
    if (kittenStateRef.current === 'focused') setKittenState('idle')
  }, [resetInactivity, setKittenState])

  const kitten = kittenStates[kittenState] || kittenStates.idle

  if (loading) {
    return (
      <div className="app loading">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (showAuth) {
    return (
      <div className="app">
        <Auth onLoginSuccess={() => setShowAuth(false)} />
      </div>
    )
  }

  if (!user) {
    return <LandingPage onLoginClick={() => setShowAuth(true)} />
  }

  return (
    <div className="app">
      <Header user={user} />
      <main className="main-content">
        <div className="container">
          <div className="dashboard">
            <div className="todo-column">
              <TodoList
                kitten={kitten}
                kittenState={kittenState}
                kittenVisible={isKittenVisible}
                centralSpeak={centralSpeak}
                userId={user?.uid}
                onKittenTap={playMeow}
                onKittenHover={handleKittenHover}
                onTaskCompleted={handleTaskCompleted}
                onUserActivity={handleUserActivity}
              />
            </div>
            <div className="timer-column">
              <PomodoroTimer
                onStart={handleTimerStart}
                onReset={handleTimerReset}
                onComplete={handleTaskCompleted}
                onRunningChange={handleTimerRunningChange}
                onUserActivity={handleUserActivity}
              />
            </div>
          </div>
        </div>
      </main>
      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 PawTime. A simple productivity tool.</p>
        </div>
      </footer>
    </div>
  )
}
