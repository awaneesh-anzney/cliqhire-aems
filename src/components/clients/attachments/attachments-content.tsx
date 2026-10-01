"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import CircularProgress from "@mui/material/CircularProgress";
import { UploadAttachment } from "./uploadAttachment";
import { AttachmentList } from "./attachmentList";
import { Badge } from "@/components/ui/badge";

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

  const handleBulkDelete = async (ids: string[]) => {
    try {
      await Promise.all(
        ids.map((id) => axios.delete(`${API_BASE_URL}/api/attachments/${id}`)),
      );
      fetchAttachments();
    } catch (error) {
      console.error("Error deleting attachments:", error);
    }
  };

  const handleUpload = async (file: File) => {
    if (!clientId) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("client_id", clientId);

      await axios.post(`${API_BASE_URL}/api/attachments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchAttachments();
      setShowUploadBox(false);
    } catch (error) {
      console.error("Error uploading attachment:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/attachments/${id}`);
      fetchAttachments();
    } catch (error) {
      console.error("Error deleting attachment:", error);
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, [clientId]);

  return (
    <div className="space-y-4">
      {/* Header action bar */}
      <div className="flex items-center justify-between bg-card p-3.5 rounded-xl border border-border/70 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <AttachFileOutlinedIcon sx={{ fontSize: 18 }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Client Attachments</h3>
              <Badge variant="outline" className="h-5 px-1.5 text-xs font-bold bg-primary/10 text-primary border-primary/20">
                {attachments.length}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Files, agreements, and reference documents</p>
          </div>
        </div>

        {canModify && (
          <Button
            onClick={() => setShowUploadBox(true)}
            disabled={showUploadBox}
            size="sm"
            className="h-8 px-3 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5"
          >
            <AddOutlinedIcon sx={{ fontSize: 15 }} />
            Upload File
          </Button>
        )}
      </div>

      <div className="bg-card rounded-xl border border-border/70 shadow-2xs p-4 sm:p-5">
        <UploadAttachment
          show={showUploadBox}
          setShow={setShowUploadBox}
          onUpload={handleUpload}
          attachments={attachments}
        />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <CircularProgress size={30} thickness={4} sx={{ color: "primary.main" }} />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Loading attachments...
            </p>
          </div>
        ) : attachments.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <div className="w-12 h-12 mb-3 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground">
              <AttachFileOutlinedIcon sx={{ fontSize: 26 }} />
            </div>
            <h4 className="text-sm font-bold text-foreground mb-1">No attachments uploaded</h4>
            <p className="text-xs text-muted-foreground max-w-sm mb-4">
              Add your first document or agreement to share across the team.
            </p>
            {canModify && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-semibold"
                onClick={() => setShowUploadBox(true)}
              >
                <AddOutlinedIcon sx={{ fontSize: 15, mr: 0.5 }} /> Add Document
              </Button>
            )}
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
