import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { editClientFollowUp } from "@/services/clientService";
import { getTeamMembers } from "@/services/teamMembersService";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface EditFollowUpModalProps {
  clientId: string;
  followUpId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDate?: string;
  currentOwnerId?: string;
  currentNotes?: string;
  onSuccess?: () => void;
}

const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = i % 2 === 0 ? "00" : "30";
  return `${String(hours).padStart(2, "0")}:${minutes}`;
});

export function EditFollowUpModal({ clientId, followUpId, open, onOpenChange, currentDate, currentOwnerId, currentNotes, onSuccess }: EditFollowUpModalProps) {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [owner, setOwner] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  const [teamUsers, setTeamUsers] = useState<{ id: string; name: string; role?: string }[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    if (open) {
      if (currentDate) {
        try {
          const parsed = new Date(currentDate);
          setSelectedDate(parsed);
          setSelectedTime(format(parsed, "HH:mm"));
        } catch {
          setSelectedDate(undefined);
          setSelectedTime("09:00");
        }
      } else {
        setSelectedDate(undefined);
        setSelectedTime("09:00");
      }
      setOwner(currentOwnerId || "");
      setNotes(currentNotes || "");

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
    }
  }, [open, currentDate, currentOwnerId, currentNotes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate && !owner && !notes) {
      toast.error("Please provide at least a date, owner, or notes to update");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {};
      if (selectedDate) {
        const [hours, minutes] = selectedTime.split(":").map(Number);
        const finalDate = new Date(selectedDate);
        finalDate.setHours(hours || 0, minutes || 0, 0, 0);
        payload.scheduledDate = finalDate.toISOString();
      }
      if (owner) {
        payload.owner = owner;
      }
      if (notes) {
        payload.notes = notes;
      }
      await editClientFollowUp(clientId, followUpId, payload);
      toast.success("Follow-up updated successfully");
      queryClient.invalidateQueries({ queryKey: ["client", clientId] });
      queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to update follow-up");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Follow-up</DialogTitle>
          <DialogDescription>
            Update the scheduled date, owner, or notes for this pending follow-up.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Follow-up Date</Label>
                <Popover open={dateOpen} onOpenChange={setDateOpen} modal={true}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-10 border-border",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        setDateOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label>Time</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
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
            </div>

            <div className="grid gap-2">
              <Label>Follow-up Owner</Label>
              <Select value={owner} onValueChange={setOwner}>
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
            
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                placeholder="What is the plan for this follow-up?"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
