"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useMemo } from "react";
import PhoneInput from 'react-phone-input-2';
// import 'react-phone-input-2/lib/style.css';
// import '@/styles/phone-input-override.css';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { AddPositionDialog } from "@/components/common/add-position-dialog";
import { getPositions } from "@/services/positionService";
import { useQuery } from "@tanstack/react-query";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronDown } from "lucide-react";

interface AddContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (contact: { firstName: string; lastName: string; gender: string; email: string; phone: string; countryCode: string; position: string; linkedin: string }) => void;
  countryCodes?: { code: string; label: string }[];
  positionOptions: { value: string; label: string }[];
  initialValues?: {
    firstName?: string;
    lastName?: string;
    gender?: string;
    email?: string;
    phone?: string;
    countryCode?: string;
    position?: string;
    linkedin?: string;
  };
  isEdit?: boolean;
}

const initialForm ={
    firstName: "",
    lastName: "",
    gender: "",
    email: "",
    phone: "",
    countryCode: "+966",
    position: "",
    linkedin: "",
}

export function AddContactModal({ open, onOpenChange, onAdd, countryCodes, positionOptions, initialValues, isEdit }: AddContactModalProps) {
  const [formData, setFormData] = useState({
    firstName: initialValues?.firstName ?? "",
    lastName:initialValues?.lastName ?? "",
    gender:initialValues?.gender ?? "",
    email: initialValues?.email ?? "",
    phone: initialValues?.phone ?? "",
    countryCode: initialValues?.countryCode ?? "+966",
    position: initialValues?.position ?? "",
    linkedin: initialValues?.linkedin ?? "",
  });
  const [isAddPositionOpen, setIsAddPositionOpen] = useState(false);
  // Track positions user adds locally during this session
  const [addedPositions, setAddedPositions] = useState<string[]>([]);
  const [positionPopoverOpen, setPositionPopoverOpen] = useState(false);

  // Sync formData with initialValues when modal opens or initialValues change
  useEffect(() => {
    if (open) {
      setFormData({
        firstName: initialValues?.firstName ?? "",
        lastName: initialValues?.lastName ?? "",
        gender: initialValues?.gender ?? "",
        email: initialValues?.email ?? "",
        phone: initialValues?.phone ?? "",
        countryCode: initialValues?.countryCode ?? "+966",
        position: initialValues?.position ?? "",
        linkedin: initialValues?.linkedin ?? "",
      });
    }
  }, [open, initialValues]);

  // Fetch positions via React Query when modal is open
  const { data: positionsData } = useQuery({
    queryKey: ["positions"],
    queryFn: getPositions,
    enabled: open,
  });

  // Compute final options = API names + locally added (unique)
  const computedOptions = useMemo(() => {
    const apiNames = (positionsData ?? []).map((p: { name: string }) => p.name);
    const uniqueNames = Array.from(new Set([...apiNames, ...addedPositions]));
    return uniqueNames.map((name) => ({ value: name, label: name }));
  }, [positionsData, addedPositions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email || !formData.phone || !formData.position) {
      alert("Please fill all required fields.");
      return;
    }
    onAdd({
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      gender: formData.gender,
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      countryCode: formData.countryCode,
      position: formData.position,
      linkedin: formData.linkedin.trim(),
    });
    onOpenChange(false);
    setFormData(initialForm);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Contact" : "Add Contact"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Enter last name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <PhoneInput
                country="sa"
                preferredCountries={['sa']}
                value={formData.phone}
                onChange={(value, data: { name: string; dialCode: string; countryCode: string }) => setFormData(prev => ({ ...prev, phone: value, countryCode: `+${data.dialCode}` }))}
                inputClass="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm w-full"
                inputProps={{ id: 'phone', required: true }}
                enableSearch={true}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="position">Position</Label>
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddPositionOpen(true)}>Add new</Button>
              </div>
              <Popover open={positionPopoverOpen} onOpenChange={setPositionPopoverOpen} modal={true}>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className="w-full justify-between">
                    {formData.position || "Select position"}
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[--radix-popover-trigger-width] min-w-[260px] h-72 overflow-hidden" align="start">
                  <Command className="grid grid-rows-[auto,1fr] min-h-0">
                    <CommandInput placeholder="Search positions..." />
                    <CommandList className="overflow-y-auto overscroll-contain">
                      <CommandEmpty>No positions found.</CommandEmpty>
                      <CommandGroup>
                        {computedOptions.map((option) => (
                          <CommandItem
                            key={option.value}
                            value={option.label}
                            onSelect={() => {
                              setFormData(prev => ({ ...prev, position: option.value }));
                              setPositionPopoverOpen(false);
                            }}
                          >
                            {option.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <AddPositionDialog
                open={isAddPositionOpen}
                onOpenChange={setIsAddPositionOpen}
                title="Add Position"
                existingNames={computedOptions.map(o => o.label)}
                onCreated={(name) => {
                  setAddedPositions((prev) => prev.includes(name) ? prev : [...prev, name]);
                  setFormData(prev => ({ ...prev, position: name }));
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                type="text"
                value={formData.linkedin}
                onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                placeholder="Enter LinkedIn profile URL"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{isEdit ? "Save Changes" : "Add Contact"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}