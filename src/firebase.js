import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBNst36eILYmWf2Md608qAbxQK2_a84PNI",
  authDomain: "pawtime-2026.firebaseapp.com",
  projectId: "pawtime-2026",
  storageBucket: "pawtime-2026.firebasestorage.app",
  messagingSenderId: "625361779888",
  appId: "1:625361779888:web:7daf137d98fffdb2d44f75"
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
