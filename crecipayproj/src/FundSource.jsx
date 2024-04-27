import React, { useState } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import './dashboard.css';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {  useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const functions = getFunctions();
const addBankAccount = httpsCallable(functions, 'addBankAccount');

function AddFundSource() {
    const { currentUser } = useAuth();
    const [accountNumber, setAccountNumber] = useState('');
    const [routingNumber, setRoutingNumber] = useState('');
    const [fundName, setFundName] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [bankAccounts, setBankAccounts] = useState([]);
    const [bankAccountId, setBankAccountId] = useState('');
  
    useEffect(() => {
      // Fetch user data when currentUser changes
      if (currentUser && currentUser.uid) {
        const fetchUserData = async () => {
          const db = getFirestore();
          const userRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userRef);
    
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.bankAccounts) {
              // Ensure that bankAccounts is an array
              setBankAccounts(Array.isArray(userData.bankAccounts) ? userData.bankAccounts : []);
            }
          }
        };
    
        fetchUserData();
      }
    }, [currentUser]);
  
    const handleSubmit = async (event) => {
      event.preventDefault();
      if (!currentUser) {
        console.error("No user logged in");
        return;
      }
  
      try {
        const bankAccountData = {
          account_number: accountNumber,
          routing_number: routingNumber,
          account_holder_name: fundName,
          account_holder_type: 'individual'
        };
  
        const response = await addBankAccount(bankAccountData);
        console.log("Bank account added successfully:", response.data);
        setBankAccountId(response.data.bankAccountId);
        alert("Bank account added successfully!");
      } catch (error) {
        console.error("Failed to add bank account:", error);
        alert("Failed to add bank account. Please try again.");
      }
    };

    console.log("bankAccounts", bankAccounts)

  

  
    return (
      <div className="right-panel">
        <Dialog>
          <DialogTrigger as="Bank-button" className="button">
            Add Bank
          </DialogTrigger>
          <div className="button-border"></div>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Bank Account</DialogTitle>
              <DialogDescription>
                Enter the details of your bank account.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <fieldset className="Fieldset">
                <label className="Label" htmlFor="fundName">
                  Fund Name
                </label>
                <input
                  className="Input"
                  id="fundName"
                  type="text"
                  placeholder="Enter fund name"
                  value={fundName}
                  onChange={(e) => setFundName(e.target.value)}
                />
              </fieldset>
              <fieldset className="Fieldset">
                <label className="Label" htmlFor="accountNumber">
                  Account Number
                </label>
                <input
                  className="Input"
                  id="accountNumber"
                  type="text"
                  placeholder="Enter your bank account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </fieldset>
              <fieldset className="Fieldset">
                <label className="Label" htmlFor="routingNumber">
                  Routing Number
                </label>
                <input
                  className="Input"
                  id="routingNumber"
                  type="text"
                  placeholder="Enter your routing number"
                  value={routingNumber}
                  onChange={(e) => setRoutingNumber(e.target.value)}
                />
              </fieldset>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="secondary" type="submit" className='form-button'>Submit</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        <Carousel className="carousel-container">
          <CarouselPrevious className="carousel-previous">&lt;</CarouselPrevious>
          <CarouselContent className="carousel-content">
            {bankAccounts.map((account, index) => (
              <CarouselItem className='carousel-item' key={index}>
                <div className='account-details' >
                  <p className='item'><strong>Fund Name:</strong> {account.name}</p>
                  <p className='item'><strong>Type:</strong> {account.type}</p>
                  <p className='item'><strong>Account:</strong> ****{account.last4}</p>
                  <p className='balance-amount'><strong>Available Balance:</strong> ${parseFloat(Math.random() * 5000).toFixed(2)}</p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselNext className="carousel-next">&gt;</CarouselNext>
        </Carousel>
      </div>
    );
  }
  
  export default AddFundSource;
  