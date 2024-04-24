import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import * as Tabs from '@radix-ui/react-tabs';
import { signUp, signIn } from './Auth.jsx';
import './index.css'


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Create navigate function instance

  const handleSignUp = () => {
    signUp(email, password)
      .then(() => {
        console.log("Signed up successfully!");
        navigate('/dashboard'); // Navigate to the dashboard after sign up
      })
      .catch((error) => {
        console.error('Error signing up:', error.message);
      });
  };

  const handleSignIn = () => {
    signIn(email, password)
      .then(() => {
        console.log("Signed in successfully!");
        navigate('/dashboard'); // Navigate to the dashboard after sign in
      })
      .catch((error) => {
        console.error('Error signing in:', error.message);
      });
  };

  return (
    <div className="App">
      <Tabs.Root className="TabsRoot" defaultValue="tab1">
        <Tabs.List className="TabsList" aria-label="Manage your account">
          <Tabs.Trigger className="TabsTrigger" value="tab1">
            Login
          </Tabs.Trigger>
          <Tabs.Trigger className="TabsTrigger" value="tab2">
            Sign Up
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content className="TabsContent" value="tab1">
          <p className="Text">Please provide email and password</p>
          <fieldset className="Fieldset">
            <label className="Label" htmlFor="email">
              Email
            </label>
            <input
              className="Input"
              id="email"
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </fieldset>
          <fieldset className="Fieldset">
            <label className="Label" htmlFor="password">
              Password
            </label>
            <input
              className="Input"
              id="password"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </fieldset>
          <div style={{ display: 'flex', marginTop: 20, justifyContent: 'flex-end' }}>
            <button className="Button green" onClick={handleSignIn}>
              Sign In
            </button>
          </div>
        </Tabs.Content>
        <Tabs.Content className="TabsContent" value="tab2">
          <p className="Text">Register to Create Your Account</p>
          <fieldset className="Fieldset">
            <label className="Label" htmlFor="newEmail">
              Email
            </label>
            <input
              className="Input"
              id="newEmail"
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </fieldset>
          <fieldset className="Fieldset">
            <label className="Label" htmlFor="newPassword">
              New Password
            </label>
            <input
              className="Input"
              id="newPassword"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
            />
          </fieldset>
          <div style={{ display: 'flex', marginTop: 20, justifyContent: 'flex-end' }}>
            <button className="Button green" onClick={handleSignUp}>
              Create Account
            </button>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
};

export default LoginPage;
