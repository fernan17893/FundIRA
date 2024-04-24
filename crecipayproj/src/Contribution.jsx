import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
  import React, {useState, useEffect} from 'react';
import './dashboard.css';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from './AuthContext';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

function Contribution() {
    const { currentUser } = useAuth();
    const [taxYear, setTaxYear] = useState('2022');
    const [amount, setAmount] = useState('');
    const [bankAccountId, setBankAccountId] = useState('');
    const [bankAccounts, setBankAccounts] = useState([]);
    const [customerId, setCustomerId] = useState(''); 

    
    const functions = getFunctions();
    const processPayment = httpsCallable(functions, 'processPayment');

    useEffect(() => {
      if (currentUser && currentUser.uid) {
          const userRef = doc(getFirestore(), 'users', currentUser.uid);
          getDoc(userRef).then(docSnap => {
              if (docSnap.exists()) {
                  const userData = docSnap.data();
                  if (userData.stripeCustomerId) {
                      setCustomerId(userData.stripeCustomerId);  
                  } else {
                      console.log('Stripe Customer ID not found');
                  }
                  if (userData.bankAccounts) {
                      setBankAccounts(userData.bankAccounts);
                  }
              } else {
                  console.log('User document does not exist');
              }
          });
      }
  }, [currentUser]);

    const handleSubmit = async (event) => {
        event.preventDefault();
          if (!amount || !bankAccountId || !customerId) {
            alert("Please ensure all fields are filled correctly.");
            console.log("Current state values:", { amount, bankAccountId, customerId });
            return;
          }

          console.log("Submitting form with values:", { amount, bankAccountId, customerId });

        processPayment({
            amount: parseInt(amount * 100),
            bankAccountId: bankAccountId,
            customerId,
          }).then(result => {
            alert(`Contribution of $${amount} was successful! Transaction ID: ${result.data.paymentIntentId}`);
            console.log("Payment result:", result);
          }
          ).catch(error => {
            console.log("Payment error:", error);
            alert("An error occurred while processing your payment. Please try again later.");
            console.error("Payment error:", error);
            console.log("Payment error code:", error.code);
          });
    }

    const handleBankAccountChange = (e) => {
      console.log("Selected bank account ID:", e.target.value);
      setBankAccountId(e.target.value);
    };

    return (
        <div className="right-panel">
          <Dialog>
                <DialogTrigger className="button"> Contribute
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create IRA Contribution</DialogTitle>
                        <DialogDescription>
                        Enter details for your IRA contribution. This action will update your retirement savings for the selected year.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="ira-form">
              <div className="form-field">
                <label htmlFor="taxYear" className="form-label">Tax Year:</label>
                <select id="taxYear" className="form-select"  value={taxYear} onChange={e => setTaxYear(e.target.value)}>
                  <option value="2022">2022</option>
                  <option value="2023">2023</option>
                  {/* Add more years as needed */}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="bankAccountId" className="form-label">Select Fund:</label>
                <select id="bankAccountId" className="form-select" value={bankAccountId} onChange={handleBankAccountChange}>
                  {bankAccounts.map(account => (
                    <option key={account.id} value={account.id}>{account.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="amount" className="form-label">Amount (up to $5,000):</label>
                <input id="amount" type="number" className="form-input" max="5000" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter amount" />
              </div>
              <button type="submit" className="form-button">Submit</button>
            </form>
                </DialogContent>
            </Dialog>
    
           
        <Table className="contribution-table">
  <TableCaption>A list of your recent invoices.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead className="w-[100px]">Invoice</TableHead>
      
      <TableHead className="text-center">Fund Source</TableHead>
      <TableHead className="text-right">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="font-medium">INV001</TableCell>
      
      <TableCell>Credit Card</TableCell>
      <TableCell className="text-right">$250.00</TableCell>
    </TableRow>
  </TableBody>
</Table>
</div>
    );
}


export default Contribution;