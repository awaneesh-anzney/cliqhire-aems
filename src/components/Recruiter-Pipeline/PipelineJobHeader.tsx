"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, HandCoins, MapPin, Plus, Users, Copy, Check, Download } from "lucide-react";
import { type Job } from "./dummy-data";
import { ExportCandidatesDialog } from "./ExportCandidatesDialog";

type Props = {
  job: Job;
  onAddCandidate: () => void;
};

export function PipelineJobHeader({ job, onAddCandidate }: Props) {
  const router = useRouter();
  const [isFormLinkCopied, setIsFormLinkCopied] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  console.log('DEBUG: PipelineJobHeader job data:', job);
  console.log('DEBUG: Hiring manager:', job.hiringManagerName);
  console.log('DEBUG: Recruiter:', job.recruiterName);
  console.log('DEBUG: Job team members:', job.jobTeamMembers);

  const handleCopyCandidateFormLink = async () => {
    const path = `${window.location.origin}/candidate?job=${encodeURIComponent(job.title)}`;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(path);
      } else {
        const ta = document.createElement("textarea");
        ta.value = path;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setIsFormLinkCopied(true);
      window.setTimeout(() => setIsFormLinkCopied(false), 15000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <div className="bg-brand-primary p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h3 
                  className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => job.jobId?._id && router.push(`/jobs/${job.jobId._id}`)}
                >
                  {job.title}
                </h3>
                <Building2 className="h-4 w-4 text-gray-400" />
                <span 
                  className="text-sm text-gray-600 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => {
                    const clientId = job.jobId?.client?._id || (typeof job.jobId?.client === 'string' ? job.jobId.client : null);
                    if (clientId) router.push(`/clients/${clientId}`);
                  }}
                >
                  {job.clientName}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-6 mt-2 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4 text-red-500" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center space-x-1">
                <HandCoins className="h-4 w-4 text-yellow-500" />
                <span>{job.salaryRange}</span>
              </div>
              <Badge variant="outline" className="bg-gray-100 text-gray-700">
                {job.jobType}
              </Badge>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4 text-purple-500" />
                <span>{job.totalCandidates || job.candidates.length} candidates</span>
              </div>
              {job.jobTeamMembers && job.jobTeamMembers.length > 0 ? (
                job.jobTeamMembers.map((member: any) => (
                  <div key={member.position} className="flex items-center space-x-1">
                    <span className="text-xs font-medium text-gray-500">{member.position === 'hiringManager' ? 'HM' : member.position === 'recruiter' ? 'Rec' : member.positionLabel}:</span>
                    <span className="text-xs text-gray-700">
                      {member.users?.map((u: any) => 
                        u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : (u.name || u.email || 'Unknown')
                      ).join(", ") || 'Not assigned'}
                    </span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-medium text-gray-500">HM:</span>
                    <span className="text-xs text-gray-700">{job.hiringManagerName || 'No HM'}</span>
                  </div>
                  {job.recruiterName && (
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-medium text-gray-500">Rec:</span>
                      <span className="text-xs text-gray-700">{job.recruiterName}</span>
                    </div>
                  )}
                </>
              )}
              {job.jobId?.stage && (
                <Badge
                  variant="outline"
                  className="bg-gray-100 text-gray-700 border-gray-200"
                >
                  {job.jobId.stage}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <Button size="sm" variant="outline" onClick={() => setIsExportDialogOpen(true)} title="Export Candidates">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button size="sm" variant="outline" onClick={handleCopyCandidateFormLink} title="Copy candidate form URL">
            {isFormLinkCopied ? (
              <Check className="h-4 w-4 mr-1 text-green-600" />
            ) : (
              <Copy className="h-4 w-4 mr-1" />
            )}
            {isFormLinkCopied ? "Copied" : "Copy Form URL"}
          </Button>
          <Button onClick={onAddCandidate} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            Attach Candidate
          </Button>
        </div>
      </div>

      <ExportCandidatesDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        pipelineId={job.id}
        jobTitle={job.title}
      />
    </div>
  );
}



