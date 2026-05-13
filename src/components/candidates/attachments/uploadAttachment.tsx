"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { UploadCloud, X } from "lucide-react";
import { getFileIcon } from "./file-icon";
import { BackendAttachment } from "./attachments-content";

interface UploadProps {
  show: boolean;
  setShow: (show: boolean) => void;
  onUpload: (file: File) => Promise<void>;
  attachments: BackendAttachment[];
}

export function UploadAttachment({ show, setShow, onUpload, attachments }: UploadProps) {
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const triggerFileSelect = () => fileInputRef.current?.click();

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // Defensive: attachments may be undefined if not passed as prop
    const safeAttachments = attachments || [];
    const uniqueFiles = files.filter((file) => {
      const alreadySelected = selectedFiles.some((f) => f.name === file.name && f.size === file.size);
      const alreadyUploaded = safeAttachments.some((a) => a.fileName === file.name);
      return !alreadySelected && !alreadyUploaded;
    });

    if (uniqueFiles.length !== files.length) {
      setAlertMessage("This file is already uploaded or selected.");
      setShowAlert(true);
    }
    if (uniqueFiles.length === 0) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFiles((prev) => [...prev, ...uniqueFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadAll = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);

    // Simulate upload progress for all files in parallel
    await Promise.all(selectedFiles.map((file) => {
      return new Promise<void>((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: progress,
          }));
          if (progress >= 100) {
            clearInterval(interval);
            onUpload(file).finally(() => {
              setSelectedFiles((prev) => prev.filter((f) => f.name !== file.name));
              setUploadProgress((prev) => {
                const updated = { ...prev };
                delete updated[file.name];
                return updated;
              });
              resolve();
            });
          }
        }, 150);
      });
    }));
    setUploading(false);
    setShow(false);
    // Move focus back to the trigger button
    triggerButtonRef.current?.focus();
  };


  const handleCloseUpload = () => {
    setSelectedFiles([]);
    setUploading(false);
    setShow(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    // Move focus back to the trigger button
    triggerButtonRef.current?.focus();
  };

  const handleFileRemove = (index: number) => {
    if (uploading) return;
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Drag-and-drop: preview files, upload on button click
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (uploading) return;
    const files = Array.from(e.dataTransfer.files || []);
    const safeAttachments = attachments || [];
    const uniqueFiles = files.filter((file) => {
      const alreadySelected = selectedFiles.some((f) => f.name === file.name && f.size === file.size);
      const alreadyUploaded = safeAttachments.some((a) => a.fileName === file.name);
      return !alreadySelected && !alreadyUploaded;
    });

    if (uniqueFiles.length !== files.length) {
      setAlertMessage("This file is already uploaded or selected.");
      setShowAlert(true);
    }
    if (uniqueFiles.length === 0) return;

    setSelectedFiles((prev) => [...prev, ...uniqueFiles]);
  };


  if (!show) return null;

  return (
    <>
      <div
        className="relative border-2 border-border rounded-md p-8 bg-muted mb-6 shadow-sm"
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
      >
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2 hover:bg-muted"
        onClick={handleCloseUpload}
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="text-center">
        <UploadCloud className="mx-auto text-5xl text-muted-foreground mb-4" />
        <p className="text-lg text-foreground mb-2">
          Drop files here <br /> or
        </p>
        <Button
          ref={triggerButtonRef}
          onClick={triggerFileSelect}
          disabled={uploading}
          className="bg-black text-white hover:bg-foreground"
        >
          Select Files to Upload
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          onChange={handleFileSelection}
        />
        <div className="mt-4 text-sm text-foreground">
          Supported file types <span className="font-medium text-muted-foreground">(max 20MB)</span>:
        </div>
        <div className="text-xs text-muted-foreground">
        .jpg, .jpeg, .png, .pdf, .doc, .docx
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold mb-3">{selectedFiles.length} File(s) Selected</h4>
          <ul className="space-y-3">
            {selectedFiles.map((file, index) => (
              <li
                key={file.name}
                className="flex items-center justify-between gap-4 border p-2 rounded-md bg-card shadow-sm"
              >
                <div className="flex items-center gap-3 w-full">
                  <span className="text-lg">{getFileIcon(file.name)}</span>
                  <span className="text-sm text-foreground truncate">{file.name}</span>
                </div>

                <div className="flex items-center gap-3">
                  {uploading ? (
                    <div className="w-28">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-foreground h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress[file.name] || 0}%` }}
                        />
                      </div>
                    </div>
                  ) : null}
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={uploading}
                    onClick={() => handleFileRemove(index)}
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex justify-end">
            <Button
              className="bg-black text-white hover:bg-foreground"
              onClick={handleUploadAll}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      )}
    </div>
      {/* shadcn AlertDialog for file exists */}
      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>File Already Exists</AlertDialogTitle>
            <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={() => setShowAlert(false)}>OK</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
