import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { db } from '../../firebase.config';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import "./globals.css";
import "./app.css";
import ContributionForm from './contributionform'; // Ensure this path is correct

export default function Contributions() {
  const [open, setOpen] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [contributions, setContributions] = useState([]); // Add this line
  const auth = getAuth();

  useEffect(() => {
    const fetchBankAccounts = async () => {
      const user = auth.currentUser;
      if (user) {
        const q = query(collection(db, 'bankAccounts'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        setBankAccounts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    };

    fetchBankAccounts();
  }, [auth.currentUser]);

  const fetchContributions = async () => {
    const user = auth.currentUser;
    if (user) {
      const q = query(collection(db, 'contributions'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      setContributions(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
  };

  useEffect(() => {
    fetchContributions();
  }, [auth.currentUser]);

  const handleAddContribution = () => {
    setOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const email = event.target.elements.email.value;
    const bankAccountId = event.target.elements.bankAccount.value;
    const amount = event.target.elements.amount.value;
  
    // Construct the payload
    const payload = {
      email: email,
      bankAccountId: bankAccountId,
      amount: amount
    };
  
    // Make API request to your server
    const response = await fetch('http://localhost:3001/api/contributions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  
    if (response.ok) {
      console.log('Contribution processed successfully');
      setOpen(false);

      // Add contribs to Firestore
      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, 'contributions'), {
          userId: user.uid,
          email: email,
          bankAccountId: bankAccountId,
          amount: amount,
          status: 'Completed',
          date: new Date().toISOString()
        });
        fetchContributions();
      }
    } else {
      console.error('Failed to process contribution');
    }
  };
  return (
    <div className="container">
      <h1>Contributions</h1>
      <Button variant={"default"} size={"sm"} onClick={handleAddContribution}>Add Contribution</Button>
      <ContributionForm open={open} setOpen={setOpen} bankAccounts={bankAccounts} handleSubmit={handleSubmit} />
      <Table className="table">
        <TableCaption>Contributions</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
        {contributions.map(contribution => (
            <TableRow key={contribution.id}>
              <TableCell>{new Date(contribution.date).toLocaleDateString()}</TableCell>
              <TableCell>{contribution.status}</TableCell>
              <TableCell>Bank Transfer</TableCell>
              <TableCell className="text-right">${contribution.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
