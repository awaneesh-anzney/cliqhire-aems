// create-activity.tsx
import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Phone, Video, ClipboardList, Mail, Users, Loader2 } from "lucide-react";
import { useState } from "react";
import { logClientActivity } from "@/services/clientService";
import { toast } from "sonner";

interface CreateActivityModalProps {
  clientId: string;
  onActivityCreated: () => void;
  onClose: () => void;
}

export function CreateActivityModal({ clientId, onActivityCreated, onClose }: CreateActivityModalProps) {
  const [activityType, setActivityType] = useState("Call");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    activityDate: format(new Date(), "yyyy-MM-dd"),
    activityTime: "09:00",
    attempts: 1,
    isMeeting: false,
    discussionSummary: "",
    outcome: "",
    nextFollowUpDate: "",
    nextFollowUpOwner: "",
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!clientId) return;

    try {
      setIsSubmitting(true);
      
      const payload: any = {
        activityType,
        activityDate: new Date(formData.activityDate).toISOString(),
        activityTime: formData.activityTime,
        attempts: Number(formData.attempts),
        isMeeting: formData.isMeeting,
        discussionSummary: formData.discussionSummary,
        outcome: formData.outcome,
      };

      if (formData.nextFollowUpDate) {
        payload.nextFollowUpDate = new Date(formData.nextFollowUpDate).toISOString();
      }

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

  const handleSelectChange = (key: string) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">Log Activity</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6 py-4">
          
          <Tabs value={activityType} onValueChange={setActivityType} className="w-full">
            <TabsList className="grid w-full grid-cols-5 gap-4">
              <TabsTrigger value="Call" className="data-[state=active]:bg-blue-100">
                <Phone className="h-4 w-4 mr-2" />
                CALL
              </TabsTrigger>
              <TabsTrigger value="Meeting" className="data-[state=active]:bg-blue-100">
                <Video className="h-4 w-4 mr-2" />
                MEETING
              </TabsTrigger>
              <TabsTrigger value="Email" className="data-[state=active]:bg-blue-100">
                <Mail className="h-4 w-4 mr-2" />
                EMAIL
              </TabsTrigger>
              <TabsTrigger value="LinkedIn" className="data-[state=active]:bg-blue-100">
                <Users className="h-4 w-4 mr-2" />
                LINKEDIN
              </TabsTrigger>
              <TabsTrigger value="WhatsApp" className="data-[state=active]:bg-blue-100">
                <ClipboardList className="h-4 w-4 mr-2" />
                WHATSAPP
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-[2fr,1fr,1fr] gap-4 items-center">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={formData.activityDate}
                onChange={handleInputChange("activityDate")}
                className="w-full"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input
                type="time"
                value={formData.activityTime}
                onChange={handleInputChange("activityTime")}
                required
              />
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
          </div>

          <div className="space-y-2">
            <Label>Discussion Summary</Label>
            <Textarea
              placeholder="What was discussed?"
              className="min-h-[100px]"
              value={formData.discussionSummary}
              onChange={handleInputChange("discussionSummary")}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Outcome</Label>
            <Input
              value={formData.outcome}
              onChange={handleInputChange("outcome")}
              placeholder="e.g. Scheduled a follow-up call"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Next Follow Up Date (Optional)</Label>
              <Input
                type="date"
                value={formData.nextFollowUpDate}
                onChange={handleInputChange("nextFollowUpDate")}
              />
            </div>
            <div className="space-y-2">
              <Label>Is this a meeting?</Label>
              <Select
                value={formData.isMeeting ? "yes" : "no"}
                onValueChange={(val) => setFormData(p => ({ ...p, isMeeting: val === "yes" }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
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