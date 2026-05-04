import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { auth, saveUserName, getUserName } from '../firebase';
import './Auth.css';

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [nameLoading, setNameLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [pendingUserId, setPendingUserId] = useState('');
  const [nameError, setNameError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let user;
      if (isLogin) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        user = result.user;
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        user = result.user;
      }
      
      // Small delay to ensure Firestore is ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if user has a name set - first check Firebase Auth displayName, then Firestore
      let existingName = user.displayName;
      if (!existingName) {
        try {
          existingName = await getUserName(user.uid);
        } catch (firestoreErr) {
          console.log('Firestore read error (may be first time):', firestoreErr);
          // If Firestore read fails, assume it's first time
          existingName = null;
        }
      }
      
      if (!existingName) {
        // First time - show name modal
        setCurrentUser(user);
        setPendingUserId(user.uid);
        setShowNameModal(true);
      } else {
        // Has name already - proceed to dashboard
        onLoginSuccess?.();
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-email' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-login-credentials') {
        setError('Invalid login credentials');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Email already exists');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Small delay to ensure Firestore is ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if user has a name set - first check Firebase Auth displayName, then Firestore
      let existingName = user.displayName;
      if (!existingName) {
        try {
          existingName = await getUserName(user.uid);
        } catch (firestoreErr) {
          console.log('Firestore read error (may be first time):', firestoreErr);
          // If Firestore read fails, assume it's first time
          existingName = null;
        }
      }
      
      if (!existingName) {
        // First time - show name modal
        setCurrentUser(user);
        setPendingUserId(user.uid);
        setShowNameModal(true);
      } else {
        // Has name already - proceed to dashboard
        onLoginSuccess?.();
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Login cancelled');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection.');
      } else {
        setError('Google login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async (e) => {
    e.preventDefault();
    setNameError('');
    if (!userName.trim()) {
      setNameError('Please enter your name');
      return;
    }
    
    setNameLoading(true);
    try {
      const uid = pendingUserId || currentUser?.uid || auth.currentUser?.uid;
      const firebaseUser = currentUser || auth.currentUser;
      if (!uid) {
        throw new Error('No authenticated user session found.');
      }

      const trimmedName = userName.trim();

      try {
        await saveUserName(uid, trimmedName);
      } catch (firestoreErr) {
        console.error('Non-blocking Firestore save error:', firestoreErr);
      }

      if (firebaseUser) {
        try {
          await updateProfile(firebaseUser, { displayName: trimmedName });
        } catch (profileErr) {
          console.error('Non-blocking auth profile update error:', profileErr);
        }
      }

      setShowNameModal(false);
      setUserName('');
      setCurrentUser(null);
      setPendingUserId('');
      onLoginSuccess?.();
    } catch (err) {
      console.error(err);
      setNameError('Could not continue. Please try again.');
    } finally {
      setNameLoading(false);
    }
  };


  if (showNameModal) {
    return (
      <div className="auth-container name-modal-container">
        <svg className="paw-watermark" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="60" r="35" fill="currentColor"/>
          <circle cx="60" cy="130" r="25" fill="currentColor"/>
          <circle cx="100" cy="150" r="25" fill="currentColor"/>
          <circle cx="140" cy="130" r="25" fill="currentColor"/>
          <circle cx="75" cy="170" r="20" fill="currentColor"/>
          <circle cx="125" cy="170" r="20" fill="currentColor"/>
        </svg>
        
        <div className="auth-card name-modal">
          <div className="auth-header">
            <h2>Complete Your Profile</h2>
            <p>What should we call you?</p>
          </div>
          
          <form onSubmit={handleSaveName} className="auth-form">
            <div className="form-group">
              <label htmlFor="username">Full Name</label>
              <input
                id="username"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="John Doe"
                maxLength="50"
                autoFocus
              />
            </div>
            
            {nameError && <div className="auth-error">{nameError}</div>}
            
            <button 
              type="submit" 
              className="auth-button primary"
              disabled={nameLoading}
            >
              {nameLoading ? 'Saving...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <svg className="paw-watermark" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="60" r="35" fill="currentColor"/>
        <circle cx="60" cy="130" r="25" fill="currentColor"/>
        <circle cx="100" cy="150" r="25" fill="currentColor"/>
        <circle cx="140" cy="130" r="25" fill="currentColor"/>
        <circle cx="75" cy="170" r="20" fill="currentColor"/>
        <circle cx="125" cy="170" r="20" fill="currentColor"/>
      </svg>
      
      <div className="auth-card">
        <div className="auth-header">
          <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p>{isLogin ? 'Sign in to your PawTime account' : 'Get started with PawTime'}</p>
        </div>


        <form onSubmit={handleSubmit} className="auth-form">
          <div className="credentials-box">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && <div className="auth-error">{error}</div>}
          
          <button 
            type="submit" 
            className="auth-button primary"
            disabled={loading}
          >
            {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button 
          type="button"
          onClick={handleGoogleLogin}
          className="google-button"
          disabled={loading}
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"></path>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            <path fill="none" d="M0 0h48v48H0z"></path>
          </svg>
          Continue with Google
        </button>

        <div className="auth-toggle">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            className="secondary-toggle"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}
