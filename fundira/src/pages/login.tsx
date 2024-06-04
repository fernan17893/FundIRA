import { useState } from "react";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { app } from '../../firebase.config'; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import '../app/globals.css'
import './login.css'
import { Button } from "@/components/ui/button";

export default function LoginSignup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const auth = getAuth(app);

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error(error);
      alert("Error: " + error.message);
    }
  };

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error(error);
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="auth-container">
      <Tabs defaultValue="signIn" className="TabsRoot">
        <TabsList className="TabsList" aria-label="Manage your account">
          <TabsTrigger className="TabsTrigger" value="signIn">Sign In</TabsTrigger>
          <TabsTrigger className="TabsTrigger" value="signUp">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent className="TabsContent" value="signIn">
          <div>
            <h1>Sign In</h1>
            <p>Sign in to your account</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
            <Button onClick={handleSignIn}>Sign In</Button>
          </div>
        </TabsContent>
        <TabsContent className="TabsContent" value="signUp">
          <div>
            <h1>Sign Up</h1>
            <p>Create an account</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
            <Button onClick={handleSignUp}>Sign Up</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
