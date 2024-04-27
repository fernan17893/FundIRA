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
import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe with your API key
const stripePromise = loadStripe('pk_test_51P7zmMRqlaXFAeEODHfjocA2w0TvdX3KBEERGgQ61iCYsvw5R4zYwlcGFUdDadhKqkPmlaMl4bz9rCNkejiwWgLZ00tWcUvEkq');

function Contribution() {
  const { currentUser } = useAuth();
  const [taxYear, setTaxYear] = useState('2022');
  const [amount, setAmount] = useState('');
  const [bankAccountId, setBankAccountId] = useState('');
  const [bankAccounts, setBankAccounts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  
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

  if (!amount || !bankAccountId || !customerId || !routingNumber || !accountNumber) {
      alert("Please ensure all fields are filled correctly.");
      console.log("Current values:", { amount, bankAccountId, customerId, routingNumber, accountNumber })
      return;
  }

  const stripe = await stripePromise;

  console.log("Submitting contribution...");
  console.log("Current values:", { amount, bankAccountId, customerId, routingNumber, accountNumber })

  try {
      // Create bank account with Stripe.js
      const { token, error } = await stripe.createToken('bank_account', {
        country: 'US',
        currency: 'usd',
        routing_number: routingNumber,
        account_number: accountNumber,
        account_holder_name: 'Test User',
        account_holder_type: 'individual',
      });

      if (error) {
          console.error("Error creating bank account token:", error);
          alert("An error occurred while processing your payment. Please try again later.");
          return;
  }

  const bankAccountToken = token.id;

      // Process payment with the created token
      const paymentResponse = await processPayment({
          amount: parseInt(amount * 100),
          bankAccountToken,
          customerId,
          bankAccountId,
      });

      console.log("Payment response:", paymentResponse.data);
      alert(`Contribution of $${amount} was successful! Transaction ID: ${paymentResponse.data.paymentIntentId}`);
  } catch (error) {
      console.error("Error creating bank account token or processing payment:", error);
      alert("An error occurred while processing your payment. Please try again later.");
  }
}

const handleBankAccountChange = (e) => {
  const selectedAccount = bankAccounts.find(account => account.id.id === e.target.value);
  if (selectedAccount) {
      setBankAccountId(e.target.value);
      setRoutingNumber(selectedAccount.routing_number);
      setAccountNumber(selectedAccount.account_number);
  }
};

  return (
      <div className="right-panel">
        <p> Current contributions: $2,000</p>
        <Dialog>
              <DialogTrigger className="button"> Contribute
              </DialogTrigger>
              <div className="button-border"></div>
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
                  <option key={account.id} value={account.id.id}>{account.name}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="routingNumber" className="form-label">Confirm Routing Number:</label>
              <input
                id="routingNumber"
                type="text"
                className="form-input"
                value={routingNumber}
                onChange={e => setRoutingNumber(e.target.value)}
                placeholder="Enter routing number"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="accountNumber" className="form-label">Confirm Account Number:</label>
              <input
                id="accountNumber"
                type="text"
                className="form-input"
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                placeholder="Enter account number"
                required
              />
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
