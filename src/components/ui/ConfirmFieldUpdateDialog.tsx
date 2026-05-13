"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle } from "lucide-react";

interface ConfirmFieldUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fieldName: string;
  oldValue: string | string[];
  newValue: string | string[];
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmFieldUpdateDialog({
  open,
  onOpenChange,
  fieldName,
  oldValue,
  newValue,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmFieldUpdateDialogProps) {
  const formatValue = (value: string | string[]) => {
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(", ") : "—";
    }
    return value || "—";
  };

  const oldValueFormatted = formatValue(oldValue);
  const newValueFormatted = formatValue(newValue);

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen && isLoading) {
        // Don't allow closing while loading
        return;
      }
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Confirm Field Update
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to update the <strong>{fieldName}</strong> field?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Current Value:</label>
              <div className="mt-1 p-2 bg-muted rounded border text-sm text-foreground min-h-[40px] flex items-center">
                {oldValueFormatted}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">New Value:</label>
              <div className="mt-1 p-2 bg-blue-50 rounded border text-sm text-blue-700 min-h-[40px] flex items-center">
                {newValueFormatted}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
                     <Button
             onClick={onConfirm}
             disabled={isLoading}
           >
             {isLoading ? "Updating..." : "Update Field"}
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ConfirmFieldUpdateDialog;
