// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCCEJ01mm5RjyKhhRXyPBjFyyHUKluAeT8",
  authDomain: "crecipayproj.firebaseapp.com",
  projectId: "crecipayproj",
  storageBucket: "crecipayproj.appspot.com",
  messagingSenderId: "749877361881",
  appId: "1:749877361881:web:39986415a0f51b2ac212c8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, app };