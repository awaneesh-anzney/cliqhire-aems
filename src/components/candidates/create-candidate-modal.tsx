"use client";

import { FileText, Upload, CheckCircle2, Building2, Info, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, cloneElement, ReactElement } from "react";
import CreateCandidateForm from "./create-candidate-form";
import { UploadResume } from "./UploadResume";
import React from "react";

interface CreateCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCandidateCreated?: (candidate: any) => void;
  tempCandidateData?: any;
  isTempCandidateConversion?: boolean;
  pipelineId?: string;
  tempCandidateId?: string;
  isHeadhunterCreate?: boolean;
}

interface OptionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

function OptionCard({ icon, title, description, onClick }: OptionCardProps) {
  return (
    <Button
      variant="outline"
      className="h-auto flex flex-col items-center gap-4 p-8 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all duration-300 group shadow-sm hover:shadow-md bg-card rounded-2xl"
      onClick={onClick}
    >
      <div className="w-16 h-16 flex items-center justify-center bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-colors duration-300">
        {cloneElement(icon as ReactElement, {
          className: "w-8 h-8 text-primary transition-colors duration-300"
        })}
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">{title}</span>
        <span className="text-sm text-muted-foreground font-normal group-hover:text-foreground transition-colors duration-300">{description}</span>
      </div>
    </Button>
  );
}

export function CreateCandidateModal({
  isOpen,
  onClose,
  onCandidateCreated,
  tempCandidateData,
  isTempCandidateConversion = false,
  pipelineId,
  tempCandidateId,
  isHeadhunterCreate,
}: CreateCandidateModalProps) {
  const [showForm, setShowForm] = useState(!!tempCandidateData);
  const [showUpload, setShowUpload] = useState(false);
  const [candidateSummary, setCandidateSummary] = useState<any | null>(null);

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setShowForm(false);
      setCandidateSummary(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl h-auto">
        {candidateSummary ? (
          <div className="p-12 flex flex-col items-center text-center gap-6 bg-card min-h-[500px] justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-black text-foreground tracking-tight">Candidate Profile Created!</h2>
            <p className="text-muted-foreground font-medium max-w-sm">The candidate has been successfully added to your talent pool.</p>
            
            <div className="bg-muted rounded-2xl border border-border p-8 w-full max-w-md text-left space-y-4 shadow-inner">
              <div className="flex justify-between items-center"><span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Name</span> <span className="font-bold text-foreground">{candidateSummary.name}</span></div>
              <div className="flex justify-between items-center"><span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Email</span> <span className="font-bold text-foreground">{candidateSummary.email}</span></div>
              <div className="flex justify-between items-center"><span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Phone</span> <span className="font-bold text-foreground">{candidateSummary.phone}</span></div>
            </div>

            <Button
              variant="outline"
              onClick={() => setCandidateSummary(null)}
              className="mt-4 border-border font-bold px-8 h-12 rounded-xl hover:bg-muted"
            >Back to Options</Button>
          </div>
        ) : showForm ? (
          <CreateCandidateForm
            onCandidateCreated={(candidate: any) => {
              if (onCandidateCreated) onCandidateCreated(candidate);
              setCandidateSummary(candidate);
              setShowForm(false);
            }}
            goBack={() => setShowForm(false)}
            onClose={onClose}
            tempCandidateData={tempCandidateData}
            isTempCandidateConversion={isTempCandidateConversion}
            pipelineId={pipelineId}
            tempCandidateId={tempCandidateId}
            isHeadhunterCreate={isHeadhunterCreate}
          />
        ) : showUpload ? (
          <div className="h-[600px] flex flex-col">
             <DialogHeader className="p-8 pb-4">
                <DialogTitle className="text-3xl font-black text-primary tracking-tight">Upload Resume</DialogTitle>
                <DialogDescription className="text-muted-foreground font-semibold text-sm">Upload a PDF or Word document to parse candidate details.</DialogDescription>
             </DialogHeader>
             <div className="flex-1 px-8">
              <UploadResume
                open={showUpload}
                onClose={() => setShowUpload(false)}
                goBack={() => setShowUpload(false)}
                useDialog={false}
              />
             </div>
          </div>
        ) : (
          <div className="bg-card">
            <div className="p-8 pb-4">
               <DialogHeader>
                  <DialogTitle className="text-3xl font-black text-primary tracking-tight">Create Candidate</DialogTitle>
                  <DialogDescription className="text-muted-foreground font-semibold text-sm">Choose your preferred method to onboard a new candidate.</DialogDescription>
               </DialogHeader>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 pt-4">
              <OptionCard
                icon={<FileText />}
                title="Complete a Form"
                description="Manually enter full candidate details"
                onClick={() => setShowForm(true)}
              />
              <OptionCard
                icon={<Upload />}
                title="Upload a Resume"
                description="Automatically parse details from a CV"
                onClick={() => setShowUpload(true)}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
