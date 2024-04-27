const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { billing } = require('firebase-functions/v2/alerts');
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

            // Set custom claim for the user
            await admin.auth().setCustomUserClaims(uid, { stripeCustomerId: customerId });
        }

        const { account_number, routing_number, account_holder_name, account_holder_type } = data;

        // Ensure that routing_number is provided
        if (!routing_number) {
            throw new functions.https.HttpsError('invalid-argument', 'Routing number is required.');
        }

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
            account_number: account_number,
            last4: account_number.slice(-4), // Last 4 digits of 
            type: account_holder_type,
            routing_number: routing_number // Include routing number in bank account details
        });

        await userRef.set({ bankAccounts: bankAccounts }, { merge: true });

        // Update bankAccountId in Firestore to match the correct value from Stripe
        const updatedBankAccounts = bankAccounts.map(account => {
            if (account.id === token.id) {
                // Update the bankAccountId to the correct value from Stripe
                return { ...account, id: token.bank_account };
            }
            return account;
        });

        await userRef.set({ bankAccounts: updatedBankAccounts }, { merge: true });

        return { message: "Bank account added successfully to Stripe customer!", bankAccountId: token.id };
    } catch (error) {
        console.error('Error adding bank account:', error);
        throw new functions.https.HttpsError('internal', `Failed to add bank account: ${error.message}`, { error: error });
    }
});



exports.processPayment = functions.https.onCall(async (data, context) => {
    // Auth check
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Authentication is required.');
    }

    const { amount, bankAccountToken, customerId } = data;

    if (!amount || !bankAccountToken || !customerId) {
        console.error('Missing payment fields', { amount, bankAccountToken, customerId });
        throw new functions.https.HttpsError('invalid-argument', 'Missing required payment fields.');
    }

    console.log("Recieved data:", { amount, bankAccountToken, customerId })

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), 
            currency: 'usd',
            customer: customerId,
            payment_method: bankAccountToken.id,
            payment_method_types: ['ach_debit'],


        });

        console.log(`Payment processed successfully: ${paymentIntent.id}`);
        return { success: true, paymentIntentId: paymentIntent.id };
    } catch (error) {
        console.error("Error processing payment:", error);
        console.log("Error processing payment:", error.details);
        throw new functions.https.HttpsError('internal', 'Failed to process payment', {
            error: error.toString(),
            stack: error.stack,
        });
    }
});



/**exports.createUser = functions.auth.user().onCreate(async (user) => {
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
**/
  


// Create and deploy your first functions


// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
