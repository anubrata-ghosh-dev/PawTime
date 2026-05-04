import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// User profile helper functions
export async function saveUserName(uid, name) {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, { name, updatedAt: new Date() }, { merge: true });
  } catch (err) {
    console.error('Error saving user name:', err);
    throw err;
  }
}

export async function getUserName(uid) {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists() && userSnap.data().name) {
      return userSnap.data().name;
    }
    // Return null if no document or no name field (first time user)
    return null;
  } catch (err) {
    console.error('Error getting user name:', err);
    // Throw error so Auth component can handle it
    throw err;
  }
}
