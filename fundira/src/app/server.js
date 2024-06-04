
const express = require('express');
const bodyParser = require('body-parser');
const stripe = require('stripe')('sk_test_51P7zmMRqlaXFAeEOswB4OCwnhio25wQFstoDcHnagT7sHfwaZwyvWLRND3F9wFPAiLZJSMwWAivVhV1ooaPr6BIl00tbX16P1m'); // Using environment variable for security
const cors = require('cors');
const { admin, db } = require('../../firebaseAdmin.config');

const app = express();
const port = process.env.PORT || 3001;


// Middlewares
app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:3000', // Specify the origin of the frontend
    methods: ['GET', 'POST'], // Methods allowed
    credentials: true // Allow cookies to be sent
}));

const createCustomer = async (email) => {
    return await stripe.customers.create({
        email: email
    });
};

const attachBankAccount = async (customerId, bankAccountToken) => {
    const bankAccount = await stripe.customers.createSource(customerId, {
        source: bankAccountToken
    });
    return bankAccount;
};

const createCharge = async (customerId, bankAccountId, amount) => {
    return await stripe.charges.create({
        amount: Math.round(amount * 100), // Convert amount to cents
        currency: 'usd',
        customer: customerId,
        source: bankAccountId,
        description: 'IRA Contribution',
    });
};

app.post('/api/contributions', async (req, res) => {
    const { email, bankAccountId, amount } = req.body;

    try {
        const user = await admin.auth().getUserByEmail(email);
        const userId = user.uid;

        const bankAccountSnapshot = await db.collection('bankAccounts').where('userId', '==', userId).get();
        if (bankAccountSnapshot.empty) {
            return res.status(400).json({ success: false, message: 'Bank account not found' });
        }

        const bankAccountDoc = bankAccountSnapshot.docs[0];
        const stripeCustomerId = bankAccountDoc.data().stripeCustomerId;

        const charge = await createCharge(stripeCustomerId, bankAccountId, amount);
        res.json({ success: true, charge });
    } catch (error) {
        console.error('Contribution Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/create-customer', async (req, res) => {
    const { email } = req.body;

    try {
        const customer = await createCustomer(email);
        console.log('Customer:', customer);
        res.json({ success: true, customerId: customer.id });
    } catch (error) {
        console.error('Stripe Create Customer Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});



app.post('/api/verify-bank-account', async (req, res) => {
    const { customerId, bankAccountId, amounts } = req.body;

    

    try {
        const verifiedBankAccount = await stripe.customers.verifySource(
            customerId,
            bankAccountId,
            {amounts}
        );
        res.json({ success: true, verifiedBankAccount });
    } catch (error) {
        console.error('Verification Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/attach-bank-account', async (req, res) => {
    const { customerId, bankAccountToken } = req.body;
  
    try {
      const bankAccount = await attachBankAccount(customerId, bankAccountToken);
      res.json({ success: true, bankAccount });
    } catch (error) {
      console.error('Attach Bank Account Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });
  

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

/**  async function attachAndVerifyBankAccount(customerId, bankAccountToken) {
    // Attach the bank account
    const bankAccount = await stripe.customers.createSource(customerId, {
        source: bankAccountToken
    });

    // Initiate verification
    await stripe.customers.verifySource(customerId, bankAccount.id, {
        amounts: [32, 45] // These are normally provided by Stripe
    });

    return bankAccount;
} */