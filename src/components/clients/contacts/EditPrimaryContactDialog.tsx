import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import PhoneInput from '@/components/phone/Phoneinput';

interface EditPrimaryContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: {
    name?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    firstName?: string;
    lastName?: string;
    countryCode?: string;
    position?: string;
    gender?: string;
  } | null;
  onSave: (updatedContact: any) => void;
}

export function EditPrimaryContactDialog({ open, onOpenChange, contact, onSave }: EditPrimaryContactDialogProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (contact) {
      setFirstName(contact.firstName || (contact.name ? contact.name.split(' ')[0] : ''));
      setLastName(contact.lastName || (contact.name ? contact.name.split(' ').slice(1).join(' ') : ''));
      setEmail(contact.email || '');
      setPhone(contact.phone || '');
      setCountryCode(contact.countryCode || '966');
      setLinkedin(contact.linkedin || '');
    }
  }, [contact, open]);

  const handlePhoneChange = (value: string) => {
    setPhone(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.trim() === "") {
      setError("Phone number is required");
      return;
    }
    setError("");
    onSave({
      ...contact,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
      email,
      phone,
      countryCode,
      linkedin,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Edit Primary Contact</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder='Enter Your First Name'/>
            </div>
            <div className="flex-1">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} placeholder='Enter Your Last Name' />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder='xyz@example.com'/>
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <PhoneInput
              countryCode={countryCode || "SA"}
              onCountryCodeChange={setCountryCode}
              phoneNumber={phone}
              onPhoneNumberChange={setPhone}
            />
            {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
          </div>
          <div>
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input id="linkedin" value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder='https://linkedin.in'/>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 