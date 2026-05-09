"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UploadIcon, Eye, Download as DownloadIcon } from "lucide-react";

interface FileUploadRowProps {
  id: string;
  label: string;
  onFileSelect: (file: File | null) => void | Promise<void>;
  docUrl?: string;
  currentFileName?: string;
  onPreview?: () => void;
  onDownload?: () => void;
  className?: string;
  onUploadClick?: () => void; // New prop for handling upload button click
}

export const FileUploadRow = ({
  id,
  label,
  onFileSelect,
  docUrl,
  currentFileName,
  onPreview,
  onDownload,
  className,
  onUploadClick,
}: FileUploadRowProps) => {
  const handleUploadClick = () => {
    if (onUploadClick) {
      onUploadClick();
    }
  };

  return (
    <div className={`flex items-center justify-between py-2 ${className || ""}`}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="flex items-center gap-10">
        <span className="text-sm text-foreground truncate" title={currentFileName || "No Details"}>
          {currentFileName || <span className="text-muted-foreground">No Details</span>}
        </span>
        <div className="flex items-center gap-4">
          {onPreview && (
            <Button variant="ghost" className="p-2 h-auto" onClick={onPreview} title="Preview">
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {onDownload && (
            <Button variant="ghost" className="p-2 h-auto" onClick={onDownload} title="Download">
              <DownloadIcon className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" className="p-2 h-auto" onClick={handleUploadClick} title="Upload">
            <UploadIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
