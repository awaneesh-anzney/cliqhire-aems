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
  clientId: string;
  canModify?: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export function AttachmentsContent({ clientId, canModify = true }: AttachmentsContentProps) {
  const [showUploadBox, setShowUploadBox] = useState(false);
  const [attachments, setAttachments] = useState<BackendAttachment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch attachments from backend
  const fetchAttachments = async () => {
    if (!clientId) return;

    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/attachments?client_id=${clientId}`);
      setAttachments(response.data.data || []);
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
      await Promise.all(
        ids.map(id => axios.delete(`${API_BASE_URL}/api/attachments/${id}`))
      );
      fetchAttachments();
    } catch (error) {
      console.error("Error deleting attachments:", error);
    }
  };

  // Upload a file
  const handleUpload = async (file: File) => {
    if (!clientId) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("client_id", clientId);

      await axios.post(`${API_BASE_URL}/api/attachments`, formData);
      // Always refresh list after upload to ensure new file appears
      await fetchAttachments();
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  // Delete a file
  const handleDelete = async (attachmentId: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/${attachmentId}`);
      setAttachments((prev) =>
        prev.filter((item) => item._id !== attachmentId)
      );
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  useEffect(() => {
    fetchAttachments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  return (
    <div className="bg-muted/50 rounded-2xl p-6 flex flex-col h-full">
      <div className="mb-6 flex items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand/10 rounded-lg">
            <Plus className="w-4 h-4 text-brand" />
          </div>
          <h3 className="text-base font-semibold text-foreground">Client Attachments</h3>
        </div>
        <Button
          onClick={() => setShowUploadBox(true)}
          disabled={showUploadBox || !canModify}
          className="hover:bg-brand/90 transition-colors bg-brand text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Upload File
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-6 flex-1">
        <UploadAttachment
          show={showUploadBox}
          setShow={setShowUploadBox}
          onUpload={handleUpload}
          attachments={attachments}
        />

        {loading ? (
          <div className="text-center py-12 text-muted-foreground animate-pulse">Loading attachments...</div>
        ) : attachments.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <div className="w-24 h-24 mb-6 bg-muted rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">No attachments yet</h2>
            <p className="text-muted-foreground max-w-sm">
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
    </div>
  );
}
