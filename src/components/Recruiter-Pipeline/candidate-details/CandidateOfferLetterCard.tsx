import React, { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileSignature, UploadCloud, Trash2, ExternalLink, Loader2, FileText, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { RecruiterPipelineService } from "@/services/recruiterPipelineService";
import { Candidate } from "../dummy-data";

interface CandidateOfferLetterCardProps {
  candidate: Candidate;
  pipelineId: string;
  canModify?: boolean;
}

export function CandidateOfferLetterCard({
  candidate,
  pipelineId,
  canModify = true,
}: CandidateOfferLetterCardProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const offerLetter = candidate.offerLetter;

  // Mutations
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const candidateId = candidate.id;
      const res = await RecruiterPipelineService.uploadOfferLetter(pipelineId, candidateId, file);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res;
    },
    onSuccess: () => {
      toast.success("Offer Letter Uploaded", {
        description: "The offer letter has been successfully added.",
      });
      queryClient.invalidateQueries({ queryKey: ["pipeline", pipelineId, "candidate", candidate.id] });
    },
    onError: (error: any) => {
      toast.error("Upload Failed", {
        description: error.message || "There was an error uploading the offer letter.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const candidateId = candidate.id;
      const res = await RecruiterPipelineService.deleteOfferLetter(pipelineId, candidateId);
      if (!res.success) {
        throw new Error(res.message);
      }
      return res;
    },
    onSuccess: () => {
      toast.success("Offer Letter Deleted", {
        description: "The offer letter has been successfully removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["pipeline", pipelineId, "candidate", candidate.id] });
    },
    onError: (error: any) => {
      toast.error("Deletion Failed", {
        description: error.message || "There was an error deleting the offer letter.",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File Too Large", { description: "Maximum file size is 5MB." });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    uploadMutation.mutate(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadClick = () => {
    if (!canModify) {
      toast.error("Access Denied", { description: "You do not have permission to upload an offer letter." });
      return;
    }
    fileInputRef.current?.click();
  };

  const handleDelete = () => {
    if (!canModify) {
      toast.error("Access Denied", { description: "You do not have permission to delete the offer letter." });
      return;
    }
    deleteMutation.mutate();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Card className="rounded-xl border border-border shadow-sm overflow-hidden mb-3 bg-card">
      <CardContent className="p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-brand">
            <FileSignature className="h-5 w-5" />
            <h3 className="font-bold text-sm tracking-tight text-foreground">Offer Letter</h3>
          </div>
          {offerLetter && (
            <Badge variant="outline" className="bg-emerald-100/50 text-emerald-700 border-emerald-200">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Uploaded
            </Badge>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.webp,.txt,.rtf"
          onChange={handleFileChange}
        />

        {!offerLetter ? (
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-xl bg-muted/30 gap-3">
            <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center">
              <UploadCloud className="h-5 w-5 text-brand" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">No Offer Letter Uploaded</p>
              <p className="text-xs text-muted-foreground mt-1">Upload a PDF, DOC, or Image (Max 5MB)</p>
            </div>
            <Button
              onClick={handleUploadClick}
              disabled={uploadMutation.isPending || !canModify}
              size="sm"
              className="mt-2 bg-brand hover:bg-brand/90 text-white rounded-lg px-6"
            >
              {uploadMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <UploadCloud className="h-4 w-4 mr-2" />
              )}
              Upload Offer Letter
            </Button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-border rounded-xl bg-muted/20">
            <div className="flex items-start gap-3 overflow-hidden">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <p className="text-sm font-semibold text-foreground truncate" title={offerLetter.fileName}>
                  {offerLetter.fileName}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span>{formatFileSize(offerLetter.fileSize)}</span>
                  <span>•</span>
                  <span>{format(new Date(offerLetter.uploadedAt), "MMM dd, yyyy HH:mm")}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5"
                onClick={() => window.open(offerLetter.url, "_blank")}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View
              </Button>
              {canModify && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5"
                    onClick={handleUploadClick}
                    disabled={uploadMutation.isPending}
                  >
                    {uploadMutation.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <UploadCloud className="h-3.5 w-3.5" />
                    )}
                    Replace
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
