import { signOut } from 'firebase/auth'
import { auth, getUserName } from '../firebase'
import { useState, useEffect } from 'react'
import './Header.css'

export default function Header({ user }) {
  const [userName, setUserName] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    if (!user) {
      setUserName(null);
      setLoading(false);
      return;
    }

    getUserName(user.uid).then(name => {
      setUserName(name);
      setLoading(false);
    }).catch(err => {
      console.error('Error loading user name:', err);
      setLoading(false);
    });
  }, [user]);

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🐾</span>
            <h1>PawTime</h1>
          </div>
          <nav className="nav">
            {user && (
              <div className="user-menu">
                <span className="user-name">
                  {loading ? 'Loading...' : userName || user.displayName || 'PawTime friend'}
                </span>
                <button onClick={handleLogout} className="secondary logout-button">
                  Log Out
                </button>
              </div>
            )}
            {!user && <p className="tagline">Focus & Task Management</p>}
          </nav>
        </div>
      </div>
    </header>
  )
}
