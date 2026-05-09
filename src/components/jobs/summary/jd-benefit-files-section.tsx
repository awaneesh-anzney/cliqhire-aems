"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileUploadModal } from "@/components/clients/modals/file-upload-modal";
import { Eye, MoreHorizontal, Download, Upload, File, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";

interface FileData {
  url?: string;
  fileName?: string;
}

interface JDBenefitFilesSectionProps {
  jobDescriptionPdf?: File | FileData | null;
  benefitPdf?: File | FileData | null;
  onFileUpdate: (field: "jobDescriptionPdf" | "benefitPdf", file: File) => Promise<void>;
  canModify?: boolean;
}

export function JDBenefitFilesSection({
  jobDescriptionPdf,
  benefitPdf,
  onFileUpdate,
  canModify,
}: JDBenefitFilesSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [uploadField, setUploadField] = useState<"jobDescriptionPdf" | "benefitPdf" | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const getFileName = (file: File | FileData | null | undefined): string => {
    if (!file) return "No file uploaded";

    // Check if it's a File object (for local uploads)
    if (typeof file === "object" && "name" in file && file.name) {
      return file.name;
    }

    // Check if it's a FileData object (from backend)
    if (typeof file === "object" && "fileName" in file && file.fileName) {
      return file.fileName;
    }

    return "Unknown file";
  };

  const getFileUrl = (file: File | FileData | null | undefined): string | null => {
    if (!file) return null;

    // Check if it's a File object (for local uploads)
    if (typeof file === "object" && "name" in file && file instanceof File) {
      return URL.createObjectURL(file);
    }

    // Check if it's a FileData object (from backend)
    if (typeof file === "object" && "url" in file && file.url) {
      return file.url;
    }

    return null;
  };

  const handlePreview = (file: File | FileData | null | undefined) => {
    const url = getFileUrl(file);
    if (url) {
      window.open(url, "_blank");
    } else {
      toast.error("No file available for preview");
    }
  };

  const handleDownload = (file: File | FileData | null | undefined, fieldName: string) => {
    const url = getFileUrl(file);
    const fileName = getFileName(file);

    if (url && fileName !== "No file uploaded") {
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("File downloaded successfully");
    } else {
      toast.error("No file available for download");
    }
  };

  const handleUploadAgain = (field: "jobDescriptionPdf" | "benefitPdf") => {
    if (!canModify) return;
    setUploadField(field);
    setIsUploadModalOpen(true);
  };

  const handleFileUpload = async (file: File) => {
    if (!uploadField) return;

    try {
      await onFileUpdate(uploadField, file);
      toast.success("File uploaded successfully");
      setIsUploadModalOpen(false);
      setUploadField(null);
    } catch (error) {
      console.error("Upload failed:", error);
      throw error; // Let the modal handle the error display
    }
  };

  const FileRow = ({
    label,
    file,
    field,
  }: {
    label: string;
    file: File | FileData | null | undefined;
    field: "jobDescriptionPdf" | "benefitPdf";
  }) => {
    const fileName = getFileName(file);
    const hasFile = file && fileName !== "No file uploaded";

    return (
      <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
        <div className="flex items-center gap-3">
          <File className="h-5 w-5 text-blue-500" />
          <div>
            <div className="font-medium text-sm">{label}</div>
            <div className="text-sm text-foreground">{fileName}</div>
          </div>
        </div>

        {hasFile && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePreview(file)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleDownload(file, field)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
                {canModify && (
                  <DropdownMenuItem onClick={() => handleUploadAgain(field)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Again
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {!hasFile && canModify && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleUploadAgain(field)}
            className="text-sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        )}
      </div>
    );
  };

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Job Description And Benefit Files</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="text-xs p-1">
              Show Complete Details
              <ChevronsUpDown />
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="space-y-0 mt-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <FileRow
              label="Job Description PDF"
              file={jobDescriptionPdf}
              field="jobDescriptionPdf"
            />
            <FileRow label="Benefit PDF" file={benefitPdf} field="benefitPdf" />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {canModify && (
        <FileUploadModal
          open={isUploadModalOpen}
          onOpenChange={setIsUploadModalOpen}
          onUpload={handleFileUpload}
          title={
            uploadField === "jobDescriptionPdf" ? "Upload Job Description PDF" : "Upload Benefit PDF"
          }
          acceptedFileTypes=".pdf"
          maxSizeInMB={10}
        />
      )}
    </>
  );
}
