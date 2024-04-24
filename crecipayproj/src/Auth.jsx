// Auth.js
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from './firebase.config.js';  // Import the Firebase app

const auth = getAuth(app);

// SignUp function
export function signUp(email, password) {
  return createUserWithEmailAndPassword(auth, email, password)
}

// SignIn function
export function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
}
