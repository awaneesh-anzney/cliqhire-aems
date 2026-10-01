"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { Badge } from "@/components/ui/badge";

interface FileUploadRowProps {
  id: string;
  label: string;
  onFileSelect: (file: File | null) => void | Promise<void>;
  docUrl?: string;
  currentFileName?: string;
  onPreview?: () => void;
  onDownload?: () => void;
  className?: string;
  onUploadClick?: () => void;
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
  const hasFile = Boolean(currentFileName || docUrl);

  const getExtension = (name?: string) => {
    if (!name) return "";
    const parts = name.split(".");
    return parts.length > 1 ? parts.pop()?.toUpperCase() : "FILE";
  };

  return (
    <div
      className={`group flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg border border-border/60 bg-background/50 hover:bg-muted/40 transition-all duration-200 gap-2.5 ${className || ""}`}
    >
      {/* File Info */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div
          className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
            hasFile
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <DescriptionOutlinedIcon sx={{ fontSize: 16 }} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground tracking-tight">{label}</span>
            {hasFile ? (
              <Badge variant="outline" className="h-4 px-1 text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                {getExtension(currentFileName)}
              </Badge>
            ) : (
              <Badge variant="outline" className="h-4 px-1 text-[9px] font-normal text-muted-foreground/70 border-dashed">
                Missing
              </Badge>
            )}
          </div>
          <p
            className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-[280px]"
            title={currentFileName || "No document uploaded yet"}
          >
            {currentFileName || "No document uploaded yet"}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-1.5 shrink-0 self-end sm:self-center">
        {hasFile && onPreview && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2.5 text-xs font-medium rounded-lg border-border/70 text-foreground hover:bg-muted"
            onClick={onPreview}
            title="Preview Document"
          >
            <VisibilityOutlinedIcon sx={{ fontSize: 14, mr: 0.5, color: "text.secondary" }} />
            <span>View</span>
          </Button>
        )}

        {hasFile && onDownload && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2.5 text-xs font-medium rounded-lg border-border/70 text-foreground hover:bg-muted"
            onClick={onDownload}
            title="Download Document"
          >
            <FileDownloadOutlinedIcon sx={{ fontSize: 14, mr: 0.5, color: "text.secondary" }} />
            <span>Save</span>
          </Button>
        )}

        <Button
          variant={hasFile ? "ghost" : "outline"}
          size="sm"
          className={`h-8 px-2.5 text-xs font-medium rounded-lg ${
            !hasFile
              ? "border-brand/40 text-brand hover:bg-brand/10 bg-brand/5 font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
          onClick={onUploadClick}
          title={hasFile ? "Replace Document" : "Upload Document"}
        >
          <CloudUploadOutlinedIcon sx={{ fontSize: 15, mr: 0.5 }} />
          <span>{hasFile ? "Replace" : "Upload"}</span>
        </Button>
      </div>
    </div>
  );
};
