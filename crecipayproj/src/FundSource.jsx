import React, { useState } from 'react';
import {
    Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
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
  const { currentUser } = useAuth(); // Assuming AuthContext provides this
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [fundName, setFundName] = useState('');
  const [customerId, setCustomerId] = useState(''); 
  const [bankAccounts, setBankAccounts] = useState([]);
  const [bankAccountId, setBankAccountId] = useState('');
  

  useEffect(() => {
    if (!currentUser) {
      console.log("No user logged in");
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && currentUser.uid) {
      const fetchUserData = async () => {
        const db = getFirestore();
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
  
        if (userDoc.exists()) {
          console.log('User data:', userDoc.data()); // Log the entire user document
          const userData = userDoc.data();
          setCustomerId(userData.stripeCustomerId); // Ensure this is set
          if (userData.bankAccounts) {
            console.log('Bank accounts:', userData.bankAccounts); // Log bank accounts
            setBankAccounts(userData.bankAccounts);
          }
        } else {
          console.log('No user data available');
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
      const bankAccountData = {
        account_number: accountNumber,
        routing_number: routingNumber,
        account_holder_name: fundName,
        account_holder_type: 'individual'
    };

    addBankAccount(bankAccountData)
        .then((response) => {
          console.log("Bank account added successfully:", response.data);
          setBankAccountId(response.data.bankAccountId);
          alert("Bank account added successfully!");
        }).catch((error) => {
          console.error("Failed to add bank account:", error);
          alert("Failed to add bank account. Please try again.");
        });
  };
    return (
        <div className="right-panel">
            <Dialog>
                <DialogTrigger as="button" className="button">
                    Add Bank 
                </DialogTrigger>
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
            <Table className="contribution-table">
                <TableCaption>Available ACH Bank Accounts</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Invoice</TableHead>
                        <TableHead className="text-center">Fund Source</TableHead>
                        <TableHead className="text-right">Account Number</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {bankAccounts.map((account, index) => (
                    <TableRow key={index}>
                        <TableCell>{account.name}</TableCell>
                        <TableCell>{account.type}</TableCell>
                        <TableCell className="text-right">{account.last4}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </div>
    );
}

export default AddFundSource;
