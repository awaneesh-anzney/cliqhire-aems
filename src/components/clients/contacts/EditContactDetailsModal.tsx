import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PhoneInput from "@/components/phone/Phoneinput";

interface EditContactDetailsModalProps {
  open: boolean;
  onClose: () => void;
  clientId: string;
  initialValues: {
    phoneNumber: string;
    website: string;
    emails: string[];
    linkedInProfile: string;
  };
  onSave: (values: { phoneNumber: string; website: string; emails: string[]; linkedInProfile: string }) => Promise<void>;
}

const EditContactDetailsModal: React.FC<EditContactDetailsModalProps> = ({
  open,
  onClose,
  clientId,
  initialValues,
  onSave,
}) => {
  const [phoneNumber, setPhoneNumber] = useState(initialValues.phoneNumber || "");
  const [countryCode, setCountryCode] = useState("SA");
  const [website, setWebsite] = useState(initialValues.website || "");
  const [emails, setEmails] = useState(initialValues.emails.join(", ") || "");
  const [linkedInProfile, setLinkedInProfile] = useState(initialValues.linkedInProfile || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setError("");
    // Basic validation
    if (!phoneNumber && !website && !emails && !linkedInProfile) {
      setError("Please fill at least one field.");
      return;
    }
    // Validate emails
    const emailArr = emails.split(",").map(e => e.trim()).filter(Boolean);
    for (const email of emailArr) {
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError(`Invalid email: ${email}`);
        return;
      }
    }
    // Validate website (optional, basic check)
    if (website && !/^https?:\/\//.test(website)) {
      setError("Website must start with http:// or https://");
      return;
    }
    // Validate LinkedIn (optional, basic check)
    if (linkedInProfile && !/^https?:\/\//.test(linkedInProfile)) {
      setError("LinkedIn profile must start with http:// or https://");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        phoneNumber,
        website,
        emails: emailArr,
        linkedInProfile,
      });
    } catch (err: any) {
      setError(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      setPhoneNumber(initialValues.phoneNumber || "");
      setWebsite(initialValues.website || "");
      setEmails(initialValues.emails.join(", ") || "");
      setLinkedInProfile(initialValues.linkedInProfile || "");
      setError("");
    }
  }, [open, initialValues]);

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Client Contact Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-sm font-medium mb-1">Client Phone Number</label>
            <PhoneInput
              countryCode={countryCode}
              onCountryCodeChange={setCountryCode}
              phoneNumber={phoneNumber}
              onPhoneNumberChange={setPhoneNumber}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Client Website</label>
            <Input
              value={website}
              onChange={e => setWebsite(e.target.value)}
              placeholder="https://example.com"
              type="text"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Client Email(s)</label>
            <Input
              value={emails}
              onChange={e => setEmails(e.target.value)}
              placeholder="email1@example.com, email2@example.com"
              type="text"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Client LinkedIn Profile</label>
            <Input
              value={linkedInProfile}
              onChange={e => setLinkedInProfile(e.target.value)}
              placeholder="https://www.linkedin.com/in/username"
              type="text"
            />
          </div>
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditContactDetailsModal; 