// BankAccountForm.js
import React, { useState, useEffect } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { addDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase.config';
import { collection } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const BankAccountForm = ({ closeDialog, userId }) => {
  const stripe = useStripe();
  const [email, setEmail] = useState("");
  const [stripeCustomerId, setStripeCustomerId] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setEmail(user.email);

        // Check if the user already has a Stripe customer ID
        const userDocRef = doc(db, 'bankAccounts', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().stripeCustomerId) {
          setStripeCustomerId(userDoc.data().stripeCustomerId);
        }
      } else {
        setEmail("");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe) {
      console.log("Stripe.js hasn't loaded yet.");
      return;
    }

    if (!email) {
      console.error('No email found');
      return;
    }

    // Collect bank details from form fields
    const bankName = event.target.bankName.value;
    const accountNumber = event.target.accountNumber.value;
    const routingNumber = event.target.routingNumber.value;

    // Create a token with bank account details directly
    const result = await stripe.createToken('bank_account', {
      country: 'US',
      currency: 'usd',
      routing_number: routingNumber,
      account_number: accountNumber,
      account_holder_name: bankName,
      account_holder_type: 'individual', 
    });

    if (result.error) {
      console.error(result.error.message);
    } else {
      console.log('Bank account token:', result.token.id);
      
      try {
        let customerId = stripeCustomerId;

        if (!customerId) {
          // Create a new Stripe customer
          const response = await fetch('http://localhost:3001/api/create-customer', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
          });

          const customerData = await response.json();

          if (customerData.success) {
            customerId = customerData.customerId;
            setStripeCustomerId(customerId);
          } else {
            console.error('Error creating Stripe customer:', customerData.message);
            return;
          }
        }

        // Attach the bank account to the Stripe customer
        const attachResponse = await fetch('http://localhost:3001/api/attach-bank-account', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ customerId, bankAccountToken: result.token.id })
        });

        const attachData = await attachResponse.json();

        if (attachData.success) {
          const bankAccount = attachData.bankAccount;

          // Save the bank account information in Firestore
          const docRef = await addDoc(collection(db, 'bankAccounts'), {
            userId: userId,
            token: result.token.id,
            bankName: bankName,
            routingNumber: routingNumber,
            last4: accountNumber.slice(-4),
            stripeCustomerId: customerId,
            bankAccountId:  bankAccount.id
          });

          console.log('Document written with ID: ', docRef.id);
          closeDialog();  // Optionally close the dialog on success
        } else {
          console.error('Error attaching bank account:', attachData.message);
        }
      } catch (e) {
        console.error('Error handling bank account:', e);
      }
    }
  };
 

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="bankName">Bank Name</label>
      <input id="bankName" name="bankName" required />

      <label htmlFor="accountNumber">Account Number</label>
      <input id="accountNumber" name="accountNumber" required type="number" />

      <label htmlFor="routingNumber">Routing Number</label>
      <input id="routingNumber" name="routingNumber" required type="number" />

      <Button type="submit" disabled={!stripe}>Submit</Button>
    </form>
  );
};

export default BankAccountForm;
