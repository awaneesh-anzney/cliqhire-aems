"use client";

import { Button } from "@/components/ui/button";
import { getFileIcon } from "./file-icon";
import { ConfirmDeleteDialog } from "@/components/ui/ConfirmDeleteDialog";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2, Download } from "lucide-react";

import { BackendAttachment } from "./attachments-content";

interface Props {
  attachments: BackendAttachment[];
  onDelete: (id: string) => void;
  onDeleteSelected?: (ids: string[]) => void;
}

export function AttachmentList({ attachments, onDelete, onDeleteSelected }: Props) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);

  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === attachments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(attachments.map((a) => a._id));
    }
  };

  const handleBulkDelete = async () => {
    if (onDeleteSelected && selectedIds.length > 0) {
      await onDeleteSelected(selectedIds);
      setSelectedIds([]);
      setBulkDialogOpen(false);
    }
  };

  const handleDelete = (id: string) => {
    onDelete(id);
  };

  const handleDownload = (attachment: BackendAttachment) => {
    window.open(attachment.file, "file");
  };

  if (attachments.length === 0) return null;

  return (
    <div className="mt-4">
      <h4 className="font-medium mb-2">Attachments:</h4>
      <div className="flex items-center mb-2 gap-2 justify-between">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedIds.length === attachments.length && attachments.length > 0}
            onChange={handleSelectAll}
          />
          <span className="text-sm">Select All</span>
        </div>
        {selectedIds.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setBulkDialogOpen(true)}
            className="ml-2"
          >
            <span className="text-base font-medium">Delete</span>
          </Button>
        )}
      </div>
      <ul className="space-y-3">
        {attachments.map((attachment:any) => (
          <li
            key={attachment._id}
            className={`flex items-center justify-between border rounded-md p-2 ${selectedIds.includes(attachment._id) ? 'bg-muted' : 'bg-muted'}`}
          >
            <div
              className="flex items-center gap-2 min-w-0 cursor-pointer select-none w-full"
              onClick={e => {
                // Prevent row click if download link is clicked
                if ((e.target as HTMLElement).closest('.attachment-filename-link')) return;
                handleSelect(attachment._id);
              }}
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleSelect(attachment._id); }}
              role="button"
              aria-pressed={selectedIds.includes(attachment._id)}
            >
              {(selectedIds.length > 0 || selectedIds.includes(attachment._id)) && (
                <input
                  type="checkbox"
                  checked={selectedIds.includes(attachment._id)}
                  onChange={e => { e.stopPropagation(); handleSelect(attachment._id); }}
                  className="cursor-pointer"
                />
              )}
              {getFileIcon(attachment.fileName)}
              <span
                className="text-blue-600 text-sm font-medium flex items-center gap-2 truncate max-w-[60%] hover:underline focus:underline attachment-filename-link"
                style={{ cursor: 'pointer' }}
                onClick={e => {
                  e.stopPropagation();
                  window.open(attachment.file, '_blank');
                }}
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    window.open(attachment.file, '_blank');
                  }
                }}
                role="link"
                aria-label={`Open ${attachment.fileName}`}
              >
                {attachment.fileName}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {attachment.uploadedAt
                  ? new Date(attachment.uploadedAt).toLocaleString()
                  : ""}
              </span>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" data-dropdown-trigger>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleDownload(attachment)}
                  >
                    <Download className="h-4 w-4 mr-2" /> Download
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setTimeout(() => {
                        setDeleteId(attachment._id);
                        setIsDialogOpen(true);
                      }, 0); // setTimeout prevents pointer/cursor bug
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
             
            </div>
          </li>
        ))}
      </ul>
      {/* Bulk Delete Dialog */}
      <ConfirmDeleteDialog
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        onConfirm={handleBulkDelete}
        title="Delete Selected Files"
        description={`Are you sure you want to delete ${selectedIds.length} selected file(s)?`}
      />
      {/* Single Delete Dialog */}
      <ConfirmDeleteDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setTimeout(() => {
              setDeleteId(null);
            }, 200);
          }
        }}
        onConfirm={() => {
          if (deleteId) {
            handleDelete(deleteId);
            // Use setTimeout to delay clearing state, preventing pointer/cursor issues
            setTimeout(() => {
              setDeleteId(null);
              setIsDialogOpen(false);
            }, 200);
          }
        }}
        title="Delete File"
        description="Are you sure you want to delete this file?"
      />
    </div>
  );
}
