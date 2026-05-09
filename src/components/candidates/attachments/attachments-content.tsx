"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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
      file: item?.file|| item?.fileUrl || item?.path || "",
    } as BackendAttachment;
  };

  // Fetch attachments from backend
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

  // Bulk delete selected attachments
  const handleBulkDelete = async (ids: string[]) => {
    if (!canModify) return;
    try {
      await Promise.all(
        ids.map((id) =>
          axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/candidate-attachments/${encodeURIComponent(id)}`)
        )
      );
      await fetchAttachments();
    } catch (error) {
      console.error("Error deleting attachments:", error);
    }
  };

  // Upload a file
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
      await fetchAttachments(); // refresh list after upload
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  // Delete a file
  const handleDelete = async (attachmentId: string) => {
    if (!canModify) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/candidate-attachments/${encodeURIComponent(attachmentId)}`);
      setAttachments((prev) => prev.filter((item) => item._id !== attachmentId));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  useEffect(() => {
    fetchAttachments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateId]);

  return (
    <div className="">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Upload File</h3>
        <Button
          onClick={() => setShowUploadBox(true)}
          disabled={showUploadBox || !canModify}
          className="flex items-center gap-2 bg-black text-white hover:bg-foreground"
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
        <div className="text-center py-8 text-muted-foreground">Loading attachments...</div>
      ) : attachments.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center">
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
          canModify={canModify}
        />
      )}
    </div>
  );
}
