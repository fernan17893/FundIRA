import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase.config';

const VerifyBankAccountDialog = ({ open, setOpen, verifyBankAccount }) => {
    const [amountOne, setAmountOne] = useState('');
    const [amountTwo, setAmountTwo] = useState('');
    const [bankAccountId, setBankAccountId] = useState(''); 

    useEffect(() => {
        const fetchBankAccountId = async () => {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                const userDocRef = doc(db, 'bankAccounts', user.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setBankAccountId(data.BankAccountId);
                }
            }
        }

        fetchBankAccountId();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        await verifyBankAccount([parseInt(amountOne), parseInt(amountTwo)]);
        setOpen(false); // Close the dialog after submission
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Verify Bank Account</DialogTitle>
                    <DialogDescription>
                        Please enter the amounts of the two micro-deposits we sent to your bank account.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <input type="number" placeholder="First amount" required value={amountOne} onChange={(e) => setAmountOne(e.target.value)} />
                    <input type="number" placeholder="Second amount" required value={amountTwo} onChange={(e) => setAmountTwo(e.target.value)} />
                    <Button type="submit">Verify</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default VerifyBankAccountDialog;
