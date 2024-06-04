// Dashboard.js
"use client";
import React, { useState } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { getAuth, signOut } from "firebase/auth";
import { app } from '../../firebase.config';
import Contributions from './contributions';
import FundingSources from './fundingsources';
import { RiFundsBoxFill, RiLogoutBoxRLine, RiFileListLine, RiBankLine } from 'react-icons/ri'; // Importing icons from react-icons
import './globals.css'
import './app.css'

export default function Dashboard() {
  const [activePanel, setActivePanel] = useState('contributions');
  const auth = getAuth(app);

  const handleLogout = () => {
    signOut(auth).catch((error) => console.error('Logout failed', error));
  };

  const renderContent = () => {
    switch (activePanel) {
      case 'contributions':
        return <Contributions />;
      case 'fundingSources':
        return <FundingSources />;
      default:
        return <Contributions />; // Default case if no active panel matches
    }
  };

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel className="left-panel">
        <div className="menu">
          <div className="menu-title"><RiFundsBoxFill className='menu-title-image' /> NextIRA</div>
          <Button variant={"secondary"} onClick={() => setActivePanel('contributions')}>
            <RiFileListLine /> Contributions
          </Button>
          <Button variant={"secondary"} onClick={() => setActivePanel('fundingSources')}>
            <RiBankLine /> Funding Sources
          </Button>
          <Button variant={"secondary"} onClick={handleLogout}>
            <RiLogoutBoxRLine /> Logout
          </Button>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel className="right-panel">
        {renderContent()}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
