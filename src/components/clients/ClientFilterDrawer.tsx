"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Building2,
  MapPin,
  Mail,
  Phone,
  Hash,
  User,
  SlidersHorizontal,
  X,
  RotateCcw,
  Check,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClientFilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityName: string;
  nameInput: string;
  setNameInput: (val: string) => void;
  clientIdInput: string;
  setClientIdInput: (val: string) => void;
  emailInput: string;
  setEmailInput: (val: string) => void;
  phoneNumberInput: string;
  setPhoneNumberInput: (val: string) => void;
  industryInput: string;
  setIndustryInput: (val: string) => void;
  locationInput: string;
  setLocationInput: (val: string) => void;
  salesLeadInput: string;
  setSalesLeadInput: (val: string) => void;
  referredByInput: string;
  setReferredByInput: (val: string) => void;
  createdByInput: string;
  setCreatedByInput: (val: string) => void;
  selectedClientStage?: string;
  setSelectedClientStage?: (val: string) => void;
  isLeads?: boolean;
  onClearAll: () => void;
  activeCount: number;
}

export const ClientFilterDrawer: React.FC<ClientFilterDrawerProps> = ({
  open,
  onOpenChange,
  entityName,
  nameInput,
  setNameInput,
  clientIdInput,
  setClientIdInput,
  emailInput,
  setEmailInput,
  phoneNumberInput,
  setPhoneNumberInput,
  industryInput,
  setIndustryInput,
  locationInput,
  setLocationInput,
  salesLeadInput,
  setSalesLeadInput,
  referredByInput,
  setReferredByInput,
  createdByInput,
  setCreatedByInput,
  selectedClientStage,
  setSelectedClientStage,
  isLeads = false,
  onClearAll,
  activeCount,
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col h-full bg-card border-l border-border shadow-2xl"
      >
        {/* Header */}
        <SheetHeader className="p-4 border-b border-border/70 flex flex-row items-center justify-between space-y-0 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <SheetTitle className="text-sm font-bold text-foreground">
                Filter {entityName}s
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Narrow down records by specific criteria
              </SheetDescription>
            </div>
          </div>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold border border-primary/20">
              {activeCount} active
            </span>
          )}
        </SheetHeader>

        {/* Filter Input Fields Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
          {/* Stage Filter for Leads */}
          {isLeads && setSelectedClientStage && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                Lead Stage
              </Label>
              <Select
                value={selectedClientStage || "All"}
                onValueChange={setSelectedClientStage}
              >
                <SelectTrigger className="w-full h-9 text-xs rounded-xl bg-muted/30 border-border/80 focus:ring-1 focus:ring-primary">
                  <SelectValue placeholder="Select Stage" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border">
                  <SelectItem value="All" className="text-xs">All Stages</SelectItem>
                  <SelectItem value="Lead" className="text-xs">Lead</SelectItem>
                  <SelectItem value="Engaged" className="text-xs">Engaged</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Name Filter */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{entityName} Name</span>
            </Label>
            <div className="relative">
              <input
                type="text"
                placeholder={`Search by ${entityName.toLowerCase()} name...`}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full h-9 pl-3 pr-8 text-xs bg-muted/30 border border-border/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground/60 transition-all"
              />
              {nameInput && (
                <button
                  type="button"
                  onClick={() => setNameInput("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* ID Filter */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{entityName} ID</span>
            </Label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. CLI-1049..."
                value={clientIdInput}
                onChange={(e) => setClientIdInput(e.target.value)}
                className="w-full h-9 pl-3 pr-8 text-xs bg-muted/30 border border-border/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground/60 transition-all"
              />
              {clientIdInput && (
                <button
                  type="button"
                  onClick={() => setClientIdInput("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Industry Filter */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Industry</span>
            </Label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Technology, Finance, Healthcare..."
                value={industryInput}
                onChange={(e) => setIndustryInput(e.target.value)}
                className="w-full h-9 pl-3 pr-8 text-xs bg-muted/30 border border-border/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground/60 transition-all"
              />
              {industryInput && (
                <button
                  type="button"
                  onClick={() => setIndustryInput("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Location Filter */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Location / Country</span>
            </Label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. United States, United Kingdom, Singapore..."
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                className="w-full h-9 pl-3 pr-8 text-xs bg-muted/30 border border-border/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground/60 transition-all"
              />
              {locationInput && (
                <button
                  type="button"
                  onClick={() => setLocationInput("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Email Filter */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Contact Email</span>
            </Label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. contact@company.com..."
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full h-9 pl-3 pr-8 text-xs bg-muted/30 border border-border/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground/60 transition-all"
              />
              {emailInput && (
                <button
                  type="button"
                  onClick={() => setEmailInput("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Phone Number Filter */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Phone Number</span>
            </Label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. +1 555-0192..."
                value={phoneNumberInput}
                onChange={(e) => setPhoneNumberInput(e.target.value)}
                className="w-full h-9 pl-3 pr-8 text-xs bg-muted/30 border border-border/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground/60 transition-all"
              />
              {phoneNumberInput && (
                <button
                  type="button"
                  onClick={() => setPhoneNumberInput("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Sales Lead Filter */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Sales Lead</span>
            </Label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Ahmed..."
                value={salesLeadInput}
                onChange={(e) => setSalesLeadInput(e.target.value)}
                className="w-full h-9 pl-3 pr-8 text-xs bg-muted/30 border border-border/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground/60 transition-all"
              />
              {salesLeadInput && (
                <button
                  type="button"
                  onClick={() => setSalesLeadInput("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Referred By Filter */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Referred By</span>
            </Label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Sara..."
                value={referredByInput}
                onChange={(e) => setReferredByInput(e.target.value)}
                className="w-full h-9 pl-3 pr-8 text-xs bg-muted/30 border border-border/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground/60 transition-all"
              />
              {referredByInput && (
                <button
                  type="button"
                  onClick={() => setReferredByInput("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Created By Filter */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Created By</span>
            </Label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. John Doe..."
                value={createdByInput}
                onChange={(e) => setCreatedByInput(e.target.value)}
                className="w-full h-9 pl-3 pr-8 text-xs bg-muted/30 border border-border/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground/60 transition-all"
              />
              {createdByInput && (
                <button
                  type="button"
                  onClick={() => setCreatedByInput("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <SheetFooter className="p-4 border-t border-border/70 bg-muted/20 flex flex-row items-center justify-between gap-2 shrink-0 sm:space-x-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            disabled={activeCount === 0}
            className="text-xs h-9 px-3 rounded-xl text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset All
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-9 px-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
          >
            <Check className="w-3.5 h-3.5 mr-1.5" />
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ClientFilterDrawer;
