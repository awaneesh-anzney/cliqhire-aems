"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
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

// ── Tab config ────────────────────────────────────────────────
const TABS = ["General info", "Contact details", "Documents"] as const;

const FILE_FIELDS: (keyof ClientForm)[] = [
  "profileImage", "crCopy", "vatCopy", "gstTinDocument",
];

// ── Validation — tab ke hisaab se ─────────────────────────────
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
      return null; // documents optional hain
    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────
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

  // ── Generic field updater — ek function sab ke liye ──────────
  const setField = <K extends keyof ClientForm>(key: K, value: ClientForm[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  // ── Navigation ────────────────────────────────────────────────
  const handleNext = () => {
    const error = validateTab(currentTab, form);
    if (error) { toast.error(error); return; }
    setCurrentTab(prev => Math.min(prev + 1, TABS.length - 1));
  };

  const handlePrevious = () => setCurrentTab(prev => Math.max(prev - 1, 0));

  // ── Reset ─────────────────────────────────────────────────────
  const handleClose = () => {
    setForm(INITIAL_STATE);
    setCurrentTab(0);
    onOpenChange(false);
  };

  // ── File preview ──────────────────────────────────────────────
  const handlePreview = (file: File | null) => {
    if (!file) { toast.error("No file to preview."); return; }
    window.open(URL.createObjectURL(file), "_blank");
  };

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async () => {
    // Final validation before submit
    for (let i = 0; i < TABS.length; i++) {
      const error = validateTab(i, form);
      if (error) { toast.error(error); setCurrentTab(i); return; }
    }

    setLoading(true);
    try {
      const body = objectToFormData(form, FILE_FIELDS);
      const result = await createClient(body);

      if (result.data.data._id) {
        router.push(`/clients/${result.data.data._id}`);
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-3xl lg:max-w-4xl xl:max-w-5xl p-4 sm:p-6 md:p-8 flex flex-col">

        {/* Header */}
        <div className="sticky top-0 z-20 bg-white pb-2">
          <DialogHeader>
            <DialogTitle>Create client</DialogTitle>
            <DialogDescription>
              Required fields are marked with <span className="text-red-500">*</span>
            </DialogDescription>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex border-b mt-2">
            {TABS.map((tab, index) => (
              <div
                key={tab}
                className={`flex-1 py-2 text-center text-sm ${
                  currentTab === index
                    ? "border-b-2 border-blue-500 text-blue-500 font-medium"
                    : "text-gray-500"
                }`}
              >
                {tab}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="w-full h-[400px] overflow-y-auto pb-16">
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

        {/* Footer */}
        <div className="fixed left-1/2 -translate-x-1/2 bottom-0 w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-3xl lg:max-w-4xl xl:max-w-5xl bg-white z-50 border-t p-4 rounded-b-xl">
          <DialogFooter>
            <div className="flex justify-between w-full gap-2">
              <div>
                {currentTab > 0 && (
                  <Button variant="outline" onClick={handlePrevious} disabled={loading}>
                    <ArrowLeftIcon className="size-4" /> Previous
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                {!isLastTab ? (
                  <Button onClick={handleNext} disabled={loading}>
                    Next <ArrowRightIcon className="size-4" />
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={handleClose} disabled={loading}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                      {loading ? "Creating..." : "Create client"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogFooter>
        </div>

      </DialogContent>
    </Dialog>
  );
}