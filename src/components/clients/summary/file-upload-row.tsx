"use client";

import { Button } from "@/components/ui/button";
import { UploadCloud, Eye, Download, FileText, CheckCircle2 } from "lucide-react";
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
      className={`group flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-border/60 bg-background/50 hover:bg-muted/40 transition-all duration-200 gap-3 ${className || ""}`}
    >
      {/* File Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
            hasFile
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <FileText className="h-4 w-4" />
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
            <Eye className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
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
            <Download className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
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
          <UploadCloud className="h-3.5 w-3.5 mr-1" />
          <span>{hasFile ? "Replace" : "Upload"}</span>
        </Button>
      </div>
    </div>
  );
};
