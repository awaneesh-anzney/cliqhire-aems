import type { ClientForm } from "@/components/create-client-modal/create-client-modal";
import { useState } from "react";
import UserSelectDialog from "@/components/shared/UserSelectDialog";
import { IndustrySelector } from "@/components/shared/industry-selector";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Building2, User } from "lucide-react";

interface ClientInformationTabProps {
  form:     ClientForm;
  setField: <K extends keyof ClientForm>(key: K, value: ClientForm[K]) => void;
}

export function ClientInformationTab({ form, setField }: ClientInformationTabProps) {
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);

  return (
    <div className="grid grid-cols-2 gap-4 p-1">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Client stage *</label>
        <Select
          value={form.clientStage}
          onValueChange={val => {
            setField("clientStage", val);
            if (val !== "Engaged") setField("clientSubStage", "");
          }}
        >
          <SelectTrigger className="h-11 rounded-xl bg-muted border-border focus:bg-card transition-all font-semibold">
            <SelectValue placeholder="Select stage" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border shadow-xl">
            <SelectItem value="Lead">Lead</SelectItem>
            <SelectItem value="Engaged">Engaged</SelectItem>
            <SelectItem value="Signed">Signed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Sub-stage</label>
        <Select
          value={form.clientSubStage}
          onValueChange={val => setField("clientSubStage", val)}
          disabled={form.clientStage !== "Engaged"}
        >
          <SelectTrigger className="h-11 rounded-xl bg-muted border-border focus:bg-card transition-all font-semibold disabled:opacity-50">
            <SelectValue placeholder={form.clientStage === "Engaged" ? "Select sub-stage" : "N/A"} />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border shadow-xl">
            <SelectItem value="Calls">Calls</SelectItem>
            <SelectItem value="Profile Sent">Profile Sent</SelectItem>
            <SelectItem value="Contract Sent">Contract Sent</SelectItem>
            <SelectItem value="Attended a Meeting">Attended a Meeting</SelectItem>
            <SelectItem value="Replied to a Message">Replied to a Message</SelectItem>
            <SelectItem value="Contract Negotiation">Contract Negotiation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Sales lead</label>
        <Button
          variant="outline"
          type="button"
          onClick={() => setIsUserDialogOpen(true)}
          className="h-11 rounded-xl bg-muted border-border focus:bg-card transition-all font-semibold justify-start text-foreground"
        >
          <User className="w-4 h-4 mr-2 text-muted-foreground" />
          {form.salesLead || "Select Sales Lead..."}
        </Button>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Referred by</label>
        <input
          type="text"
          value={form.referredBy}
          onChange={e => setField("referredBy", e.target.value)}
          placeholder="Referral name"
          className="h-11 border border-border rounded-xl px-4 text-sm bg-muted focus:bg-card transition-all font-semibold outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Priority</label>
        <Select
          value={form.clientPriority}
          onValueChange={val => setField("clientPriority", val)}
        >
          <SelectTrigger className="h-11 rounded-xl bg-muted border-border focus:bg-card transition-all font-semibold">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border shadow-xl">
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Segment</label>
        <Select
          value={form.clientSegment}
          onValueChange={val => setField("clientSegment", val)}
        >
          <SelectTrigger className="h-11 rounded-xl bg-muted border-border focus:bg-card transition-all font-semibold">
            <SelectValue placeholder="Select segment" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border shadow-xl">
            <SelectItem value="Silver">Silver</SelectItem>
            <SelectItem value="Gold">Gold</SelectItem>
            <SelectItem value="Premium">Premium</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Client Source</label>
        <Select
          value={form.clientSource}
          onValueChange={val => setField("clientSource", val)}
        >
          <SelectTrigger className="h-11 rounded-xl bg-muted border-border focus:bg-card transition-all font-semibold">
            <SelectValue placeholder="Select source" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border shadow-xl">
            <SelectItem value="Cold Call">Cold Call</SelectItem>
            <SelectItem value="Reference">Reference</SelectItem>
            <SelectItem value="Events">Events</SelectItem>
            <SelectItem value="Existing Old Client">Existing Old Client</SelectItem>
            <SelectItem value="Others">Others</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Industry</label>
        <div className="h-11 rounded-xl bg-muted border border-border focus-within:bg-card transition-all flex items-center px-1">
          <Building2 className="w-4 h-4 mx-3 text-muted-foreground shrink-0" />
          <IndustrySelector 
            value={form.industry} 
            onValueChange={val => setField("industry", val)} 
            modal
          />
        </div>
      </div>

      <UserSelectDialog
        open={isUserDialogOpen}
        onClose={() => setIsUserDialogOpen(false)}
        onSelect={(u) => setField("salesLead", u.name || "")}
        title="Select Sales Lead"
      />
    </div>
  );
}
