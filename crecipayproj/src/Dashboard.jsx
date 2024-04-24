import React, { useState } from 'react';
import './dashboard.css';
import Contribution from './Contribution';
import AddFundSource from './FundSource';
import {
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { FaPiggyBank, FaUserCircle, FaSignOutAlt, FaHandHoldingUsd} from 'react-icons/fa'; 
import { FaMoneyBillTrendUp } from "react-icons/fa6";


function Dashboard() {
    
    const [activeTab, setActiveTab] = useState("");

    const renderActiveTab = () => {
        let component = null; // Hold the component to render

        switch (activeTab) {
            case "contribute":
                component = (
                    <div>
                        <h1>Dashboard</h1>
                        <p>Welcome to your dashboard. Here you can view your recent invoices and other account information.</p>
                        <Contribution />
                    </div>
                );
                break;
            case "fund-sources":
                component = (
                    <div>
                        <h1>Fund Sources</h1>
                        <p>Manage your bank accounts and payment methods.</p>
                        <AddFundSource />
                    </div>
                );
                break;
            case "profile":
                component = (
                    <div>
                        <h1>Profile</h1>
                        <p>Update your account information.</p>
                        <Button variant="secondary" onClick={() => console.log('Editing profile')}>Edit Profile</Button>
                    </div>
                );
                break;
            default:
                component = (
                    <div>
                        <h1>Dashboard</h1>
                        <p>Welcome to your dashboard. Here you can view your recent invoices and other account information.</p>
                        <Contribution />
                    </div>
                );
                break;
        }

        return component;
    };

    return (
        <ResizablePanelGroup direction="horizontal" style={{ width: '100%', height: '100%' }}>
            <ResizablePanel className="left-panel">
                <div className="menu">
                    <ul>
                        <li className="menu-title">
                        <FaMoneyBillTrendUp /> FundIRA</li>
                        <li className="menu-subtitle">Welcome,  </li>
                        <li>
                            <a href="#contribute" onClick={() => setActiveTab("contribute")}>
                                <FaHandHoldingUsd /> Contribute
                            </a>
                        </li>
                        <li>
                            <a href="#fund-sources" onClick={() => setActiveTab("fund-sources")}>
                                <FaPiggyBank /> Fund Sources
                            </a>
                        </li>
                        <li>
                            <a href="#profile" onClick={() => setActiveTab("profile")}>
                                <FaUserCircle /> Profile
                            </a>
                        </li>
                        <li>
                            <a href="#logout" onClick={() => console.log('Logging out')}>
                                <FaSignOutAlt /> Log Out
                            </a>
                        </li>
                    </ul>
                </div>
            </ResizablePanel>
            <ResizablePanel className="right-panel">
                {renderActiveTab()}
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}

export default Dashboard;
