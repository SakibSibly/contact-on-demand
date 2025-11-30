import React, { useState } from 'react';
import { phonesAPI } from '../lib/api';
import type { PhoneCreate } from '../lib/types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Plus } from 'lucide-react';

interface AddPhoneDialogProps {
  contactId: string;
  onPhoneAdded: () => void;
}

export const AddPhoneDialog: React.FC<AddPhoneDialogProps> = ({ contactId, onPhoneAdded }) => {
  const [open, setOpen] = useState(false);
  const [number, setNumber] = useState('');
  const [numberType, setNumberType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const phoneData: PhoneCreate = {
        number,
        number_type: numberType || undefined,
        contact_id: contactId,
      };

      console.log('Adding phone number:', phoneData);
      const newPhone = await phonesAPI.create(phoneData);
      console.log('Phone number added successfully:', newPhone);
      
      setOpen(false);
      setNumber('');
      setNumberType('');
      onPhoneAdded();
    } catch (err: any) {
      console.error('Failed to add phone number:', err);
      setError(err.response?.data?.detail || 'Failed to add phone number');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" onClick={handleOpenDialog}>
          <Plus className="h-3 w-3 mr-1" />
          Add Number
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Add Phone Number</DialogTitle>
          <DialogDescription>
            Add a new phone number to this contact.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="number">Phone Number *</Label>
              <Input
                id="number"
                placeholder="+1234567890"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Type (optional)</Label>
              <Input
                id="type"
                placeholder="mobile, home, work, etc."
                value={numberType}
                onChange={(e) => setNumberType(e.target.value)}
                disabled={loading}
              />
            </div>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Number'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
