"use client";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from '../../firebase.config'
import LoginSignup from "../pages/login";
import Dashboard from "./dashboard";

export default function Home() {
  const [user, setUser] = useState(null);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  } , [auth]);

  return user ? <Dashboard /> : <LoginSignup />;
}