import React, { useState, useEffect } from 'react'
import './PomodoroTimer.css'

export default function PomodoroTimer({ onStart, onReset, onComplete, onRunningChange, onUserActivity }) {
  const INITIAL_TIME = 25 * 60 // 25 minutes in seconds
  const [time, setTime] = useState(INITIAL_TIME)
  const [isRunning, setIsRunning] = useState(false)
  const [totalSessions, setTotalSessions] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

  // Load saved state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('pawtime-timer')
    if (savedState) {
      try {
        const { time: savedTime, totalSessions: savedSessions } = JSON.parse(savedState)
        setTime(savedTime)
        setTotalSessions(savedSessions)
      } catch (e) {
        console.error('Failed to load timer state:', e)
      }
    }
  }, [])

  // Timer interval
  useEffect(() => {
    let interval
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime - 1
          if (newTime === 0) {
            setIsRunning(false)
            setIsCompleted(true)
            onComplete?.()
            // Play notification sound
            playNotification()
            // Increment session count
            setTotalSessions((prev) => prev + 1)

            // Reset completed state after animation
            setTimeout(() => setIsCompleted(false), 2000)
            setHasStarted(false)
          }
          return newTime
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, time])

  // Save timer state to localStorage
  useEffect(() => {
    localStorage.setItem(
      'pawtime-timer',
      JSON.stringify({ time, totalSessions })
    )
  }, [time, totalSessions])

  const playNotification = () => {
    // Create a simple beep sound
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gain = audioContext.createGain()

      oscillator.connect(gain)
      gain.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = 'sine'

      gain.gain.setValueAtTime(0.3, audioContext.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (e) {
      console.log('Audio notification failed:', e)
    }
  }

  const handleStart = () => {
    if (time > 0) {
      onUserActivity?.()
      onStart?.()
      onRunningChange?.(true)
      setIsRunning(true)
      setHasStarted(true)
      setIsCompleted(false)
    }
  }

  const handlePause = () => {
    onUserActivity?.()
    onRunningChange?.(false)
    setIsRunning(false)
  }

  const handleReset = () => {
    onUserActivity?.()
    onReset?.()
    onRunningChange?.(false)
    setIsRunning(false)
    setHasStarted(false)
    setIsCompleted(false)
    setTime(INITIAL_TIME)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const progressPercent = ((INITIAL_TIME - time) / INITIAL_TIME) * 100

  return (
    <div className="timer">
      <div className="timer-header">
        <h2>Focus Timer</h2>
        <span className="sessions-badge">{totalSessions} completed</span>
      </div>

      <div className={`timer-display ${isCompleted ? 'state-completed' :
          isRunning ? 'state-running' :
            (hasStarted && time > 0) ? 'state-paused' :
              'state-idle'
        }`}>
        <div className="signature-particle" />
        <div className="timer-circle">
          <svg className="progress-ring" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#B8A1FF" />
                <stop offset="55%" stopColor="#FFB7D5" />
                <stop offset="100%" stopColor="#FFCF6B" />
              </linearGradient>
            </defs>
            <circle
              className="progress-ring-circle"
              cx="50"
              cy="50"
              r="45"
              style={{
                strokeDasharray: `${(progressPercent / 100) * 2 * Math.PI * 45} ${2 * Math.PI * 45}`,
              }}
            />
          </svg>
          <span className="time">{formatTime(time)}</span>
        </div>
      </div>

      <div className="timer-info">
        <p className="session-text">
          {isRunning ? 'Focus in progress...' : 'Ready to focus?'}
        </p>
      </div>

      <div className="timer-controls">
        <button
          onClick={handleStart}
          disabled={isRunning}
          className={`primary ${isRunning ? 'disabled' : ''}`}
        >
          Start
        </button>
        <button
          onClick={handlePause}
          disabled={!isRunning}
          className={!isRunning ? 'disabled' : 'secondary'}
        >
          Pause
        </button>
        <button onClick={handleReset} className="secondary">
          Reset
        </button>
      </div>

      <div className="timer-notes">
        <p className="note-text">The Pomodoro Technique: Focus for 25 minutes, then take a 5-minute break.</p>
      </div>
    </div>
  )
}
