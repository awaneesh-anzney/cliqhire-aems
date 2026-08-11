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
  // Popover open states
  const [activityDateOpen, setActivityDateOpen] = useState(false);
  const [expectedClosureOpen, setExpectedClosureOpen] = useState(false);

  const [formData, setFormData] = useState({
    mode: "Virtual",
    activityTime: "09:00",
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
  });

  useEffect(() => {

  }, [clientId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!clientId) return;

    try {
      setIsSubmitting(true);
      
      const payload: any = {
        activityType,
        mode: formData.mode,
        activityDate: (activityDate || new Date()).toISOString(),
        activityTime: formData.activityTime,
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

          <div className={`grid gap-4 items-center ${activityType === "Meeting" ? "grid-cols-[1fr,2fr,1.5fr]" : "grid-cols-[2fr,1.5fr]"}`}>
            
            {activityType === "Meeting" && (
              <div className="space-y-2">
                <Label>Mode <span className="text-red-500">*</span></Label>
                <Select 
                  value={formData.mode} 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, mode: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="In Person">In Person</SelectItem>
                    <SelectItem value="Virtual">Virtual</SelectItem>
                    <SelectItem value="Phone Call">Phone Call</SelectItem>
                    <SelectItem value="Internal">Internal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Shadcn UI Date Picker */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover open={activityDateOpen} onOpenChange={setActivityDateOpen} modal={true}>
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

            {/* Shadcn UI Time Input */}
            <div className="space-y-2">
              <Label>Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={formData.activityTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, activityTime: e.target.value }))}
                  className="pl-9 w-full h-10 border-border"
                />
              </div>
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