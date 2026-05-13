import React from "react";
import { AlertCircle, History } from "lucide-react";
import { type Candidate } from "@/components/Recruiter-Pipeline/dummy-data";

export function CandidateDisqualificationCard({ candidate }: { candidate: Candidate }) {
  const isDisqualified = candidate.status === 'Disqualified';
  const hasHistory = candidate.rejectionHistory && candidate.rejectionHistory.length > 0;

  if (!isDisqualified && !hasHistory) return null;

  return (
    <div className="space-y-3">
      {isDisqualified && (
        <div className="bg-red-50/40 border border-red-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center mb-3">
            <div className="w-6 h-6 bg-red-100 rounded-md flex items-center justify-center mr-2">
              <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            </div>
            <h4 className="text-sm font-semibold text-red-900">Current Disqualification</h4>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <p className="text-[10px] uppercase font-bold text-red-800/70 tracking-wider mb-0.5">Disqualified Stage</p>
              <p className="text-xs text-red-900 font-medium">{candidate.disqualified?.disqualificationStage || candidate.currentStage || 'Not specified'}</p>
            </div>
            <div className="flex flex-col">
              <p className="text-[10px] uppercase font-bold text-red-800/70 tracking-wider mb-0.5">Status</p>
              <p className="text-xs text-red-900 font-medium">{candidate.disqualified?.disqualificationStatus || 'Not specified'}</p>
            </div>
            <div className="flex flex-col">
              <p className="text-[10px] uppercase font-bold text-red-800/70 tracking-wider mb-0.5">Reason</p>
              <p className="text-xs text-red-900 font-medium">{candidate.disqualified?.disqualificationReason || candidate.notes || 'Not specified'}</p>
            </div>
            <div className="flex flex-col">
              <p className="text-[10px] uppercase font-bold text-red-800/70 tracking-wider mb-0.5">Feedback</p>
              <p className="text-xs text-red-900 font-medium">{candidate.disqualified?.disqualificationFeedback || 'Not specified'}</p>
            </div>
          </div>
        </div>
      )}

      {hasHistory && (
        <div className="bg-muted border border-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center mb-3">
            <div className="w-6 h-6 bg-muted rounded-md flex items-center justify-center mr-2">
              <History className="w-3.5 h-3.5 text-foreground" />
            </div>
            <h4 className="text-sm font-semibold text-foreground">Rejection History</h4>
          </div>
          <div className="space-y-3">
            {candidate.rejectionHistory?.map((rej, idx) => (
              <div key={idx} className="bg-card border border-border rounded-lg p-3 text-xs shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{rej.stage}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground font-medium">{rej.status}</span>
                  </div>
                  <span className="text-muted-foreground font-medium">{rej.rejectedAt ? new Date(rej.rejectedAt).toLocaleDateString() : 'Date unknown'}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-foreground"><span className="font-semibold text-foreground">Reason:</span> {rej.rejectionReason}</p>
                  {rej.feedback && <p className="text-muted-foreground italic"><span className="font-semibold text-foreground not-italic">Feedback:</span> {rej.feedback}</p>}
                  {rej.rejectedBy && <p className="text-muted-foreground text-[10px] mt-1">Rejected by: {rej.rejectedBy.name} ({rej.rejectedBy.email})</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
