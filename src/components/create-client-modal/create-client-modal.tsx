"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  MapPin, 
  FileText, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Info,
  Plus
} from "lucide-react";
import { createClient } from "./api";
import { objectToFormData } from "@/formdata/formData";
import { ClientInformationTab } from "./ClientInformationTab";
import { ContactDetailsTab } from "./ContactDetailsTab";
import { DocumentsTab } from "./DocumentsTab";

// ── Single source of truth ───────────────────────────────────
const INITIAL_STATE = {
  clientStage:       "Lead",
  clientSubStage:    "",
  salesLead:         "",
  referredBy:        "",
  clientPriority:    "",
  clientSegment:     "",
  clientSource:      "",
  industry:          "",
  name:              "",
  email:             "",
  otherEmail:        "",
  phoneNumber:       "",
  countryCode:       "+966",
  website:           "",
  address:           "",
  countryOfBusiness: "",
  linkedInProfile:   "",
  googleMapsLink:    "",
  profileImage:      null as File | null,
  crCopy:            null as File | null,
  vatCopy:           null as File | null,
  gstTinDocument:    null as File | null,
};

export type ClientForm = typeof INITIAL_STATE;

const TABS = ["General info", "Contact details", "Documents"] as const;

const FILE_FIELDS: (keyof ClientForm)[] = [
  "profileImage", "crCopy", "vatCopy", "gstTinDocument",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX   = /^https?:\/\/.+/;

function validateTab(tab: number, form: ClientForm): string | null {
  switch (tab) {
    case 0:
      if (!form.clientStage) return "Client stage is required";
      return null;
    case 1:
      if (!form.name.trim())                          return "Company name is required";
      if (!EMAIL_REGEX.test(form.email))              return "Valid email is required";
      if (!form.phoneNumber.trim())                   return "Phone number is required";
      if (form.otherEmail && !EMAIL_REGEX.test(form.otherEmail))
                                                      return "Other email is invalid";
      if (form.website && !URL_REGEX.test(form.website))
                                                      return "Website URL is invalid";
      if (form.linkedInProfile && !URL_REGEX.test(form.linkedInProfile))
                                                      return "LinkedIn URL is invalid";
      if (form.googleMapsLink && !URL_REGEX.test(form.googleMapsLink))
                                                      return "Google Maps URL is invalid";
      return null;
    case 2:
      return null;
    default:
      return null;
  }
}

export function CreateClientModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();

  const [form, setForm]       = useState<ClientForm>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  const setField = <K extends keyof ClientForm>(key: K, value: ClientForm[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    const error = validateTab(currentTab, form);
    if (error) { toast.error(error); return; }
    setCurrentTab(prev => Math.min(prev + 1, TABS.length - 1));
  };

  const handlePrevious = () => setCurrentTab(prev => Math.max(prev - 1, 0));

  const handleClose = () => {
    setForm(INITIAL_STATE);
    setCurrentTab(0);
    onOpenChange(false);
  };

  const handlePreview = (file: File | null) => {
    if (!file) { toast.error("No file to preview."); return; }
    window.open(URL.createObjectURL(file), "_blank");
  };

  const handleSubmit = async () => {
    for (let i = 0; i < TABS.length; i++) {
      const error = validateTab(i, form);
      if (error) { toast.error(error); setCurrentTab(i); return; }
    }

    setLoading(true);
    try {
      const body = objectToFormData(form, FILE_FIELDS);
      const result = await createClient(body);

      if (result.data?.data?._id) {
        toast.success("Client created successfully");
        router.push(`/clients/${result.data.data._id}`);
        handleClose();
        return;
      }
      toast.success("Client created successfully");
      handleClose();
    } catch (error: any) {
      toast.error(error?.message ?? "Error creating client");
    } finally {
      setLoading(false);
    }
  };

  const isLastTab = currentTab === TABS.length - 1;

  const tabIcons = [
    <Info key="info" className="w-4 h-4" />,
    <MapPin key="contact" className="w-4 h-4" />,
    <FileText key="docs" className="w-4 h-4" />
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <div className="flex h-full lg:h-[700px]">
          {/* Left Sidebar - Step Indicator */}
          <div className="hidden md:flex flex-col w-64 bg-slate-50 border-r border-slate-200 p-8">
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <span className="font-bold text-slate-800 text-lg">CliqHire</span>
              </div>
              <p className="text-xs text-slate-400 font-medium tracking-wider uppercase">Client Management</p>
            </div>

            <div className="space-y-6">
              {TABS.map((tab, index) => (
                <div 
                  key={tab} 
                  className={`flex items-start gap-4 transition-all duration-300 ${
                    currentTab === index ? "translate-x-1" : ""
                  }`}
                >
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                    ${currentTab === index 
                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                      : (index < currentTab ? "bg-green-500 text-white" : "bg-slate-200 text-slate-500")}
                  `}>
                    {index < currentTab ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-sm font-semibold ${currentTab === index ? "text-slate-900" : "text-slate-400"}`}>
                      {tab}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">Step {index + 1}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto bg-white/50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  Filling out accurate client details helps in better coordination and sales pipeline tracking.
                </p>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            <DialogHeader className="p-8 pb-4 border-b md:border-none">
              <div className="flex justify-between items-center mb-1">
                <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight">
                  New Client
                </DialogTitle>
                <div className="text-xs text-slate-400 font-medium bg-slate-50 px-2 py-1 rounded-md border">
                  Step {currentTab + 1} of 3
                </div>
              </div>
              <DialogDescription className="text-slate-500 font-medium">
                Complete the details below to onboard a new client.
              </DialogDescription>
            </DialogHeader>

            {/* Mobile Tab Icons */}
            <div className="flex md:hidden border-b px-4">
               {TABS.map((tab, index) => (
                <button
                  key={tab}
                  onClick={() => {
                    if (index < currentTab) setCurrentTab(index);
                  }}
                  className={`flex-1 py-4 flex flex-col items-center gap-1 border-b-2 transition-all ${
                    currentTab === index ? "border-primary text-primary" : "border-transparent text-slate-400"
                  }`}
                >
                  {tabIcons[index]}
                  <span className="text-[10px] font-bold uppercase">{tab.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-6">
              <div className="max-w-2xl mx-auto">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {currentTab === 0 && (
                    <ClientInformationTab form={form} setField={setField} />
                  )}
                  {currentTab === 1 && (
                    <ContactDetailsTab form={form} setField={setField} />
                  )}
                  {currentTab === 2 && (
                    <DocumentsTab
                      form={form}
                      setField={setField}
                      onPreview={handlePreview}
                    />
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="p-6 bg-slate-50/80 border-t flex flex-row items-center gap-4 mt-auto">
              <div className="flex justify-between w-full h-11 items-center">
                <div className="flex gap-3">
                  <Button 
                    variant="ghost" 
                    onClick={handleClose} 
                    disabled={loading}
                    className="text-slate-500 hover:text-slate-900"
                  >
                    Cancel
                  </Button>
                  {currentTab > 0 && (
                    <Button 
                      variant="outline" 
                      onClick={handlePrevious} 
                      disabled={loading}
                      className="border-slate-200 hover:bg-white"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                  )}
                </div>

                <div className="flex gap-3">
                  {!isLastTab ? (
                    <Button 
                      onClick={handleNext} 
                      disabled={loading}
                      className="bg-primary hover:bg-primary/90 text-white px-6 font-bold shadow-lg shadow-primary/20"
                    >
                      Continue <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleSubmit} 
                      disabled={loading}
                      className="bg-primary hover:bg-primary/90 text-white px-8 font-bold shadow-lg shadow-primary/20"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <Plus className="w-4 h-4 animate-spin" /> Creating...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" /> Create client
                        </div>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}