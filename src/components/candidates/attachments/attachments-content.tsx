"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus, Paperclip, Loader2 } from "lucide-react";

import { UploadAttachment } from "./uploadAttachment";
import { AttachmentList } from "./attachmentList";

export interface BackendAttachment {
  _id: string;
  fileName: string;
  uploadedAt: string;
  file: string;
}

interface AttachmentsContentProps {
  candidateId: string;
  canModify?: boolean;
}

export function AttachmentsContent({ candidateId, canModify = true }: AttachmentsContentProps) {
  const [showUploadBox, setShowUploadBox] = useState(false);
  const [attachments, setAttachments] = useState<BackendAttachment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const mapApiAttachmentToBackend = (item: any): BackendAttachment => {
    return {
      _id: item?._id || item?.id || "",
      fileName: item?.fileName || item?.originalName || item?.name || "Untitled",
      uploadedAt: item?.uploadedAt || item?.createdAt || item?.updatedAt || "",
      file: item?.file || item?.fileUrl || item?.path || "",
    } as BackendAttachment;
  };

  const fetchAttachments = async () => {
    if (!candidateId) return;

    setLoading(true);
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/candidate-attachments?candidate_id=${encodeURIComponent(
        candidateId
      )}`;
      const response = await axios.get(url);
      const items = (response?.data?.data || []) as any[];
      setAttachments(items.map(mapApiAttachmentToBackend));
    } catch (error) {
      console.error("Error fetching attachments:", error);
      setAttachments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    if (!canModify) return;
    try {
      await Promise.all(
        ids.map((id) =>
          axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/candidate-attachments/${encodeURIComponent(id)}`)
        )
      );
      await fetchAttachments();
      toast.success("Files deleted successfully");
    } catch (error) {
      console.error("Error deleting attachments:", error);
      toast.error("Failed to delete files");
    }
  };

  const handleUpload = async (file: File) => {
    if (!candidateId) return;
    if (!canModify) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("candidate_id", candidateId);
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/candidate-attachments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchAttachments();
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload file");
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (!canModify) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/candidate-attachments/${encodeURIComponent(attachmentId)}`);
      setAttachments((prev) => prev.filter((item) => item._id !== attachmentId));
      toast.success("File deleted successfully");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete file");
    }
  };

  useEffect(() => {
    fetchAttachments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateId]);

  return (
    <section className="space-y-2.5 h-full">
      {/* Header Action Bar */}
      <header className="flex items-center justify-between px-3.5 py-2 rounded-xl border border-border/70 bg-card shadow-xs">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-primary/10 rounded-md text-primary shrink-0 inline-flex items-center justify-center">
            <Paperclip className="w-3.5 h-3.5" />
          </span>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-foreground">Candidate Attachments</h3>
            <p className="text-[10px] text-muted-foreground font-medium">
              Resumes, portfolios, credentials, or interview assessments ({attachments.length})
            </p>
          </div>
        </div>

        {canModify && (
          <Button
            onClick={() => setShowUploadBox(true)}
            size="sm"
            className="h-7 px-2.5 text-xs font-medium"
            disabled={showUploadBox}
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Upload File
          </Button>
        )}
      </header>

      <UploadAttachment
        show={showUploadBox}
        setShow={setShowUploadBox}
        onUpload={handleUpload}
        attachments={attachments}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center p-8 bg-card rounded-xl border border-border/70 min-h-[180px]">
          <Loader2 className="h-5 w-5 text-primary animate-spin mb-1.5" />
          <p className="text-xs font-medium text-muted-foreground">
            Loading attachments...
          </p>
        </div>
      ) : attachments.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center bg-muted/15 rounded-xl border border-dashed border-border/70 p-6 min-h-[180px]">
          <div className="w-10 h-10 mb-2 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <Paperclip className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-semibold text-foreground">No attachments uploaded</h4>
          <p className="text-[11px] text-muted-foreground max-w-xs mt-0.5 mb-3">
            Add resumes, portfolios, certificates, or references to share with your hiring team.
          </p>
          {canModify && (
            <Button
              onClick={() => setShowUploadBox(true)}
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-xs border-border text-foreground font-medium"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Upload First File
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-border/70 bg-card p-3 shadow-xs">
          <AttachmentList
            attachments={attachments}
            onDelete={handleDelete}
            onDeleteSelected={handleBulkDelete}
            canModify={canModify}
          />
        </div>
      )}
    </section>
  );
}
