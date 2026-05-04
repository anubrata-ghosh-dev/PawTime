import React, { useState, useEffect, useMemo } from 'react'
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import './TodoList.css'

const getTodayDateString = () => new Date().toISOString().split('T')[0]

export default function TodoList({
  kitten,
  kittenState,
  kittenVisible,
  centralSpeak,
  userId,
  onKittenTap,
  onKittenHover,
  onTaskCompleted,
  onUserActivity,
}) {
  const [tasks, setTasks] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userId) {
      setTasks([])
      return
    }

    const tasksRef = collection(db, 'users', userId, 'tasks')
    const tasksQuery = query(tasksRef, orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      setTasks(snapshot.docs.map((taskDoc) => ({ id: taskDoc.id, ...taskDoc.data() })))
    }, (err) => {
      console.error('Failed to load tasks:', err)
      setError('Could not load tasks from Firestore. Check Firestore rules.')
    })

    return () => unsubscribe()
  }, [userId])

  const addTask = async () => {
    if (inputValue.trim() === '') return
    if (!userId) {
      setError('Please sign in to save tasks.')
      return
    }

    onUserActivity?.()
    setError('')
    setIsSaving(true)

    const newTask = {
      text: inputValue.trim(),
      completed: false,
      createdAt: Date.now(),
      date: getTodayDateString(),
    }

    try {
      await addDoc(collection(db, 'users', userId, 'tasks'), newTask)
      setInputValue('')
    } catch (err) {
      console.error('Failed to add task:', err)
      setError('Could not save task. Check Firestore rules.')
    } finally {
      setIsSaving(false)
    }
  }

  const toggleTask = async (id) => {
    const targetTask = tasks.find((task) => task.id === id)
    const willBeCompleted = targetTask ? !targetTask.completed : false

    onUserActivity?.()

    try {
      await updateDoc(doc(db, 'users', userId, 'tasks', id), {
        completed: !targetTask?.completed,
      })
    } catch (err) {
      console.error('Failed to update task:', err)
      setError('Could not update task.')
    }

    if (willBeCompleted) {
      onTaskCompleted?.()
    }
  }

  const deleteTask = async (id) => {
    onUserActivity?.()

    try {
      await deleteDoc(doc(db, 'users', userId, 'tasks', id))
    } catch (err) {
      console.error('Failed to delete task:', err)
      setError('Could not delete task.')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTask()
    }
  }

  const todayDateString = useMemo(() => getTodayDateString(), [])
  const todayTasks = useMemo(() => tasks.filter((task) => task.date === todayDateString), [tasks, todayDateString])
  const pendingTasks = useMemo(() => tasks.filter((task) => !task.completed && task.date < todayDateString), [tasks, todayDateString])
  const visibleTasks = useMemo(() => [...todayTasks, ...pendingTasks], [todayTasks, pendingTasks])

  const completedCount = visibleTasks.filter((task) => task.completed).length
  const totalCount = visibleTasks.length
  const allCompleted = totalCount > 0 && completedCount === totalCount

  return (
    <div className="todo-list card left-card">
      <div className="kitten-container" aria-live="polite">
        <button
          type="button"
          className={`kitten-button ${kittenVisible ? 'is-visible' : 'is-hidden'}`}
          onClick={() => onKittenTap?.()}
          onMouseEnter={() => onKittenHover?.()}
          aria-label="Play meow sound"
        >
          <img
            id="kitten"
            src={kitten?.image || '/assets/kitten/idle.png'}
            alt="PawTime kitten companion"
            className={`kitten ${kittenState}`}
          />
        </button>
        <p id="kitten-text" className="kitten-text">
          {kitten?.text || 'Ready to focus 🐾'}
        </p>
        {centralSpeak ? (
          <div className="kitten-central-bubble" aria-hidden={false}>{centralSpeak}</div>
        ) : null}
      </div>

      {error ? <div className="todo-error">{error}</div> : null}

      <div className="todo-header">
        <h2>Today's Tasks</h2>
        {isSaving ? <span className="task-count">Saving…</span> : null}
        {visibleTasks.length > 0 && (
          <span className="task-count">
            {completedCount}/{totalCount}
          </span>
        )}
        {pendingTasks.length > 0 && <span className="task-pending-badge">{pendingTasks.length} pending</span>}
      </div>

      <div className="todo-input-group">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a new task..."
          className="todo-input"
        />
        <button onClick={addTask} className="add-button primary" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Add'}
        </button>
      </div>

      <div className="tasks-container">
        {visibleTasks.length === 0 ? (
          <div className="empty-state">
            {allCompleted ? <p>All done for today! 🎉 Rest well.</p> : <p>No tasks yet. Start small.</p>}
          </div>
        ) : (
          <ul className="tasks-list">
            {visibleTasks.map((task) => (
              <li
                key={task.id}
                className={`task-item ${task.completed ? 'completed' : ''} ${task.date < todayDateString ? 'pending' : ''} fade-in`}
              >
                <label className="task-label">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="task-checkbox"
                  />
                  <span className="task-text">
                    {task.text}
                    {task.date < todayDateString && !task.completed && <span className="task-overdue">Pending</span>}
                  </span>
                </label>
                <button
                  className="delete-button danger"
                  onClick={() => deleteTask(task.id)}
                  title="Delete task"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {visibleTasks.length > 0 && (
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
          />
        </div>
      )}
    </div>
  )
}
