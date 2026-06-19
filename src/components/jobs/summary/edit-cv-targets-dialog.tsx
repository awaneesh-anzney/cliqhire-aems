"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus, Trash, CalendarIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CvTarget } from "../types";

interface EditCvTargetsDialogProps {
  open: boolean;
  onClose: () => void;
  cvTargets?: CvTarget[];
  onSave: (updatedTargets: CvTarget[]) => Promise<void>;
}

export function EditCvTargetsDialog({
  open,
  onClose,
  cvTargets = [],
  onSave,
}: EditCvTargetsDialogProps) {
  const [slots, setSlots] = useState<{
    _id?: string;
    label: string;
    startDate: Date | undefined;
    endDate: Date | undefined;
    targetCount: number;
  }[]>([]);
  const [saving, setSaving] = useState(false);

  // Helper to safely parse date avoiding timezone shifts
  const parseDateSafely = (dateString?: string) => {
    if (!dateString) return undefined;
    try {
      const datePart = dateString.split('T')[0];
      const date = new Date(datePart + 'T00:00:00');
      if (isNaN(date.getTime())) return undefined;
      return date;
    } catch {
      return undefined;
    }
  };

  useEffect(() => {
    if (open) {
      setSlots(
        cvTargets.map((t) => ({
          _id: t._id,
          label: t.label || "",
          startDate: parseDateSafely(t.startDate),
          endDate: parseDateSafely(t.endDate),
          targetCount: t.targetCount || 1,
        }))
      );
    }
  }, [open, cvTargets]);

  const handleAddSlot = () => {
    setSlots((prev) => [
      ...prev,
      { label: "", startDate: undefined, endDate: undefined, targetCount: 1 },
    ]);
  };

  const handleRemoveSlot = (index: number) => {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSlotChange = (index: number, key: string, value: any) => {
    setSlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, [key]: value } : slot))
    );
  };

  const handleSave = async () => {
    // Validations
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      if (!slot.startDate) {
        toast.error(`Slot ${i + 1}: Start Date is required.`);
        return;
      }
      if (!slot.endDate) {
        toast.error(`Slot ${i + 1}: End Date is required.`);
        return;
      }
      if (slot.endDate < slot.startDate) {
        toast.error(`Slot ${i + 1}: End Date must be greater than or equal to Start Date.`);
        return;
      }
      if (!slot.targetCount || slot.targetCount < 1) {
        toast.error(`Slot ${i + 1}: Target CVs must be at least 1.`);
        return;
      }
    }

    setSaving(true);
    try {
      const formattedTargets = slots.map((s) => {
        // Safe formatting to YYYY-MM-DD
        const getYYYYMMDD = (d: Date) => {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };
        const startStr = getYYYYMMDD(s.startDate!);
        const endStr = getYYYYMMDD(s.endDate!);

        return {
          ...(s._id ? { _id: s._id } : {}),
          label: s.label,
          startDate: new Date(`${startStr}T00:00:00.000Z`).toISOString(),
          endDate: new Date(`${endStr}T23:59:59.999Z`).toISOString(), // Set end of day to align with backend
          targetCount: s.targetCount,
        };
      });

      await onSave(formattedTargets);
      onClose();
    } catch (error) {
      console.error("Failed to save CV targets:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="flex flex-row justify-between items-center pb-4 border-b">
          <DialogTitle className="text-xl font-bold text-foreground">
            Manage CV Target Slots
          </DialogTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddSlot}
            className="text-primary hover:bg-primary/10 border-primary/20 font-bold"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Slot
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {slots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-xl">
              No CV targets defined yet. Click &quot;Add Slot&quot; to create one.
            </div>
          ) : (
            slots.map((slot, index) => (
              <div
                key={index}
                className="bg-muted/30 p-4 rounded-xl border border-border space-y-3 relative group"
              >
                <div className="flex justify-between items-center border-b pb-2 border-border/50">
                  <span className="text-xs font-bold text-foreground">Slot {index + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSlot(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 rounded-lg"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-muted-foreground">Label</Label>
                    <Input
                      placeholder="e.g. Phase 1"
                      value={slot.label}
                      onChange={(e) => handleSlotChange(index, "label", e.target.value)}
                      className="h-10 text-sm font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-muted-foreground">
                      Target CVs <span className="text-primary">*</span>
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="e.g. 5"
                      value={slot.targetCount || ""}
                      onChange={(e) =>
                        handleSlotChange(index, "targetCount", parseInt(e.target.value) || 0)
                      }
                      className="h-10 text-sm font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-muted-foreground">
                      Start Date <span className="text-primary">*</span>
                    </Label>
                    <Popover modal={true}>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal h-10 text-sm font-semibold",
                            !slot.startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {slot.startDate ? format(slot.startDate, "PPP") : <span>Pick start date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={slot.startDate}
                          onSelect={(date) => handleSlotChange(index, "startDate", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-muted-foreground">
                      End Date <span className="text-primary">*</span>
                    </Label>
                    <Popover modal={true}>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal h-10 text-sm font-semibold",
                            !slot.endDate && "text-muted-foreground"
                          )}
                          disabled={!slot.startDate}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {slot.endDate ? format(slot.endDate, "PPP") : <span>Pick end date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={slot.endDate}
                          onSelect={(date) => handleSlotChange(index, "endDate", date)}
                          initialFocus
                          disabled={(date) => (slot.startDate ? date < slot.startDate : false)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t mt-auto">
          <Button variant="outline" onClick={onClose} disabled={saving} className="font-bold">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="font-bold bg-primary text-white">
            {saving ? "Saving..." : "Save Targets"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
