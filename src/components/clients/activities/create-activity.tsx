// create-activity.tsx
import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Loader2, Calendar as CalendarIcon, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { logClientActivity } from "@/services/clientService";
import { getTeamMembers } from "@/services/teamMembersService";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface CreateActivityModalProps {
  clientId: string;
  onActivityCreated: () => void;
  onClose: () => void;
}

const ACTIVITY_TYPES = [
  "Call", "WhatsApp", "LinkedIn", "Email", "Meeting", "Data Update", "Negotiation", "Proposal Sent"
];

const NEGOTIATION_STATUSES = [
  "Ongoing", "Stuck", "Agreed", "Rejected"
];

// Generate 24-hour time slots in 30-min intervals
const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = i % 2 === 0 ? "00" : "30";
  return `${String(hours).padStart(2, "0")}:${minutes}`;
});

export function CreateActivityModal({ clientId, onActivityCreated, onClose }: CreateActivityModalProps) {
  const [activityType, setActivityType] = useState("Call");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Date states for Shadcn Popover + Calendar
  const [activityDate, setActivityDate] = useState<Date>(new Date());
  const [expectedClosureDate, setExpectedClosureDate] = useState<Date | undefined>(undefined);
  const [nextFollowUpDate, setNextFollowUpDate] = useState<Date | undefined>(undefined);
  
  // Popover open states
  const [activityDateOpen, setActivityDateOpen] = useState(false);
  const [expectedClosureOpen, setExpectedClosureOpen] = useState(false);
  const [nextFollowUpOpen, setNextFollowUpOpen] = useState(false);

  // Team users for dropdown
  const [teamUsers, setTeamUsers] = useState<{ id: string; name: string; role?: string }[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const [formData, setFormData] = useState({
    interactionScope: "Client-facing",
    activityTime: "09:00",
    attempts: 1,
    isMeeting: false,
    discussionSummary: "",
    outcome: "",
    
    // Negotiation fields
    dealValue: "",
    proposedTerms: "",
    objections: "",
    competitorMentioned: "",
    negotiationStatus: "Ongoing",
    
    // Footer fields
    revenue: "",
    nextFollowUpOwner: "",
  });

  // Fetch team members for Follow-up Owner ID dropdown
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setIsLoadingUsers(true);
        const res = await getTeamMembers();
        const members = (res.teamMembers || []).map((user: any) => ({
          id: user._id || user.id || "",
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.name || user.email || "Unknown User",
          role: user.teamRole || user.department || "",
        }));
        setTeamUsers(members);
      } catch (error) {
        console.error("Error fetching team users:", error);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    fetchTeamMembers();
  }, []);

  // Auto-check isMeeting if activityType is Meeting
  useEffect(() => {
    if (activityType === "Meeting") {
      setFormData(prev => ({ ...prev, isMeeting: true }));
    }
  }, [activityType]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!clientId) return;

    try {
      setIsSubmitting(true);
      
      const payload: any = {
        activityType,
        interactionScope: formData.interactionScope,
        activityDate: (activityDate || new Date()).toISOString(),
        activityTime: formData.activityTime,
        attempts: Number(formData.attempts),
        isMeeting: formData.isMeeting,
        discussionSummary: formData.discussionSummary,
        outcome: formData.outcome,
      };

      if (activityType === "Negotiation" || activityType === "Proposal Sent") {
        payload.negotiationDetails = {
          dealValue: formData.dealValue ? Number(formData.dealValue) : undefined,
          proposedTerms: formData.proposedTerms,
          objections: formData.objections,
          competitorMentioned: formData.competitorMentioned,
          expectedClosureDate: expectedClosureDate ? expectedClosureDate.toISOString() : undefined,
          negotiationStatus: formData.negotiationStatus
        };
      }

      if (formData.revenue) payload.revenue = Number(formData.revenue);
      if (nextFollowUpDate) payload.nextFollowUpDate = nextFollowUpDate.toISOString();
      if (formData.nextFollowUpOwner) payload.nextFollowUpOwner = formData.nextFollowUpOwner;

      await logClientActivity(clientId, payload);
      toast.success("Activity logged successfully");
      onActivityCreated();
      onClose();
    } catch (error: any) {
      console.error('Error creating activity:', error);
      toast.error(error.message || "Failed to log activity");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (key: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [key]: event.target.value,
    }));
  };

  const isNegotiation = activityType === "Negotiation" || activityType === "Proposal Sent";

  return (
    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">Log Activity</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6 py-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Channel / Type</Label>
              <Select value={activityType} onValueChange={setActivityType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Interaction Scope</Label>
              <Select 
                value={formData.interactionScope} 
                onValueChange={(val) => setFormData(prev => ({ ...prev, interactionScope: val }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Client-facing">Client-facing</SelectItem>
                  <SelectItem value="Internal">Internal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-[2fr,1.5fr,1fr,1fr] gap-4 items-center">
            {/* Shadcn UI Date Picker */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover open={activityDateOpen} onOpenChange={setActivityDateOpen} modal>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-10 border-border",
                      !activityDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {activityDate ? format(activityDate, "PPP") : <span>Pick date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={activityDate}
                    onSelect={(date) => {
                      if (date) setActivityDate(date);
                      setActivityDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Shadcn UI Time Select */}
            <div className="space-y-2">
              <Label>Time</Label>
              <Select
                value={formData.activityTime}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, activityTime: val }))}
              >
                <SelectTrigger className="w-full h-10 border-border">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto z-50">
                  {TIME_SLOTS.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Attempts</Label>
              <Input
                type="number"
                min="1"
                value={formData.attempts}
                onChange={handleInputChange("attempts")}
                required
              />
            </div>
            <div className="space-y-2 pt-6 flex justify-center">
               <label className="flex items-center gap-2 text-sm cursor-pointer">
                 <Checkbox 
                   checked={formData.isMeeting} 
                   onCheckedChange={(checked) => setFormData(p => ({ ...p, isMeeting: checked as boolean }))}
                 />
                 Meeting?
               </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Discussion / Summary</Label>
            <Textarea
              placeholder="What was discussed?"
              className="min-h-[80px]"
              value={formData.discussionSummary}
              onChange={handleInputChange("discussionSummary")}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Outcome / Next Action</Label>
            <Input
              value={formData.outcome}
              onChange={handleInputChange("outcome")}
              placeholder="e.g. Scheduled a follow-up call"
            />
          </div>

          {/* Conditional Negotiation Section */}
          {isNegotiation && (
            <div className="p-4 bg-muted/30 rounded-xl border border-border space-y-4">
              <h4 className="font-semibold text-sm">Negotiation Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Deal Value (SAR)</Label>
                  <Input type="number" placeholder="e.g. 50000" value={formData.dealValue} onChange={handleInputChange("dealValue")} />
                </div>

                {/* Expected Closure Date Picker */}
                <div className="space-y-2">
                  <Label>Expected Closure</Label>
                  <Popover open={expectedClosureOpen} onOpenChange={setExpectedClosureOpen} modal>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-10 border-border bg-background",
                          !expectedClosureDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                        {expectedClosureDate ? format(expectedClosureDate, "PPP") : <span>Pick closure date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50" align="start">
                      <Calendar
                        mode="single"
                        selected={expectedClosureDate}
                        onSelect={(date) => {
                          setExpectedClosureDate(date);
                          setExpectedClosureOpen(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Proposed Terms</Label>
                  <Textarea placeholder="12-month retainer..." value={formData.proposedTerms} onChange={handleInputChange("proposedTerms")} className="min-h-[60px]" />
                </div>
                <div className="space-y-2">
                  <Label>Objections</Label>
                  <Textarea placeholder="Client asking for discount..." value={formData.objections} onChange={handleInputChange("objections")} className="min-h-[60px]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Competitor Mentioned</Label>
                  <Input placeholder="Competitor XYZ" value={formData.competitorMentioned} onChange={handleInputChange("competitorMentioned")} />
                </div>
                <div className="space-y-2">
                  <Label>Negotiation Status</Label>
                  <Select 
                    value={formData.negotiationStatus} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, negotiationStatus: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NEGOTIATION_STATUSES.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Footer fields */}
          <div className="border-t pt-4 grid grid-cols-3 gap-4">
             <div className="space-y-2">
                <Label>Revenue (SAR)</Label>
                <Input type="number" placeholder="Actual Revenue" value={formData.revenue} onChange={handleInputChange("revenue")} />
             </div>

             {/* Set Next Follow-up Date */}
             <div className="space-y-2">
                <Label>Set Next Follow-up</Label>
                <Popover open={nextFollowUpOpen} onOpenChange={setNextFollowUpOpen} modal>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-10 border-border bg-background",
                        !nextFollowUpDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {nextFollowUpDate ? format(nextFollowUpDate, "PPP") : <span>Follow-up date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50" align="start">
                    <Calendar
                      mode="single"
                      selected={nextFollowUpDate}
                      onSelect={(date) => {
                        setNextFollowUpDate(date);
                        setNextFollowUpOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
             </div>

             {/* Follow-up Owner Dropdown */}
             <div className="space-y-2">
                <Label>Follow-up Owner ID</Label>
                <Select 
                  value={formData.nextFollowUpOwner} 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, nextFollowUpOwner: val }))}
                >
                  <SelectTrigger className="w-full h-10 border-border">
                    <SelectValue placeholder={isLoadingUsers ? "Loading users..." : "Select team user"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto z-50">
                    {teamUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} {user.role ? `(${user.role})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
             </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" className="mr-2" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Activity
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}