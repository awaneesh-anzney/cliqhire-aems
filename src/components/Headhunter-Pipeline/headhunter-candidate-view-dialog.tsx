"use client";

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { Candidate } from "@/components/Recruiter-Pipeline/dummy-data";

interface Props {
  candidate: Candidate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: (data: { rejectionDate?: string; rejectionReason?: string; rejectionReason1?: string }) => void;
}

export function HeadhunterCandidateViewDialog({ candidate, open, onOpenChange, onConfirm }: Props) {
  const formatDate = (value?: string) => {
    if (!value) return "";
    const d = new Date(value);
    return isNaN(d.getTime()) ? value : d.toLocaleDateString();
  };

  if (!candidate) return null;

  const rejectionReason = (candidate as any)?.rejectionReason || "";
  const rejectionReason1 = (candidate as any)?.rejectionReason1 || "";
  const rejectionDate = (candidate as any)?.rejectionDate || (candidate as any)?.rejectedDate || "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Candidate Details</DialogTitle>
          <DialogDescription>View candidate information and optionally record rejection details.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <div className="flex items-center gap-2">
              <Input value={candidate.name || ""} disabled className="bg-muted flex-1" />
              {candidate.isTempCandidate && (
                <Badge variant="destructive" className="text-xs px-2 py-0.5">
                  TEMP
                </Badge>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={candidate.email || ""} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={candidate.phone || ""} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Input value={(candidate.subStatus as any) || (candidate.status as any) || ""} disabled className="bg-muted" />
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Location</Label>
            <Input value={candidate.location || ""} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label>Rejection Date</Label>
            <Input value={formatDate(rejectionDate)} disabled className="bg-muted" />
          </div>
          <div className="space-y-2"></div>
          <div className="space-y-2 col-span-2">
            <Label>Rejection Reason</Label>
            <Textarea value={rejectionReason} rows={3} className="resize-none bg-muted" disabled />
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Rejection</Label>
            <Textarea value={rejectionReason1} rows={3} className="resize-none bg-muted" disabled />
          </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
