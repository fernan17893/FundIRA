import Stripe from 'stripe';
const stripe = new Stripe('sk_test_51P7zmMRqlaXFAeEOswB4OCwnhio25wQFstoDcHnagT7sHfwaZwyvWLRND3F9wFPAiLZJSMwWAivVhV1ooaPr6BIl00tbX16P1m', {
  apiVersion: '2020-08-27',
});

export { stripe };


