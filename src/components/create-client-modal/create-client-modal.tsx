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
  Loader2,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { createClient } from "./api";
import { objectToFormData } from "@/formdata/formData";
import { ClientInformationTab } from "./ClientInformationTab";
import { ContactDetailsTab } from "./ContactDetailsTab";
import { DocumentsTab } from "./DocumentsTab";
import { cn } from "@/lib/utils";

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
  countryCode:       "SA",
  website:           "",
  address:           "",
  location:          "",
  countryOfBusiness: "",
  linkedInProfile:   "",
  googleMapsLink:    "",
  profileImage:      null as File | null,
  crCopy:            null as File | null,
  vatCopy:           null as File | null,
  gstTinDocument:    null as File | null,
  parentClientId:    "",
  contractSource:    "own",
  primaryContactSource: "own",
  clientSourceDetails: {} as Record<string, any>,
};

export type ClientForm = typeof INITIAL_STATE;

const TABS = [
  {
    title: "General info",
    subtitle: "Pipeline & account details",
    icon: Building2,
  },
  {
    title: "Contact details",
    subtitle: "Address, emails & socials",
    icon: MapPin,
  },
  {
    title: "Documents",
    subtitle: "Verification & tax docs",
    icon: FileText,
  },
] as const;

const FILE_FIELDS: (keyof ClientForm)[] = [
  "profileImage", "crCopy", "vatCopy", "gstTinDocument",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX   = /^(https?:\/\/|www\.).+/;

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
      const payload = { ...form };
      
      // Clean up clientSourceDetails based on API requirements
      if (payload.clientSource === 'Reference' || payload.clientSource === 'Existing Old Client') {
        payload.clientSourceDetails = {} as any;
      }
      
      // Stringify clientSourceDetails for form-data
      if (payload.clientSourceDetails && typeof payload.clientSourceDetails === 'object') {
        payload.clientSourceDetails = JSON.stringify(payload.clientSourceDetails) as any;
      }

      const body = objectToFormData(payload, FILE_FIELDS);
      const result = await createClient(body);

      if (result.data?.data?._id) {
        toast.success("Client onboarded successfully");
        router.push(`/clients/${result.data.data._id}`);
        handleClose();
        return;
      }
      toast.success("Client onboarded successfully");
      handleClose();
    } catch (error: any) {
      toast.error(error?.message ?? "Error creating client");
    } finally {
      setLoading(false);
    }
  };

  const isLastTab = currentTab === TABS.length - 1;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border border-border/80 bg-background shadow-2xl rounded-2xl sm:rounded-3xl sm:max-h-[90vh]">
        <div className="flex flex-col md:flex-row h-full md:h-[680px] max-h-[85vh] min-h-[540px]">
          {/* Left Sidebar - Step Navigation */}
          <div className="hidden md:flex flex-col w-64 bg-muted/40 dark:bg-muted/20 border-r border-border/70 p-6 shrink-0 justify-between">
            <div>
              {/* Header Badge */}
              <div className="flex items-center gap-2.5 pb-6 border-b border-border/50 mb-6">
                <div className="h-10 w-10 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center shadow-sm">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-foreground text-sm tracking-tight">CliqHire</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">AEMS</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium">Client Onboarding</p>
                </div>
              </div>

              {/* Steps List */}
              <div className="space-y-4 relative">
                {/* Vertical Rail Line */}
                <div className="absolute left-[17px] top-4 bottom-4 w-0.5 bg-border/80 -z-0" />

                {TABS.map((tab, index) => {
                  const isCompleted = index < currentTab;
                  const isActive = index === currentTab;
                  const Icon = tab.icon;

                  return (
                    <button
                      key={tab.title}
                      type="button"
                      onClick={() => {
                        if (index < currentTab) {
                          setCurrentTab(index);
                        } else if (index > currentTab) {
                          const err = validateTab(currentTab, form);
                          if (!err) setCurrentTab(index);
                        }
                      }}
                      className={cn(
                        "w-full flex items-start gap-3 p-2 rounded-xl text-left transition-all duration-200 group relative z-10",
                        isActive
                          ? "bg-background/90 dark:bg-background/60 shadow-sm border border-border/80"
                          : "hover:bg-background/50 border border-transparent"
                      )}
                    >
                      <div
                        className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-200 mt-0.5",
                          isCompleted
                            ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                            : isActive
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-105"
                            : "bg-muted text-muted-foreground border border-border/70 group-hover:border-primary/40"
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              "text-xs font-bold truncate transition-colors",
                              isActive
                                ? "text-foreground"
                                : isCompleted
                                ? "text-foreground/80 font-semibold"
                                : "text-muted-foreground group-hover:text-foreground/80"
                            )}
                          >
                            {tab.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium leading-tight truncate">
                          {tab.subtitle}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Tip Card */}
            <div className="bg-background/80 dark:bg-background/40 p-3.5 rounded-xl border border-border/70 shadow-xs">
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="text-[11px] text-muted-foreground leading-relaxed">
                  <p className="font-semibold text-foreground/90 mb-0.5">Quick Tip</p>
                  Fill required fields to activate pipeline automations & contracts.
                </div>
              </div>
            </div>
          </div>

          {/* Right Main Content */}
          <div className="flex-1 flex flex-col bg-card overflow-hidden">
            {/* Header */}
            <DialogHeader className="p-6 pb-4 border-b border-border/60">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                      Add New Client
                    </DialogTitle>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                      Step {currentTab + 1} of {TABS.length}
                    </span>
                  </div>
                  <DialogDescription className="text-xs sm:text-sm text-muted-foreground font-medium mt-0.5">
                    {currentTab === 0 && "Provide core business details, stage in the pipeline, and source attribution."}
                    {currentTab === 1 && "Enter official communication coordinates, company location, and web presence."}
                    {currentTab === 2 && "Upload identity, registration, and tax compliance certificates."}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Mobile Tab Stepper Bar */}
            <div className="flex md:hidden border-b border-border bg-muted/30 px-3 py-2 gap-1.5 overflow-x-auto">
              {TABS.map((tab, index) => {
                const Icon = tab.icon;
                const isCompleted = index < currentTab;
                const isActive = index === currentTab;

                return (
                  <button
                    key={tab.title}
                    type="button"
                    onClick={() => {
                      if (index < currentTab) setCurrentTab(index);
                    }}
                    className={cn(
                      "flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold border transition-all whitespace-nowrap",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : isCompleted
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-background text-muted-foreground border-border/70"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Icon className="w-3.5 h-3.5" />
                    )}
                    <span>{tab.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="max-w-2xl mx-auto">
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
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

            {/* Footer Controls */}
            <DialogFooter className="p-4 sm:p-5 bg-muted/40 dark:bg-muted/20 border-t border-border/70 flex flex-row items-center justify-between gap-3 mt-auto">
              <Button 
                variant="ghost" 
                onClick={handleClose} 
                disabled={loading}
                className="text-muted-foreground hover:text-foreground font-semibold rounded-xl text-xs sm:text-sm h-10 px-4"
              >
                Cancel
              </Button>

              <div className="flex items-center gap-2">
                {currentTab > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={handlePrevious} 
                    disabled={loading}
                    className="border-border/80 hover:bg-background font-semibold rounded-xl text-xs sm:text-sm h-10 px-4"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
                  </Button>
                )}

                {!isLastTab ? (
                  <Button 
                    onClick={handleNext} 
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-xs sm:text-sm h-10 px-5 shadow-sm shadow-primary/20"
                  >
                    Continue <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit} 
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-xs sm:text-sm h-10 px-6 shadow-sm shadow-primary/20 min-w-[130px]"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Create Client</span>
                      </div>
                    )}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}