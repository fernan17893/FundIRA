import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'

function AddFundDialog() {
    const [fundName, setFundName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [routingNumber, setRoutingNumber] = useState('');

    const handleSubmit = () => {
        // Here, you would handle the submission logic, perhaps interacting with an API
        console.log('Fund Name:', fundName);
        console.log('Account Number:', accountNumber);
        console.log('Routing Number:', routingNumber);
        // Close the dialog, clear fields, etc.
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Add Bank Account</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Bank Account</DialogTitle>
                    <DialogDescription>
                        Enter the details of your bank account.
                    </DialogDescription>
                </DialogHeader>
                <fieldset
                    label="Fund Name"
                    value={fundName}
                    onChange={(e) => setFundName(e.target.value)}
                />
                <fieldset
                    label="Account Number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                />
                <fieldset
                    label="Routing Number"
                    value={routingNumber}
                    onChange={(e) => setRoutingNumber(e.target.value)}
                />
                <Button onClick={handleSubmit}>Submit</Button>
            </DialogContent>
        </Dialog>
    );
}

export default AddFundDialog;
