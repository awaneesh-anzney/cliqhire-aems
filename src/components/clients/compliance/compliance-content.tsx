"use client";

import { FileUploadRow } from "../summary/file-upload-row";
import { FileUploadModal } from "../modals/file-upload-modal";
import { DetailRow } from "../summary/detail-row";
import { Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/axios-config";
import { useQueryClient } from "@tanstack/react-query";
import { PDFViewer } from "@/components/ui/pdf-viewer";
import { getFileType, ClientDetails } from "../summary/summaryType";

export function ComplianceContent({
  clientId,
  clientData,
  canModify = true,
}: {
  clientId: string;
  clientData?: any;
  canModify?: boolean;
}) {
  const queryClient = useQueryClient();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [previewFileUrl, setPreviewFileUrl] = useState("");
  const [previewFileName, setPreviewFileName] = useState("");

  // File upload modal states
  const [isFileUploadModalOpen, setIsFileUploadModalOpen] = useState(false);
  const [currentUploadField, setCurrentUploadField] = useState<keyof ClientDetails | null>(null);
  const [currentUploadTitle, setCurrentUploadTitle] = useState("");

  const updateClientDetails = async (
    fieldName: string,
    value: string | { url: string; fileName: string }
  ) => {
    if (!canModify) return;
    try {
      await api.patch(`/api/clients/${clientId}`, { [fieldName]: value });
      queryClient.setQueryData(["clientsData", clientId], (old: any) => ({
        ...(old || {}),
        [fieldName]: value,
      }));
      toast.success("Client details updated successfully");
    } catch (error) {
      toast.error("Failed to update client details");
    }
  };

  const handleUpdateField = (field: keyof ClientDetails) => (value: string) => {
    if (!canModify) return;
    updateClientDetails(field, value);
  };

  const handleOpenFileUploadModal = (field: keyof ClientDetails, title: string) => {
    if (!canModify) return;
    setCurrentUploadField(field);
    setCurrentUploadTitle(title);
    setIsFileUploadModalOpen(true);
  };

  const handleFileUploadFromModal = async (file: File): Promise<void> => {
    if (!canModify) return;
    if (!currentUploadField || !file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("field", currentUploadField);

      const response = await api.post(`/api/clients/${clientId}/upload`, formData);
      const result = response.data;
      const fileUrl = result.data?.filePath || file.name;
      await updateClientDetails(currentUploadField, {
        url: fileUrl,
        fileName: file.name,
      });
    } catch (error) {
      console.error(`Error uploading ${currentUploadField}:`, error);
      throw error;
    }
  };

  const handleFileUpload = (field: keyof ClientDetails) => (file: File | null): void => {
    if (!file) return;
    if (!canModify) return;
    (async () => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("field", field);

        const response = await api.post(`/api/clients/${clientId}/upload`, formData);
        const result = response.data;
        const fileUrl = result.data?.filePath || file.name;
        toast.success("File uploaded successfully");

        await updateClientDetails(field, fileUrl);
      } catch (error) {
        console.error(`Error uploading ${field}:`, error);
        toast.error("Failed to upload file");
      }
    })();
  };

  const handlePreviewFile = (fileName: string, displayName?: string) => {
    if (!fileName) {
      console.error("No file to preview");
      return;
    }

    const fileUrl = fileName.startsWith("https") ? fileName : `${API_URL}/${fileName}`;
    const fileType = getFileType(fileName);

    if (fileType === "pdf") {
      setPreviewFileUrl(fileUrl);
      setPreviewFileName(displayName || fileName);
      setIsPdfPreviewOpen(true);
    } else if (fileType === "docx") {
      const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
      window.open(googleDocsUrl, "_blank");
    } else {
      window.open(fileUrl, "_blank");
    }
  };

  const handleDownloadFile = async (fileName: string) => {
    if (fileName) {
      const fileUrl = fileName.startsWith("https") ? fileName : `${API_URL}/${fileName}`;
      try {
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error("Network response was not ok.");
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName.split("/").pop() || "download");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Download failed:", error);
        window.open(fileUrl, "_blank");
      }
    } else {
      console.error("No file to download");
    }
  };

  return (
    <div className="p-2 bg-muted/50 rounded-2xl">
      <div className="bg-card rounded-xl border border-border shadow-sm transition-all hover:shadow-md overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-border bg-muted/50">
          <div className="p-2 bg-brand/10 rounded-lg">
            <Users className="w-4 h-4 text-brand" />
          </div>
          <h4 className="text-base font-semibold text-foreground">Presence & Compliance</h4>
        </div>
        <div className="p-5 space-y-6">
          <div className="space-y-4">
            <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em] mb-2 px-1">Online & Location</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-3 rounded-lg border border-border">
              <DetailRow
                label="Client Website"
                value={clientData?.website}
                onUpdate={handleUpdateField("website")}
                disableInternalEdit={!canModify}
              />
              <DetailRow
                label="LinkedIn Profile"
                value={clientData?.linkedInProfile}
                onUpdate={handleUpdateField("linkedInProfile")}
                optional
                disableInternalEdit={!canModify}
              />
              <DetailRow
                label="Google Maps"
                value={clientData?.googleMapsLink}
                onUpdate={handleUpdateField("googleMapsLink")}
                disableInternalEdit={!canModify}
              />
              <DetailRow
                label="Location"
                value={clientData?.location}
                onUpdate={handleUpdateField("location")}
                disableInternalEdit={!canModify}
              />
              <DetailRow
                label="Address"
                value={clientData?.address}
                onUpdate={handleUpdateField("address")}
                disableInternalEdit={!canModify}
                isLocation={false}
              />
              <DetailRow
                label="Country of Business"
                value={clientData?.countryOfBusiness}
                onUpdate={handleUpdateField("countryOfBusiness")}
                disableInternalEdit={!canModify}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em] mb-2 px-1">Compliance Documents</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <FileUploadRow
                id="vat-copy-upload"
                label="VAT Copy"
                onFileSelect={canModify ? handleFileUpload("vatCopy") : () => { }}
                onUploadClick={canModify ? () => handleOpenFileUploadModal("vatCopy", "VAT Copy") : () => { }}
                docUrl={clientData?.vatCopy?.url}
                currentFileName={clientData?.vatCopy?.fileName}
                onPreview={() =>
                  handlePreviewFile(
                    clientData?.vatCopy?.url || "",
                    clientData?.vatCopy?.fileName,
                  )
                }
                onDownload={() => handleDownloadFile(clientData?.vatCopy?.url || "")}
              />
              <FileUploadRow
                id="cr-copy-upload"
                label="CR Copy"
                onFileSelect={canModify ? handleFileUpload("crCopy") : () => { }}
                onUploadClick={canModify ? () => handleOpenFileUploadModal("crCopy", "CR Copy") : () => { }}
                docUrl={clientData?.crCopy?.url}
                currentFileName={clientData?.crCopy?.fileName}
                onPreview={() =>
                  handlePreviewFile(
                    clientData?.crCopy?.url || "",
                    clientData?.crCopy?.fileName,
                  )
                }
                onDownload={() => handleDownloadFile(clientData?.crCopy?.url || "")}
              />
              <FileUploadRow
                id="gst-tin-document-upload"
                label="GST IN Doc"
                onFileSelect={canModify ? handleFileUpload("gstTinDocument") : () => { }}
                onUploadClick={canModify ? () => handleOpenFileUploadModal("gstTinDocument", "GST TIN Document") : () => { }}
                docUrl={clientData?.gstTinDocument?.url}
                currentFileName={clientData?.gstTinDocument?.fileName}
                onPreview={() =>
                  handlePreviewFile(
                    clientData?.gstTinDocument?.url || "",
                    clientData?.gstTinDocument?.fileName,
                  )
                }
                onDownload={() => handleDownloadFile(clientData?.gstTinDocument?.url || "")}
              />
            </div>
          </div>
        </div>
      </div>

      <PDFViewer
        isOpen={isPdfPreviewOpen}
        onClose={() => setIsPdfPreviewOpen(false)}
        pdfUrl={previewFileUrl}
        candidateName={previewFileName}
      />

      <FileUploadModal
        open={isFileUploadModalOpen}
        onOpenChange={setIsFileUploadModalOpen}
        onUpload={handleFileUploadFromModal}
        title={currentUploadTitle}
        acceptedFileTypes=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.svg"
        maxSizeInMB={10}
      />
    </div>
  );
}
