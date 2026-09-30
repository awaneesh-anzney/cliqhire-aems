"use client";

import React, { useState } from "react";
import { 
  Paperclip, 
  Download, 
  ExternalLink, 
  FileText, 
  Image as ImageIcon, 
  Sheet, 
  FileCode, 
  FileArchive, 
  File as GenericFile,
  Eye,
  Check
} from "lucide-react";
import { EmailAttachment } from "@/types/email";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EmailAttachmentListProps {
  attachments: EmailAttachment[];
}

export const EmailAttachmentList: React.FC<EmailAttachmentListProps> = ({ attachments }) => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  if (!attachments || attachments.length === 0) return null;

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "0 KB";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileCategory = (filename: string, mime?: string) => {
    const lower = filename.toLowerCase();
    if (lower.endsWith(".pdf") || mime?.includes("pdf")) {
      return {
        icon: <FileText className="h-4 w-4 text-rose-500 shrink-0" />,
        badge: "PDF",
        badgeClass: "bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-900/50",
        isImage: false,
      };
    }
    if (
      lower.endsWith(".png") ||
      lower.endsWith(".jpg") ||
      lower.endsWith(".jpeg") ||
      lower.endsWith(".webp") ||
      lower.endsWith(".gif") ||
      mime?.includes("image")
    ) {
      return {
        icon: <ImageIcon className="h-4 w-4 text-purple-500 shrink-0" />,
        badge: "Image",
        badgeClass: "bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-900/50",
        isImage: true,
      };
    }
    if (lower.endsWith(".xls") || lower.endsWith(".xlsx") || lower.endsWith(".csv")) {
      return {
        icon: <Sheet className="h-4 w-4 text-emerald-500 shrink-0" />,
        badge: "Sheet",
        badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900/50",
        isImage: false,
      };
    }
    if (lower.endsWith(".zip") || lower.endsWith(".tar") || lower.endsWith(".gz") || lower.endsWith(".rar")) {
      return {
        icon: <FileArchive className="h-4 w-4 text-amber-500 shrink-0" />,
        badge: "Archive",
        badgeClass: "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-900/50",
        isImage: false,
      };
    }
    if (lower.endsWith(".js") || lower.endsWith(".ts") || lower.endsWith(".json") || lower.endsWith(".html") || lower.endsWith(".css")) {
      return {
        icon: <FileCode className="h-4 w-4 text-blue-500 shrink-0" />,
        badge: "Code",
        badgeClass: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900/50",
        isImage: false,
      };
    }
    return {
      icon: <GenericFile className="h-4 w-4 text-slate-500 shrink-0" />,
      badge: "File",
      badgeClass: "bg-slate-500/10 text-slate-600 border-slate-200 dark:border-slate-800",
      isImage: false,
    };
  };

  return (
    <div className="pt-3.5 border-t border-border/60 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <Paperclip className="h-3.5 w-3.5 text-blue-600" />
          <span>Attachments ({attachments.length})</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {attachments.map((file, idx) => {
          const cat = getFileCategory(file.fileName, file.mimeType);
          const hasUrl = !!file.storageUrl;

          return (
            <div
              key={idx}
              className={`group/file flex flex-col justify-between p-2.5 rounded-xl border border-border/70 bg-card hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-sm transition-all ${
                hasUrl ? "cursor-pointer" : "opacity-75"
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="p-2 rounded-lg bg-muted/40 border border-border/50 shrink-0 mt-0.5">
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-foreground text-xs truncate" title={file.fileName}>
                      {file.fileName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {formatFileSize(file.sizeBytes)}
                    </span>
                    <Badge variant="outline" className={`text-[9px] px-1 py-0 h-4 ${cat.badgeClass}`}>
                      {cat.badge}
                    </Badge>
                  </div>
                </div>
              </div>

              {hasUrl && (
                <div className="flex items-center justify-end gap-1 pt-2 mt-2 border-t border-border/40">
                  <a
                    href={file.storageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-muted-foreground hover:text-blue-600 rounded-md hover:bg-muted/50 transition-colors"
                    title="Open attachment in new tab"
                  >
                    <Eye className="h-3 w-3" />
                    <span>View</span>
                  </a>
                  <a
                    href={file.storageUrl}
                    download={file.fileName}
                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-md transition-colors"
                    title="Download attachment"
                  >
                    <Download className="h-3 w-3" />
                    <span>Download</span>
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
