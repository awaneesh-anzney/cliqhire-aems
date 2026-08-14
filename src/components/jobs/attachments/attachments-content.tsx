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

  // Fetch attachments from backend for this job
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

  // Bulk delete selected attachments
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

  // Upload a file for this job
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

  // Delete a file
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
    <div className="space-y-4 h-full">
      
      {/* Header Action Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
            <Paperclip className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Job Attachments</h2>
            <p className="text-[11px] text-muted-foreground">
              Manage relevant documents, resumes, or client specs
            </p>
          </div>
        </div>

        {canModify && (
          <Button
            onClick={() => setShowUploadBox(true)}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-medium transition-all text-xs"
            disabled={showUploadBox}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Upload File
          </Button>
        )}
      </div>

      {/* Upload Modal / Component */}
      <UploadAttachment
        show={showUploadBox}
        setShow={setShowUploadBox}
        onUpload={handleUpload}
        attachments={attachments}
      />

      {/* Dynamic Content Views */}
      {loading ? (
        /* Modern Clean Centered Loader */
        <div className="flex flex-col items-center justify-center p-12 bg-card/40 rounded-2xl border border-border/60 min-h-[260px]">
          <Loader2 className="h-6 w-6 text-emerald-600 animate-spin mb-2" />
          <p className="text-xs font-medium text-muted-foreground">
            Loading attachments...
          </p>
        </div>
      ) : attachments.length === 0 ? (
        /* Modern Empty State Card */
        <div className="flex flex-col items-center justify-center text-center bg-card/40 rounded-2xl border border-dashed border-border/80 p-10 min-h-[260px]">
          <div className="w-12 h-12 mb-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
            <Paperclip className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-foreground">No attachments uploaded</h3>
          <p className="text-xs text-muted-foreground max-w-xs mt-1 mb-4">
            Upload candidate files, job specs, or compliance documents to share with your team.
          </p>
          {canModify && (
            <Button
              onClick={() => setShowUploadBox(true)}
              variant="outline"
              size="sm"
              className="border-emerald-600/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Attachment
            </Button>
          )}
        </div>
      ) : (
        /* Attachments List Container */
        <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-4 shadow-sm">
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