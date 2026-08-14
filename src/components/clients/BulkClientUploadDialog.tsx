import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader, Download, UploadCloud, AlertCircle, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { downloadClientBulkTemplate } from "@/services/clientService";
import { useBulkUploadClients } from "@/hooks/useClient";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BulkClientUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityName?: string;
}

export function BulkClientUploadDialog({
  open,
  onOpenChange,
  entityName = "Clients",
}: BulkClientUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: uploadClients, isPending } = useBulkUploadClients();
  const [uploadResult, setUploadResult] = useState<any>(null);

  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    try {
      const blob = await downloadClientBulkTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Client_Bulk_Upload_Template.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Template downloaded successfully");
    } catch (error) {
      toast.error("Failed to download template.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setUploadResult(null);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    
    uploadClients(file, {
      onSuccess: (data) => {
        setUploadResult(data);
        if (data?.success) {
           toast.success("Upload processed successfully.");
        }
      },
      onError: (error: any) => {
        toast.error(error?.message || "Failed to upload file.");
      }
    });
  };

  const handleDownloadErrorReport = () => {
    if (!uploadResult?.errorReport?.base64) return;
    const { fileName, base64 } = uploadResult.errorReport;
    
    try {
      // Decode base64 to Blob
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "Client_Bulk_Upload_Errors.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error("Failed to download error report.");
    }
  };

  const resetState = () => {
    setFile(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = (open: boolean) => {
    if (!open && !isPending) {
      resetState();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Bulk Upload {entityName}</DialogTitle>
          <DialogDescription>
            Download the template, fill it with your data, and upload it here. Maximum 1000 rows.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {!uploadResult ? (
            <>
              {/* Template Section */}
              <div className="flex flex-col items-center p-6 border-2 border-dashed border-border rounded-xl bg-muted/30">
                <FileSpreadsheet className="h-10 w-10 text-muted-foreground mb-3" />
                <h4 className="text-sm font-semibold mb-1">Step 1: Download Template</h4>
                <p className="text-xs text-center text-muted-foreground mb-4">
                  The template contains the correct columns and dropdown options.
                </p>
                <Button 
                  onClick={handleDownloadTemplate} 
                  disabled={isDownloading || isPending}
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                >
                  {isDownloading ? <Loader className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                  Download Template
                </Button>
              </div>

              {/* Upload Section */}
              <div className="flex flex-col items-center p-6 border-2 border-dashed border-border rounded-xl bg-muted/30">
                <UploadCloud className="h-10 w-10 text-brand mb-3" />
                <h4 className="text-sm font-semibold mb-1">Step 2: Upload Data</h4>
                <p className="text-xs text-center text-muted-foreground mb-4">
                  Select your filled .xlsx or .xls file.
                </p>
                
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                
                {file ? (
                  <div className="flex items-center gap-2 p-2 px-3 bg-card border border-border rounded-lg max-w-full">
                    <FileSpreadsheet className="h-4 w-4 text-green-600 shrink-0" />
                    <span className="text-xs font-medium truncate">{file.name}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="h-6 w-6 p-0 shrink-0 text-muted-foreground hover:text-red-500"
                    >
                      &times;
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={() => fileInputRef.current?.click()} 
                    disabled={isPending}
                    variant="default"
                    size="sm"
                    className="rounded-full"
                  >
                    Select File
                  </Button>
                )}
              </div>
            </>
          ) : (
            /* Result Section */
            <div className="flex flex-col gap-4 animate-in fade-in zoom-in duration-300">
              <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/20">
                <CheckCircle2 className="h-8 w-8 text-green-500 shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm">Processing Complete</h4>
                  <p className="text-xs text-muted-foreground">Processed {uploadResult.totalRows || 0} rows.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-green-50 text-green-700 border border-green-100 rounded-lg flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{uploadResult.inserted || 0}</span>
                  <span className="text-xs font-medium">Inserted</span>
                </div>
                <div className="p-3 bg-red-50 text-red-700 border border-red-100 rounded-lg flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{uploadResult.validationErrors || 0}</span>
                  <span className="text-xs font-medium">Validation Errors</span>
                </div>
                <div className="p-3 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg flex flex-col items-center justify-center">
                  <span className="text-xl font-bold">{uploadResult.skippedInFileDuplicates || 0}</span>
                  <span className="text-[10px] font-medium text-center">In-File Duplicates Skipped</span>
                </div>
                <div className="p-3 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg flex flex-col items-center justify-center">
                  <span className="text-xl font-bold">{uploadResult.skippedDbDuplicates || 0}</span>
                  <span className="text-[10px] font-medium text-center">DB Duplicates Skipped</span>
                </div>
              </div>

              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <div className="mt-2">
                  <h5 className="text-xs font-semibold mb-2 flex items-center gap-1.5 text-red-600">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Errors Summary (showing max 5)
                  </h5>
                  <div className="bg-red-50 border border-red-100 rounded-lg p-3 max-h-32 overflow-y-auto custom-scrollbar">
                    <ul className="text-[11px] space-y-1.5 text-red-800">
                      {uploadResult.errors.slice(0, 5).map((err: any, i: number) => (
                        <li key={i} className="flex gap-2">
                          <span className="font-semibold shrink-0">Row {err.row}:</span>
                          <span>{err.reason} {err.name ? `(${err.name})` : ''}</span>
                        </li>
                      ))}
                      {uploadResult.errors.length > 5 && (
                        <li className="font-semibold italic pt-1">...and {uploadResult.errors.length - 5} more errors.</li>
                      )}
                    </ul>
                  </div>
                  
                  {uploadResult.errorReport?.base64 && (
                    <Button
                      onClick={handleDownloadErrorReport}
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Error Report
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-end gap-2">
          {!uploadResult ? (
            <>
              <Button variant="outline" onClick={() => handleClose(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpload} 
                disabled={!file || isPending}
                className="bg-brand hover:bg-brand/90 text-white"
              >
                {isPending ? <Loader className="h-4 w-4 animate-spin mr-2" /> : <UploadCloud className="h-4 w-4 mr-2" />}
                Upload
              </Button>
            </>
          ) : (
            <Button onClick={() => handleClose(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
