import type { ClientForm } from "@/components/create-client-modal/create-client-modal";
import { useState } from "react";
import UserSelectDialog from "@/components/shared/UserSelectDialog";
import ClientSelectDialog from "@/components/shared/ClientSelectDialog";
import { IndustrySelector } from "@/components/shared/industry-selector";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Building2, 
  User, 
  Layers, 
  Tag, 
  Sparkles, 
  Calendar, 
  MapPin, 
  FileSpreadsheet, 
  ChevronRight, 
  X, 
  UserCheck, 
  Users, 
  GitBranch, 
  Compass,
  FileCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientInformationTabProps {
  form:     ClientForm;
  setField: <K extends keyof ClientForm>(key: K, value: ClientForm[K]) => void;
}

export function ClientInformationTab({ form, setField }: ClientInformationTabProps) {
  const [isSalesLeadDialogOpen, setIsSalesLeadDialogOpen] = useState(false);
  const [isReferredDialogOpen, setIsReferredDialogOpen] = useState(false);
  const [isClientSelectOpen, setIsClientSelectOpen] = useState(false);
  const [parentClientName, setParentClientName] = useState("");

  return (
    <div className="space-y-5 pb-2">
      {/* 1. Pipeline & Status Section */}
      <div className="rounded-2xl border border-border/80 bg-muted/20 dark:bg-muted/10 p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-2 pb-1 border-b border-border/40">
          <Layers className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Pipeline & Classification</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Client Stage */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground/90 flex items-center gap-1">
              Client Stage <span className="text-destructive">*</span>
            </label>
            <Select
              value={form.clientStage}
              onValueChange={val => {
                setField("clientStage", val);
                if (val !== "Engaged") setField("clientSubStage", "");
              }}
            >
              <SelectTrigger className="h-10 rounded-xl bg-background border-border/80 hover:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all font-semibold text-xs sm:text-sm">
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/80 shadow-lg">
                <SelectItem value="Lead" className="font-semibold text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Lead</span>
                  </div>
                </SelectItem>
                <SelectItem value="Engaged" className="font-semibold text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Engaged</span>
                  </div>
                </SelectItem>
                <SelectItem value="Signed" className="font-semibold text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Signed</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sub Stage */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground/90 flex items-center justify-between">
              <span>Sub-stage</span>
              {form.clientStage !== "Engaged" && (
                <span className="text-[10px] text-muted-foreground font-normal">Active only when Engaged</span>
              )}
            </label>
            <Select
              value={form.clientSubStage}
              onValueChange={val => setField("clientSubStage", val)}
              disabled={form.clientStage !== "Engaged"}
            >
              <SelectTrigger className="h-10 rounded-xl bg-background border-border/80 hover:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all font-semibold disabled:opacity-50 text-xs sm:text-sm">
                <SelectValue placeholder={form.clientStage === "Engaged" ? "Select sub-stage" : "N/A"} />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/80 shadow-lg">
                <SelectItem value="Calls">Calls</SelectItem>
                <SelectItem value="Profile Sent">Profile Sent</SelectItem>
                <SelectItem value="Contract Sent">Contract Sent</SelectItem>
                <SelectItem value="Attended a Meeting">Attended a Meeting</SelectItem>
                <SelectItem value="Replied to a Message">Replied to a Message</SelectItem>
                <SelectItem value="Contract Negotiation">Contract Negotiation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground/90">Priority</label>
            <Select
              value={form.clientPriority}
              onValueChange={val => setField("clientPriority", val)}
            >
              <SelectTrigger className="h-10 rounded-xl bg-background border-border/80 hover:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all font-semibold text-xs sm:text-sm">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/80 shadow-lg">
                <SelectItem value="High">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-destructive" />
                    <span className="font-semibold text-xs sm:text-sm">High</span>
                  </div>
                </SelectItem>
                <SelectItem value="Medium">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="font-semibold text-xs sm:text-sm">Medium</span>
                  </div>
                </SelectItem>
                <SelectItem value="Low">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-xs sm:text-sm">Low</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Segment */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground/90">Client Segment</label>
            <Select
              value={form.clientSegment}
              onValueChange={val => setField("clientSegment", val)}
            >
              <SelectTrigger className="h-10 rounded-xl bg-background border-border/80 hover:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all font-semibold text-xs sm:text-sm">
                <SelectValue placeholder="Select segment" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/80 shadow-lg">
                <SelectItem value="Silver">Silver</SelectItem>
                <SelectItem value="Gold">Gold</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 2. Account Hierarchy (Parent Client) */}
      <div className="rounded-2xl border border-border/80 bg-muted/20 dark:bg-muted/10 p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between pb-1 border-b border-border/40">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Hierarchy & Subsidiary</h3>
          </div>
          <span className="text-[11px] text-muted-foreground font-medium">Optional</span>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground/90">Parent Client</label>
            
            {form.parentClientId ? (
              <div className="flex items-center justify-between p-3 rounded-xl border border-primary/30 bg-primary/5 dark:bg-primary/10">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/15 text-primary flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-foreground">{parentClientName || "Selected Parent Client"}</p>
                    <p className="text-[11px] text-muted-foreground">Parent account connected</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => setIsClientSelectOpen(true)}
                    className="h-8 text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10"
                  >
                    Change
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => {
                      setField("parentClientId", "");
                      setParentClientName("");
                      setField("contractSource", "own");
                      setField("primaryContactSource", "own");
                    }}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsClientSelectOpen(true)}
                className="w-full h-10 rounded-xl bg-background border-dashed border-2 border-border hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-foreground font-semibold justify-start text-xs sm:text-sm transition-all"
              >
                <Building2 className="w-4 h-4 mr-2 text-muted-foreground/70" />
                <span>Link a parent client or headquarter entity...</span>
              </Button>
            )}
          </div>

          {/* Conditional Parent Settings */}
          {form.parentClientId && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/90 flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-primary" /> Contract Source
                </label>
                <Select
                  value={form.contractSource}
                  onValueChange={val => setField("contractSource", val as any)}
                >
                  <SelectTrigger className="h-10 rounded-xl bg-background border-border/80 font-semibold text-xs sm:text-sm">
                    <SelectValue placeholder="Select contract source" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/80 shadow-lg">
                    <SelectItem value="own">Own Contract</SelectItem>
                    <SelectItem value="parent">Share Parent&apos;s Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground/90 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-primary" /> Contact Source
                </label>
                <Select
                  value={form.primaryContactSource}
                  onValueChange={val => setField("primaryContactSource", val as any)}
                >
                  <SelectTrigger className="h-10 rounded-xl bg-background border-border/80 font-semibold text-xs sm:text-sm">
                    <SelectValue placeholder="Select contact source" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/80 shadow-lg">
                    <SelectItem value="own">Own Contacts</SelectItem>
                    <SelectItem value="parent">Share Parent&apos;s Contacts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Team Assignment & Referral */}
      <div className="rounded-2xl border border-border/80 bg-muted/20 dark:bg-muted/10 p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-2 pb-1 border-b border-border/40">
          <UserCheck className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Ownership & Referral</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Sales Lead */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground/90">Sales Lead</label>
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsSalesLeadDialogOpen(true)}
              className={cn(
                "w-full h-10 rounded-xl bg-background border-border/80 hover:border-primary/50 text-left font-semibold justify-between text-xs sm:text-sm px-3",
                form.salesLead ? "text-foreground" : "text-muted-foreground/70"
              )}
            >
              <div className="flex items-center gap-2 truncate">
                <User className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="truncate">{form.salesLead || "Assign sales lead..."}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
            </Button>
          </div>

          {/* Referred By */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground/90">Referred By</label>
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsReferredDialogOpen(true)}
              className={cn(
                "w-full h-10 rounded-xl bg-background border-border/80 hover:border-primary/50 text-left font-semibold justify-between text-xs sm:text-sm px-3",
                form.referredBy ? "text-foreground" : "text-muted-foreground/70"
              )}
            >
              <div className="flex items-center gap-2 truncate">
                <Users className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="truncate">{form.referredBy || "Select referral contact..."}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
            </Button>
          </div>
        </div>
      </div>

      {/* 4. Lead Source & Industry */}
      <div className="rounded-2xl border border-border/80 bg-muted/20 dark:bg-muted/10 p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-2 pb-1 border-b border-border/40">
          <Compass className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Source & Industry</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Client Source */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground/90">Client Source</label>
            <Select
              value={form.clientSource}
              onValueChange={val => {
                setField("clientSource", val);
                setField("clientSourceDetails", {});
              }}
            >
              <SelectTrigger className="h-10 rounded-xl bg-background border-border/80 hover:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all font-semibold text-xs sm:text-sm">
                <SelectValue placeholder="Select client source" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/80 shadow-lg">
                <SelectItem value="Cold Call">Cold Call</SelectItem>
                <SelectItem value="Reference">Reference</SelectItem>
                <SelectItem value="Events">Events</SelectItem>
                <SelectItem value="Existing Old Client">Existing Old Client</SelectItem>
                <SelectItem value="Others">Others</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Industry */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground/90">Industry</label>
            <div className="h-10 rounded-xl bg-background border border-border/80 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all flex items-center px-2">
              <Building2 className="w-4 h-4 text-muted-foreground shrink-0 ml-1 mr-2" />
              <IndustrySelector 
                value={form.industry} 
                onValueChange={val => setField("industry", val)} 
                modal
                className="border-none bg-transparent hover:bg-transparent shadow-none px-0 h-full text-xs sm:text-sm focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
              />
            </div>
          </div>

          {/* Dynamic Details: Cold Call */}
          {form.clientSource === 'Cold Call' && (
            <div className="space-y-1.5 sm:col-span-2 animate-in fade-in duration-200">
              <label className="text-xs font-bold text-foreground/90">Cold Call Date</label>
              <Input 
                type="date"
                value={form.clientSourceDetails?.date ? new Date(form.clientSourceDetails.date).toISOString().split('T')[0] : ''}
                onChange={(e) => setField('clientSourceDetails', { ...form.clientSourceDetails, date: e.target.value })}
                className="h-10 rounded-xl bg-background border-border/80 font-semibold text-xs sm:text-sm"
              />
            </div>
          )}

          {/* Dynamic Details: Events */}
          {form.clientSource === 'Events' && (
            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-background border border-border/70 animate-in fade-in duration-200">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-foreground/90">Event Name</label>
                <Input 
                  value={form.clientSourceDetails?.eventName || ''}
                  onChange={(e) => setField('clientSourceDetails', { ...form.clientSourceDetails, eventName: e.target.value })}
                  className="h-9 rounded-lg bg-muted/30 border-border/80 text-xs"
                  placeholder="e.g. GITEX Dubai"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-foreground/90">Event Date</label>
                <Input 
                  type="date"
                  value={form.clientSourceDetails?.eventDate ? new Date(form.clientSourceDetails.eventDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setField('clientSourceDetails', { ...form.clientSourceDetails, eventDate: e.target.value })}
                  className="h-9 rounded-lg bg-muted/30 border-border/80 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-foreground/90">Location</label>
                <Input 
                  value={form.clientSourceDetails?.eventLocation || ''}
                  onChange={(e) => setField('clientSourceDetails', { ...form.clientSourceDetails, eventLocation: e.target.value })}
                  className="h-9 rounded-lg bg-muted/30 border-border/80 text-xs"
                  placeholder="e.g. World Trade Centre"
                />
              </div>
            </div>
          )}

          {/* Dynamic Details: Others */}
          {form.clientSource === 'Others' && (
            <div className="space-y-1.5 sm:col-span-2 animate-in fade-in duration-200">
              <label className="text-xs font-bold text-foreground/90">Source Notes</label>
              <Textarea
                value={form.clientSourceDetails?.notes || ''}
                onChange={(e) => setField('clientSourceDetails', { ...form.clientSourceDetails, notes: e.target.value })}
                className="rounded-xl bg-background border-border/80 text-xs sm:text-sm min-h-[50px]"
                placeholder="Provide details on how the client was acquired..."
              />
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <UserSelectDialog
        open={isSalesLeadDialogOpen}
        onClose={() => setIsSalesLeadDialogOpen(false)}
        onSelect={(u) => setField("salesLead", u.name || "")}
        title="Select Sales Lead"
      />

      <UserSelectDialog
        open={isReferredDialogOpen}
        onClose={() => setIsReferredDialogOpen(false)}
        onSelect={(u) => setField("referredBy", u.name || "")}
        title="Select Referral"
      />

      <ClientSelectDialog
        open={isClientSelectOpen}
        onClose={() => setIsClientSelectOpen(false)}
        onSelect={(c) => {
          setField("parentClientId", c._id);
          setParentClientName(c.name);
          setField("contractSource", "own");
          setField("primaryContactSource", "own");
        }}
        title="Select Parent Client"
      />
    </div>
  );
}
