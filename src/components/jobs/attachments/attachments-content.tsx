"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Paperclip, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  createJobAttachment,
  getJobAttachmentsByJobId,
  deleteJobAttachment,
} from "@/services/attachmentService";

import { UploadAttachment } from "@/components/clients/attachments/uploadAttachment";
import { AttachmentList } from "@/components/clients/attachments/attachmentList";

export interface BackendAttachment {
  _id: string;
  fileName: string;
  uploadedAt: string;
  file: string;
}

interface AttachmentsContentProps {
  jobId: string;
  canModify?: boolean;
}

export function AttachmentsContent({ jobId, canModify }: AttachmentsContentProps) {
  const [showUploadBox, setShowUploadBox] = useState(false);
  const [attachments, setAttachments] = useState<BackendAttachment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAttachments = async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      const data = await getJobAttachmentsByJobId(jobId);
      setAttachments(data || []);
    } catch (error) {
      console.error("Error fetching attachments:", error);
      setAttachments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    try {
      await Promise.all(ids.map((id) => deleteJobAttachment(id)));
      fetchAttachments();
      toast.success("Files deleted successfully");
    } catch (error) {
      console.error("Error deleting attachments:", error);
      toast.error("Failed to delete files");
    }
  };

  const handleUpload = async (file: File) => {
    if (!jobId) return;
    try {
      await createJobAttachment(file, jobId);
      await fetchAttachments();
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload file");
    }
  };

  const handleDelete = async (attachmentId: string) => {
    try {
      await deleteJobAttachment(attachmentId);
      setAttachments((prev) =>
        prev.filter((item) => item._id !== attachmentId)
      );
      toast.success("File deleted successfully");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete file");
    }
  };

  useEffect(() => {
    fetchAttachments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  return (
    <div className="space-y-2.5 h-full">
      {/* Header Action Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 rounded-xl border border-border/70 bg-card shadow-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-md text-primary shrink-0">
            <Paperclip className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-foreground">Job Attachments</h3>
            <p className="text-[10px] text-muted-foreground font-medium">
              Manage position documents, specifications, or briefs ({attachments.length})
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
      </div>

      {/* Upload Modal */}
      <UploadAttachment
        show={showUploadBox}
        setShow={setShowUploadBox}
        onUpload={handleUpload}
        attachments={attachments}
      />

      {/* Content Area */}
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
            Upload candidate dossiers, job briefs, or requirements to share with your team.
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
          />
        </div>
      )}
    </div>
  );
}