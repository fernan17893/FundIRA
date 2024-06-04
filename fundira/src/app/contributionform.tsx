import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ContributionForm = ({ open, setOpen, bankAccounts, handleSubmit }) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Contribution</DialogTitle>
          <DialogDescription>Enter your details and the amount you wish to contribute.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" required placeholder="Enter your email" />
          <label htmlFor="bankAccount">Bank Account:</label>
          <select id="bankAccount" name="bankAccount" required>
            {bankAccounts.map((account, index) => (
              <option key={index} value={account.bankAccountId}>
                {account.bankName} - ****{account.last4}
              </option>
            ))}
          </select>

          <label htmlFor="amount">Amount:</label>
          <input type="number" id="amount" name="amount" required max="5000" />

          <Button type="submit">Submit Contribution</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContributionForm;
