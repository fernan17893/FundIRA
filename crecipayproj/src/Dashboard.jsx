import React, { useState } from 'react';
import './dashboard.css';
import { signOut } from 'firebase/auth';
import Contribution from './Contribution';
import AddFundSource from './FundSource';
import {
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { FaPiggyBank, FaUserCircle, FaSignOutAlt} from 'react-icons/fa';
import { RiMoneyDollarCircleLine } from "react-icons/ri"; 
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { DialogDescription, DialogTrigger, DialogTitle } from 'radix-ui';
import { useNavigate } from 'react-router-dom';
import './index.css';
import { RiFundsBoxFill } from "react-icons/ri";

function Dashboard() {
    
    const [activeTab, setActiveTab] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/');
        }
        catch (error) {
            console.error(error);
        }
    };


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
                        <Dialog>
                        <DialogTrigger className='profilebutton'>Edit Profile</DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                            <DialogTitle> Edit Profile Details </DialogTitle>
                            <DialogDescription> Update your account information. </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={""} className="profile-form">
                            <div className="form-field">
                                <label htmlFor="firstName" className="form-label">First Name:</label>
                                <input
                                    id="firstName"
                                    type="text"
                                    className="form-input"
                                    value={firstName}
                                    onChange={e => setFirstName(e.target.value)}
                                    placeholder="Enter your first name"
                                    required
                                />
                            </div>
                            <div className="form-field">
                                <label htmlFor="lastName" className="form-label">Last Name:</label>
                                <input
                                    id="lastName"
                                    type="text"
                                    className="form-input"
                                    value={lastName}
                                    onChange={e => setLastName(e.target.value)}
                                    placeholder="Enter your last name"
                                    required
                                />
                            </div>
                            <div className="form-field">
                                <label htmlFor="email" className="form-label">Email:</label>
                                <input
                                    id="email"
                                    type="email"
                                    className="form-input"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    required
                                />
                            </div>
                            <div className="form-field">
                                <label htmlFor="phone" className="form-label">Phone:</label>
                                <input
                                    id="phone"
                                    type="tel"
                                    className="form-input"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    placeholder="Enter your phone number"
                                    required
                                />
                            </div>
                            <div className="form-field">
                                <label htmlFor="address" className="form-label">Address:</label>
                                <input
                                    id="address"
                                    type="text"
                                    className="form-input"
                                    value={address}
                                    onChange={e => setAddress(e.target.value)}
                                    placeholder="Enter your address"
                                    required
                                />
                            </div>
                            <div className="form-field">
                                <label htmlFor="city" className="form-label">City:</label>
                                <input
                                    id="city"
                                    type="text"
                                    className="form-input"
                                    value={city}
                                    onChange={e => setCity(e.target.value)}
                                    placeholder="Enter your city"
                                    required
                                />
                            </div>
                            <div className="form-field">
                                <label htmlFor="state" className="form-label">State:</label>
                                <input
                                    id="state"
                                    type="text"
                                    className="form-input"
                                    value={state}
                                    onChange={e => setState(e.target.value)}
                                    placeholder="Enter your state"
                                    required
                                />
                                </div>
                                <button type="submit" className="profileform-button">Update</button>
                                </form>
                                </DialogContent>
                                </Dialog>

                    </div>
                );
                break;
            default:
                component = (
                    <div className='right-paneltext'>
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
                <div className="menu-title">
                    <RiFundsBoxFill />
                   
                        <div className="menu-subtitle">
                            <h1>FundiRA</h1>  
                            <h2> Welcome, {}</h2>
                             </div>
                             </div>
                    <ul className='menu-item-list'>
                       <li className='menu-items'>
                            <Button
                                variant="ghost"
                                onClick={() => setActiveTab("contribute")}
                                className={activeTab === "contribute" ? "active" : ""}
                            >
                                <RiMoneyDollarCircleLine /> Contribute
                            </Button>
                        </li>
                        <li className='menu-items'>
                            <Button
                                variant="ghost"
                                onClick={() => setActiveTab("fund-sources")}
                                className={activeTab === "fund-sources" ? "active" : ""}
                            >
                                <FaPiggyBank /> Fund Sources
                            </Button>
                        </li>
                        <li className='menu-items'>
                            <Button
                                variant="ghost"
                                onClick={() => setActiveTab("profile")}
                                className={activeTab === "profile" ? "active" : ""}
                            >
                                <FaUserCircle /> Profile
                            </Button>
                        </li>
                        <li className='menu-items'>
                            <Button
                                variant="ghost"
                                onClick={handleSignOut}
                                className={activeTab === "sign-out" ? "active" : ""}
                            >
                                <FaSignOutAlt /> Sign Out
                            </Button>
                        </li>
                    </ul>
                </div>
            </ResizablePanel>
            <ResizablePanel className="right-paneltext">
                {renderActiveTab()}
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}

export default Dashboard;
