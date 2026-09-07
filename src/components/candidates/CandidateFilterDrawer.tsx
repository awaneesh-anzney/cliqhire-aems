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
  User,
  Mail,
  Phone,
  Hash,
  Briefcase,
  MapPin,
  Calendar,
  Activity,
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

interface CandidateFilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nameInput: string;
  setNameInput: (val: string) => void;
  emailInput: string;
  setEmailInput: (val: string) => void;
  phoneInput: string;
  setPhoneInput: (val: string) => void;
  profileIdInput: string;
  setProfileIdInput: (val: string) => void;
  experienceInput: string;
  setExperienceInput: (val: string) => void;
  locationInput: string;
  setLocationInput: (val: string) => void;
  selectedStatus: string;
  setSelectedStatus: (val: string) => void;
  selectedNoticePeriod: string;
  setSelectedNoticePeriod: (val: string) => void;
  onClearAll: () => void;
  activeCount: number;
}

export const CandidateFilterDrawer: React.FC<CandidateFilterDrawerProps> = ({
  open,
  onOpenChange,
  nameInput,
  setNameInput,
  emailInput,
  setEmailInput,
  phoneInput,
  setPhoneInput,
  profileIdInput,
  setProfileIdInput,
  experienceInput,
  setExperienceInput,
  locationInput,
  setLocationInput,
  selectedStatus,
  setSelectedStatus,
  selectedNoticePeriod,
  setSelectedNoticePeriod,
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
                Filter Candidates
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Refine talent pool by skills, contact & criteria
              </SheetDescription>
            </div>
          </div>
          {activeCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                {activeCount} active
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </Button>
            </div>
          )}
        </SheetHeader>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Candidate Name */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary" />
              Candidate Name
            </Label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full h-8.5 px-3 text-xs rounded-xl bg-muted/40 border border-border/70 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
              />
              {nameInput && (
                <button
                  type="button"
                  onClick={() => setNameInput("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-primary" />
              Email Address
            </Label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. candidate@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full h-8.5 px-3 text-xs rounded-xl bg-muted/40 border border-border/70 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
              />
              {emailInput && (
                <button
                  type="button"
                  onClick={() => setEmailInput("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-primary" />
              Phone Number
            </Label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. +966 50 123 4567"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="w-full h-8.5 px-3 text-xs rounded-xl bg-muted/40 border border-border/70 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
              />
              {phoneInput && (
                <button
                  type="button"
                  onClick={() => setPhoneInput("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Profile ID */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-primary" />
              Profile ID
            </Label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. CAN-00124"
                value={profileIdInput}
                onChange={(e) => setProfileIdInput(e.target.value)}
                className="w-full h-8.5 px-3 text-xs rounded-xl bg-muted/40 border border-border/70 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
              />
              {profileIdInput && (
                <button
                  type="button"
                  onClick={() => setProfileIdInput("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              Location / City
            </Label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Riyadh, Dubai, Remote"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                className="w-full h-8.5 px-3 text-xs rounded-xl bg-muted/40 border border-border/70 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
              />
              {locationInput && (
                <button
                  type="button"
                  onClick={() => setLocationInput("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Experience */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-primary" />
              Experience Level
            </Label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. 5 Years, Senior"
                value={experienceInput}
                onChange={(e) => setExperienceInput(e.target.value)}
                className="w-full h-8.5 px-3 text-xs rounded-xl bg-muted/40 border border-border/70 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
              />
              {experienceInput && (
                <button
                  type="button"
                  onClick={() => setExperienceInput("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Status Select */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-primary" />
              Candidate Status
            </Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full h-8.5 text-xs rounded-xl bg-muted/40 border-border/70">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border">
                <SelectItem value="All" className="text-xs">
                  All Statuses
                </SelectItem>
                <SelectItem value="Active" className="text-xs">
                  Active
                </SelectItem>
                <SelectItem value="Shortlisted" className="text-xs">
                  Shortlisted
                </SelectItem>
                <SelectItem value="Interviewing" className="text-xs">
                  Interviewing
                </SelectItem>
                <SelectItem value="Offer" className="text-xs">
                  Offer
                </SelectItem>
                <SelectItem value="Hired" className="text-xs">
                  Hired / Placed
                </SelectItem>
                <SelectItem value="Inactive" className="text-xs">
                  Inactive
                </SelectItem>
                <SelectItem value="Rejected" className="text-xs">
                  Rejected
                </SelectItem>
                <SelectItem value="Withdrawn" className="text-xs">
                  Withdrawn
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notice Period Select */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              Notice Period
            </Label>
            <Select
              value={selectedNoticePeriod}
              onValueChange={setSelectedNoticePeriod}
            >
              <SelectTrigger className="w-full h-8.5 text-xs rounded-xl bg-muted/40 border-border/70">
                <SelectValue placeholder="All Notice Periods" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border">
                <SelectItem value="All" className="text-xs">
                  All Notice Periods
                </SelectItem>
                <SelectItem value="Immediate" className="text-xs">
                  Immediate Joiner
                </SelectItem>
                <SelectItem value="15 Days" className="text-xs">
                  15 Days
                </SelectItem>
                <SelectItem value="1 Month" className="text-xs">
                  1 Month
                </SelectItem>
                <SelectItem value="2 Months" className="text-xs">
                  2 Months
                </SelectItem>
                <SelectItem value="3 Months" className="text-xs">
                  3 Months
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Footer Actions */}
        <SheetFooter className="p-4 border-t border-border/70 flex flex-row items-center gap-2 bg-muted/20 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            disabled={activeCount === 0}
            className="flex-1 h-9 rounded-xl border-border/70 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset All
          </Button>
          <Button
            size="sm"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-9 rounded-xl text-xs font-semibold"
          >
            <Check className="w-3.5 h-3.5 mr-1.5" />
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
