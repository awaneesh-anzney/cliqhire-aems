"use client";

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useMemo } from "react";
import PhoneInput from "@/components/phone/Phoneinput";
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from "@/components/ui/select";
import { AddPositionDialog } from "@/components/common/add-position-dialog";
import { getPositions } from "@/services/positionService";
import { useQuery } from "@tanstack/react-query";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from "@/components/ui/command";
import { 
  ChevronDown, 
  UserPlus, 
  CheckCircle2, 
  Info, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Linkedin, 
  MapPin, 
  ArrowRight, 
  ArrowLeft,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LocationSuggestion } from "@/components/location/LocationSuggestion";

interface AddContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (contact: { 
    firstName: string; 
    lastName: string; 
    gender: string; 
    email: string; 
    phone: string; 
    countryCode: string; 
    position: string; 
    linkedin: string;
    location: string;
  }) => void;
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
    location?: string;
  };
  isEdit?: boolean;
}

const TABS = ["Bio Info", "Contact Details"] as const;

export function AddContactModal({ 
  open, 
  onOpenChange, 
  onAdd, 
  initialValues, 
  isEdit 
}: AddContactModalProps) {
  const [formData, setFormData] = useState({
    firstName: initialValues?.firstName ?? "",
    lastName: initialValues?.lastName ?? "",
    gender: initialValues?.gender ?? "",
    email: initialValues?.email ?? "",
    phone: initialValues?.phone ?? "",
    countryCode: initialValues?.countryCode ?? "SA",
    position: initialValues?.position ?? "",
    linkedin: initialValues?.linkedin ?? "",
    location: initialValues?.location ?? "",
  });
  
  const [currentTab, setCurrentTab] = useState(0);
  const [isAddPositionOpen, setIsAddPositionOpen] = useState(false);
  const [addedPositions, setAddedPositions] = useState<string[]>([]);
  const [positionPopoverOpen, setPositionPopoverOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({
        firstName: initialValues?.firstName ?? "",
        lastName: initialValues?.lastName ?? "",
        gender: initialValues?.gender ?? "",
        email: initialValues?.email ?? "",
        phone: initialValues?.phone ?? "",
        countryCode: initialValues?.countryCode ?? "SA",
        position: initialValues?.position ?? "",
        linkedin: initialValues?.linkedin ?? "",
        location: initialValues?.location ?? "",
      });
      setCurrentTab(0);
    }
  }, [open, initialValues]);

  const { data: positionsData } = useQuery({
    queryKey: ["positions"],
    queryFn: getPositions,
    enabled: open,
  });

  const computedOptions = useMemo(() => {
    const apiNames = (positionsData ?? []).map((p: { name: string }) => p.name);
    const uniqueNames = Array.from(new Set([...apiNames, ...addedPositions]));
    return uniqueNames.map((name) => ({ value: name, label: name }));
  }, [positionsData, addedPositions]);

  const handleNext = () => {
    if (!formData.firstName || !formData.position) {
      alert("Name and Position are required");
      return;
    }
    setCurrentTab(prev => Math.min(prev + 1, TABS.length - 1));
  };

  const handlePrevious = () => setCurrentTab(prev => Math.max(prev - 1, 0));

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!formData.firstName || !formData.email || !formData.phone || !formData.position) {
      alert("Please fill all required fields.");
      return;
    }
    onAdd({
      ...formData,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      linkedin: formData.linkedin.trim(),
      location: formData.location.trim(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <div className="flex h-full lg:h-[550px] min-h-[400px]">
          {/* Sidebar */}
          <div className="hidden md:flex flex-col w-56 bg-slate-50 border-r border-slate-200 p-8 shrink-0">
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <UserPlus className="w-5 h-5 text-primary" />
                </div>
                <span className="font-bold text-slate-800 text-lg tracking-tight">CliqHire</span>
              </div>
              <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Client Contact</p>
            </div>

            <div className="space-y-8">
              {TABS.map((tab, index) => (
                <div key={tab} className="flex items-start gap-4">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                    ${currentTab === index 
                      ? "bg-primary text-white shadow-lg shadow-primary/30" 
                      : (index < currentTab ? "bg-green-500 text-white" : "bg-slate-200 text-slate-500")}
                  `}>
                    {index < currentTab ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-sm font-bold ${currentTab === index ? "text-slate-900" : "text-slate-400"}`}>
                      {tab}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Section {index + 1}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto bg-primary/5 p-4 rounded-xl border border-primary/10">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                  Adding precise contact points improves communication and account management.
                </p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
             <div className="p-8 pb-4">
              <div className="flex justify-between items-center mb-1">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                  {isEdit ? "Edit Contact" : (currentTab === 0 ? "Identify Contact" : "Reach & Social")}
                </h2>
                <div className="text-[10px] text-primary font-black bg-primary/10 px-3 py-1 rounded-full uppercase tracking-tighter">
                   {currentTab + 1} of 2
                </div>
              </div>
              <DialogDescription className="text-slate-500 font-semibold text-sm">
                {currentTab === 0 ? "Basic identity and professional role within the company." : "Contact points and social presence."}
              </DialogDescription>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-4 min-h-0">
               <div className="max-w-xl mx-auto space-y-6">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {currentTab === 0 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-slate-700">First Name <span className="text-primary">*</span></Label>
                          <div className="relative group">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                            <Input 
                              value={formData.firstName} 
                              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))} 
                              placeholder="Enter first name" 
                              className="pl-10 h-11 border-slate-200 font-bold focus:border-primary"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-slate-700">Last Name</Label>
                          <Input 
                            value={formData.lastName} 
                            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))} 
                            placeholder="Enter last name" 
                            className="h-11 border-slate-200 font-bold"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700">Gender</Label>
                        <Select 
                          value={formData.gender} 
                          onValueChange={(val) => setFormData(prev => ({ ...prev, gender: val }))}
                        >
                          <SelectTrigger className="h-11 border-slate-200 font-bold">
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
                        <div className="flex items-center justify-between px-1">
                          <Label className="text-sm font-bold text-slate-700">Position <span className="text-primary">*</span></Label>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setIsAddPositionOpen(true)}
                            className="text-[10px] font-black text-primary uppercase h-fit p-0 hover:bg-transparent"
                          >
                            <Plus className="w-3 h-3 mr-1" /> Create New
                          </Button>
                        </div>
                        <Popover open={positionPopoverOpen} onOpenChange={setPositionPopoverOpen} modal={true}>
                          <PopoverTrigger asChild>
                            <Button 
                              type="button" 
                              variant="outline" 
                              className="w-full h-11 justify-between border-slate-200 font-bold text-slate-700"
                            >
                              <div className="flex items-center">
                                <Briefcase className="w-4 h-4 mr-3 text-slate-300" />
                                {formData.position || "Select professional role"}
                              </div>
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="p-0 w-[--radix-popover-trigger-width] shadow-2xl border-slate-100" align="start">
                            <Command className="min-h-0 h-64">
                              <CommandInput placeholder="Search positions..." className="font-bold" />
                              <CommandList className="custom-scrollbar">
                                <CommandEmpty>No roles found.</CommandEmpty>
                                <CommandGroup>
                                  {computedOptions.map((option) => (
                                    <CommandItem
                                      key={option.value}
                                      value={option.label}
                                      onSelect={() => {
                                        setFormData(prev => ({ ...prev, position: option.value }));
                                        setPositionPopoverOpen(false);
                                      }}
                                      className="font-bold py-3"
                                    >
                                      {option.label}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  )}

                  {currentTab === 1 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700">Email Address <span className="text-primary">*</span></Label>
                        <div className="relative group">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                          <Input 
                            type="email" 
                            value={formData.email} 
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} 
                            placeholder="Email..." 
                            className="pl-10 h-11 border-slate-200 font-bold focus:border-primary"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700">Phone Number <span className="text-primary">*</span></Label>
                        <PhoneInput
                          countryCode={formData.countryCode}
                          onCountryCodeChange={(val) => setFormData(prev => ({ ...prev, countryCode: val }))}
                          phoneNumber={formData.phone}
                          onPhoneNumberChange={(val) => setFormData(prev => ({ ...prev, phone: val }))}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-slate-700">LinkedIn URL</Label>
                          <div className="relative group">
                            <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                            <Input 
                              value={formData.linkedin} 
                              onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))} 
                              placeholder="URL" 
                              className="pl-10 h-11 border-slate-200 font-bold"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-slate-700">Location</Label>
                          <LocationSuggestion
                            value={formData.location}
                            onChange={(val) => setFormData(prev => ({ ...prev, location: val }))}
                            placeholder="Search City/Region..."
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="p-6 bg-slate-50 border-t flex flex-row items-center mt-auto shrink-0">
               <div className="flex justify-between w-full h-11 items-center">
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-500 font-bold hover:bg-slate-100">
                    Cancel
                  </Button>
                  {currentTab > 0 && (
                    <Button variant="outline" onClick={handlePrevious} className="bg-white border-slate-200 font-bold px-5 shadow-sm">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                  )}
                </div>

                <div className="flex gap-3">
                  {currentTab === TABS.length - 1 ? (
                    <Button 
                      onClick={() => handleSubmit()} 
                      className="bg-primary hover:bg-primary/90 text-white px-8 font-black shadow-xl shadow-primary/30"
                    >
                      <UserPlus className="w-4 h-4 mr-2" /> {isEdit ? "Save Changes" : "Create Contact"}
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleNext} 
                      className="bg-primary hover:bg-primary/90 text-white px-8 font-black shadow-xl shadow-primary/30"
                    >
                      Continue <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </DialogFooter>
          </div>
        </div>

        <AddPositionDialog
          open={isAddPositionOpen}
          onOpenChange={setIsAddPositionOpen}
          title="Create New Position"
          existingNames={computedOptions.map(o => o.label)}
          onCreated={(name) => {
            setAddedPositions((prev) => prev.includes(name) ? prev : [...prev, name]);
            setFormData(prev => ({ ...prev, position: name }));
          }}
        />
      </DialogContent>
    </Dialog>
  );
}