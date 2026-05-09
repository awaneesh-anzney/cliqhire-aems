"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Plus , RefreshCcw, Loader } from "lucide-react";
import { toast } from "sonner";
import {
  createJobAttachment,
  getJobAttachmentsByJobId,
  deleteJobAttachment
} from "@/services/attachmentService";

// Reuse the UploadAttachment and AttachmentList components from the client attachments folder
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
      await Promise.all(ids.map(id => deleteJobAttachment(id)));
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
      // Always refresh list after upload to ensure new file appears
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
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Upload File</h3>
        <Button
          onClick={() => setShowUploadBox(true)}
          className="flex items-center gap-2 bg-black text-white hover:bg-foreground"
          disabled={showUploadBox || !canModify}
        >
          <Plus className="w-4 h-4" />
          Upload File
        </Button>
      </div>

      <UploadAttachment
        show={showUploadBox}
        setShow={setShowUploadBox}
        onUpload={handleUpload}
        attachments={attachments}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader className="size-6 animate-spin" />
          <div className="text-lg text-foreground mt-2">Loading Attachments Details ......</div>
        </div>
      ) : attachments.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <div className="w-48 h-48 mb-6">
            <svg viewBox="0 0 200 200" className="w-full h-full text-blue-500">
              <rect x="50" y="80" width="100" height="60" rx="10" fill="currentColor" opacity="0.1" />
              <rect x="70" y="100" width="60" height="20" rx="4" fill="currentColor" opacity="0.2" />
              <circle cx="100" cy="120" r="8" fill="currentColor" opacity="0.2" />
              <rect x="120" y="90" width="20" height="8" rx="2" fill="currentColor" opacity="0.3" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">No attachments yet</h2>
          <p className="text-muted-foreground mb-4">
            Add your first attachment to share files with your team.
          </p>
        </div>
      ) : (
        <AttachmentList
          attachments={attachments}
          onDelete={handleDelete}
          onDeleteSelected={handleBulkDelete}
        />
      )}
    </div>
  );
}