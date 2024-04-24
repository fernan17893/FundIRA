const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')('sk_test_51P7zmMRqlaXFAeEOswB4OCwnhio25wQFstoDcHnagT7sHfwaZwyvWLRND3F9wFPAiLZJSMwWAivVhV1ooaPr6BIl00tbX16P1m');

admin.initializeApp();

exports.addBankAccount = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    const uid = context.auth.uid;
    const userRef = admin.firestore().collection('users').doc(uid);

    try {
        let userDoc = await userRef.get();
        let customerId = userDoc.exists && userDoc.data().stripeCustomerId ? userDoc.data().stripeCustomerId : null;

        if (!customerId) {
            const newUser = await admin.auth().getUser(uid);
            const customer = await stripe.customers.create({
                email: newUser.email,
                name: newUser.displayName || 'Unnamed User',
            });
            customerId = customer.id;
            await userRef.set({ stripeCustomerId: customerId }, { merge: true });
        }

        const { account_number, routing_number, account_holder_name, account_holder_type } = data;
        const token = await stripe.tokens.create({
            bank_account: {
                country: 'US',
                currency: 'usd',
                account_holder_name,
                account_holder_type,
                routing_number,
                account_number,
            },
        });

        await stripe.customers.createSource(customerId, { source: token.id });

        // Update Firestore with bank account details
        let bankAccounts = userDoc.exists && userDoc.data().bankAccounts ? userDoc.data().bankAccounts : [];
        bankAccounts.push({
            id: token.id,
            name: account_holder_name,
            last4: account_number.slice(-4), // Last 4 digits of 
            type: account_holder_type
        });

        await userRef.set({ bankAccounts: bankAccounts }, { merge: true });

        return { message: "Bank account added successfully to Stripe customer!", bankAccountId: token.id };
    } catch (error) {
        console.error('Error adding bank account:', error);
        throw new functions.https.HttpsError('internal', `Failed to add bank account: ${error.message}`, { error: error });
    }
});

exports.createUser = functions.auth.user().onCreate(async (user) => {
    const userRef = admin.firestore().collection('users').doc(user.uid);
    const doc = await userRef.get();
    if (doc.exists && doc.data().stripeCustomerId) {
        return;
    }

    try {
        const customer = await stripe.customers.create({
            email: user.email,
            name: user.displayName || 'Unnamed User',
        });
        await userRef.set({ stripeCustomerId: customer.id }, { merge: true });
        return { message: 'Stripe customer created successfully!', stripeCustomerId: customer.id };
    } catch (error) {
        console.error('Failed to create Stripe customer:', error);
        throw new functions.https.HttpsError('internal', 'Failed to create Stripe customer', { error: error.toString() });
    }
});

exports.initiateMicrodeposits = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }

    const { bankAccountId, customerId } = data;
    try {
        await stripe.customers.verifySource(customerId, bankAccountId, { amounts: [32, 45] });
        return { message: 'Microdeposits sent, please verify amounts to complete verification.' };
    } catch (error) {
        console.error('Error initiating microdeposits:', error);
        throw new functions.https.HttpsError('internal', 'Unable to initiate microdeposits', error);
    }
});

exports.verifyMicrodeposits = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    }

    const { bankAccountId, customerId, amounts } = data;
    try {
        await stripe.customers.verifySource(customerId, bankAccountId, { amounts });
        console.log('Microdeposits verified successfully');
        return { verified: true };
    } catch (error) {
        console.error('Error verifying microdeposits:', error);
        throw new functions.https.HttpsError('internal', 'Unable to verify microdeposits', error);
    }
});


exports.processPayment = functions.https.onCall(async (data, context) => {
    // Check for authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication is required.');
    }

    const { amount, bankAccountId, customerId } = data;
    if (!amount || !bankAccountId || !customerId) {
        console.error('Missing payment fields', { amount, bankAccountId, customerId });
        throw new functions.https.HttpsError('invalid-argument', 'Missing required payment fields.');
    }

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), 
            currency: 'usd',
            customer: customerId,
            payment_method: bankAccountId, // Bank account ID  for hardcode option = ba_1P8zAFRqlaXFAeEOLywP2cDO
            confirmation_method: 'manual',
            confirm: true,
            payment_method_options: {
                us_bank_account: {
                    verification_method: 'instant'  
                }
            },
            mandate_data: {
                customer_acceptance: {
                    type: 'online',
                    online: {
                        ip_address: '192.0.2.1', // Example IP, use for testing
                        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36', // Example User Agent
                        date: Math.floor(Date.now() / 1000),  // Current timestamp
                        accepted: true,
                    }
                }
            }
        });

        console.log(`Payment processed successfully: ${paymentIntent.id}`);
        return { success: true, paymentIntentId: paymentIntent.id };
    } catch (error) {
        console.error("Error processing payment Backend:", error);
        if (error.stripeResponse) {
            console.error("Stripe error:", error.stripeResponse);
            console.log("Stripe error code:", error.stripeResponse.statusCode);
        }
        throw new functions.https.HttpsError('internal', 'Failed to process payment', {
            error: error.toString(),
            stack: error.stack,
        });
    }
});




  


// Create and deploy your first functions


// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
