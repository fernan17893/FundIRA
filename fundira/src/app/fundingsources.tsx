import React, { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import stripePromise from './stripe-client'; // Path to your Stripe client file
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import BankAccountForm from './BankAccountForm'; 
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from '../../firebase.config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import VerifyBankAccountDialog from './verificationform';

export default function FundingSources() {
  const [bankAccounts, setBankAccounts] = useState([]); 
  const [userId, setUserId] = useState(false); 
  const [open, setOpen] = useState(false);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [selectedAccountForVerification, setSelectedAccountForVerification] = useState(null);

  const closeDialog = () => setOpen(false);

  const handleVerifyAccount = (account) => {
    console.log('Selected account for verification:', account); // Debugging
    setSelectedAccountForVerification(account);
    setVerificationDialogOpen(true);
  };

  const verifyBankAccount = async (amounts) => {
    if  (!selectedAccountForVerification) {
        console.error('No account selected for verification');
        return;
    }

    console.log('Verifying bank account:', selectedAccountForVerification); // Debugging

    const response = await fetch('http://localhost:3001/api/verify-bank-account', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            customerId: selectedAccountForVerification.stripeCustomerId,
            bankAccountId: selectedAccountForVerification.bankAccountId,
            amounts: amounts
        })
    });

    if (!response.ok) {
        console.error('Failed to verify bank account');
    }
     else {
      console.log('Bank account verified successfully');
     }
};

  useEffect(() => {
    const auth = getAuth();
    const unsuscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('User id set:', user.uid); // Log the user ID (optional
        setUserId(user.uid);
      } else {
        // User is signed out
        setUserId(false);
      }
    });

    return () => unsuscribe();
  }, []);


  useEffect(() => {
    if (userId) {
      console.log('Fetching bank accounts for user ID: ', userId); // Debugging
      const fetchBankAccounts = async () => {
        const q = query(collection(db, 'bankAccounts'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        const accounts = querySnapshot.docs.map((doc) => {
          console.log('Account data fetched: ', doc.data()); // Debugging
          return doc.data();
        });
        setBankAccounts(accounts);
      };
      fetchBankAccounts();
    }
  }, [userId]);

  return (
    <div className="container">
      <h1>Funding Sources</h1>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="default" size="sm">Add Fund Source</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add ACH Direct Debit Bank Account</DialogTitle>
            <DialogDescription>
              Enter your bank account details below.
            </DialogDescription>
          </DialogHeader>
          <Elements stripe={stripePromise}>
            <BankAccountForm closeDialog={closeDialog} userId={userId} />
          </Elements>
        </DialogContent>
      </Dialog>
      <VerifyBankAccountDialog 
        open={verificationDialogOpen} 
        setOpen={setVerificationDialogOpen} 
        verifyBankAccount={(amounts) => verifyBankAccount(amounts)}
      />
      <Table className="table">
        <TableCaption>Funding Sources</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Source Name</TableHead>
            <TableHead>Account Number</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Balance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
  {bankAccounts.map((account, index) => (
    <TableRow key={index}>
      <TableCell>{account.bankName}</TableCell>
      <TableCell>****{account.last4}</TableCell>
      <TableCell>{account.routingNumber}</TableCell>
      <TableCell>$5000</TableCell> {/* Example balance */}
      <TableCell>
        {account.verified ? (
          "Verified"
        ) : (
          <Button onClick={() => handleVerifyAccount(account)}>Verify</Button>
        )}
      </TableCell>
    </TableRow>
  ))}
</TableBody>
      </Table>
    </div>
  );
}
