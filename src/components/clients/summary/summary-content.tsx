"use client";

import {
  getCountryByCode,
  formatPhoneNumber,
} from "@/lib/countryCodes";
import { SectionHeader } from "./section-header";
import { DetailRow } from "./detail-row";
import { TeamMember } from "./team-member";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { FileUploadRow } from "./file-upload-row";
import { FileUploadModal } from "../modals/file-upload-modal";
import { FileText, Users } from "lucide-react";
import { SalesInfo } from "./sales/salesInfo";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getFileType, ClientDetails, PrimaryContact, TeamMemberType, ContactType } from "./summaryType";
import { api } from "@/lib/axios-config";
import { useQueryClient } from "@tanstack/react-query";
import { PDFViewer } from "@/components/ui/pdf-viewer";
import UserSelectDialog from "@/components/shared/UserSelectDialog";
import { useIndustries } from "@/hooks/useIndustries";
import { IndustrySelector } from "@/components/shared/industry-selector";

export function SummaryContent({
  clientId,
  clientData,
  onTabSwitch,
  canModify = true,
}: {
  clientId: string;
  clientData?: any;
  onTabSwitch?: (tabValue: string) => void;
  canModify?: boolean;
}) {
  const queryClient = useQueryClient();
  const { industries } = useIndustries();

  const [teamMembers, setTeamMembers] = useState<TeamMemberType[]>([
    { name: "Shaswat singh", role: "Admin", email: "shaswat@example.com", isActive: true },
  ]);
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [previewFileUrl, setPreviewFileUrl] = useState("");
  const [previewFileName, setPreviewFileName] = useState("");
  // Removed unused error state

  // File upload modal states
  const [isFileUploadModalOpen, setIsFileUploadModalOpen] = useState(false);
  const [currentUploadField, setCurrentUploadField] = useState<keyof ClientDetails | null>(null);
  const [currentUploadTitle, setCurrentUploadTitle] = useState("");

  // Sales Lead selection dialogs
  const [showSalesLeadDialog, setShowSalesLeadDialog] = useState(false);
  const [showConfirmSalesLead, setShowConfirmSalesLead] = useState(false);
  const [pendingSalesLeadName, setPendingSalesLeadName] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const updateClientDetails = async (
    fieldName: string,
    value: string | string[] | PrimaryContact | { url: string; fileName: string },
  ) => {
    if (!canModify) return;
    try {
      const response = await api.patch(`/api/clients/${clientId}`, { [fieldName]: value });
      // Optimistically update React Query cache
      queryClient.setQueryData(["clientsData", clientId], (old: any) => ({
        ...(old || {}),
        [fieldName]: value,
      }));
      toast.success("Client details updated successfully");
    } catch (error) {
      toast.error("Failed to update client details");
    }
  };

  // Handler for opening file upload modal
  const handleOpenFileUploadModal = (field: keyof ClientDetails, title: string) => {
    if (!canModify) return;
    setCurrentUploadField(field);
    setCurrentUploadTitle(title);
    setIsFileUploadModalOpen(true);
  };

  // Handler for file upload through modal
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
      // Update cache and backend
      await updateClientDetails(currentUploadField, {
        url: fileUrl,
        fileName: file.name,
      });
    } catch (error) {
      console.error(`Error uploading ${currentUploadField}:`, error);
      throw error; // Re-throw to let modal handle the error
    }
  };

  // Legacy handler (kept for backward compatibility if needed)
  const handleFileUpload =
    (field: keyof ClientDetails) =>
      (file: File | null): void => {
        if (!file) return;
        if (!canModify) return;
        (async () => {
          try {
            const formData = new FormData();
            formData.append("file", file); // The file itself
            formData.append("field", field); // The field name (e.g., "vatCopy" or "crCopy")

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

  const handleUpdateField = (field: keyof ClientDetails) => (value: string) => {
    if (!canModify) return;
    updateClientDetails(field, value);
  };

  const handleAddTeamMember = (member: TeamMemberType) => {
    if (!canModify) return;
    setTeamMembers((prev) => [...prev, { ...member, isActive: true }]);
  };

  const handleAddContact = (contact: PrimaryContact) => {
    if (!canModify) return;
    const nextContacts = [...(clientData?.primaryContacts || []), contact];
    updateClientDetails("primaryContacts", nextContacts as unknown as PrimaryContact);
  };

  const handleUpdateDescription = (description: string) => {
    if (!canModify) return;
    updateClientDetails("description", description);
  };

  const handleUpdateContact = (index: number, field: keyof PrimaryContact, value: string) => {
    if (!canModify) return;
    const updated = (clientData?.primaryContacts || []).map((c: any, i: number) =>
      i === index ? { ...c, [field]: value } : c,
    );
    updateClientDetails("primaryContacts", updated as unknown as PrimaryContact);
  };

  const handlePreviewFile = (fileName: string, displayName?: string) => {
    if (!fileName) {
      console.error("No file to preview");
      return;
    }

    const fileUrl = fileName.startsWith("https")
      ? fileName
      : `${API_URL}/${fileName}`;

    const fileType = getFileType(fileName);

    if (fileType === "pdf") {
      // Show PDF in the PDF viewer
      setPreviewFileUrl(fileUrl);
      setPreviewFileName(displayName || fileName);
      setIsPdfPreviewOpen(true);
    } else if (fileType === "docx") {
      // For DOCX files, open in Google Docs viewer in a new tab
      const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
      window.open(googleDocsUrl, "_blank");
    } else {
      // For images and other files, open in new tab
      window.open(fileUrl, "_blank");
    }
  };

  const handleDownloadFile = async (fileName: string) => {
    if (fileName) {
      const fileUrl = fileName.startsWith("https")
        ? fileName
        : `${API_URL}/${fileName}`;
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

  const handleUpdateEmails = (emailsString: string) => {
    const emailsArray = emailsString
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    updateClientDetails("emails", emailsArray);
  };

  const positionOptions = [
    { value: "CEO", label: "CEO" },
    { value: "HR Head", label: "HR Head" },
    { value: "CHRO", label: "CHRO" },
    { value: "HR", label: "HR" },
    { value: "Manager", label: "Manager" },
    { value: "HR Manager", label: "HR Manager" },
    { value: "Director", label: "Director" },
    { value: "Executive", label: "Executive" },
    { value: "General Manager", label: "General Manager" },
  ];

  return (
    <div className="p-2 bg-slate-50/50 rounded-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Engagement & Basic Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md overflow-hidden">
            <div className="flex items-center gap-3 p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="p-2 bg-brand/10 rounded-lg">
                <FileText className="w-4 h-4 text-brand" />
              </div>
              <h4 className="text-base font-semibold text-slate-800">Engagement & Identity</h4>
            </div>
            <div className="p-5 space-y-6">
              <div className="space-y-4">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-2 px-1">Engagement Details</h5>
                <div className="grid grid-cols-1 gap-4 bg-slate-50/30 p-3 rounded-lg border border-slate-100">
                  <DetailRow
                    label="Sales Lead (Internal)"
                    value={clientData?.salesLead}
                    onUpdate={handleUpdateField("salesLead")}
                    disableInternalEdit={!canModify}
                    customEdit={() => {
                      if (!canModify) return;
                      setShowSalesLeadDialog(true);
                    }}
                  />
                  <DetailRow
                    label="Referred By (External)"
                    value={clientData?.referredBy}
                    onUpdate={handleUpdateField("referredBy")}
                    disableInternalEdit={!canModify}
                  />
                  <DetailRow
                    label="Client Priority"
                    value={clientData?.clientPriority}
                    onUpdate={handleUpdateField("clientPriority")}
                    options={[
                      { value: "High", label: "High" },
                      { value: "Medium", label: "Medium" },
                      { value: "Low", label: "Low" },
                    ]}
                    disableInternalEdit={!canModify}
                  />
                  <DetailRow
                    label="Client Segment"
                    value={clientData?.clientSegment}
                    onUpdate={handleUpdateField("clientSegment")}
                    options={[
                      { value: "Silver", label: "Silver" },
                      { value: "Gold", label: "Gold" },
                      { value: "Premium", label: "Premium" },
                    ]}
                    disableInternalEdit={!canModify}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-2 px-1">Basic Information</h5>
                <div className="grid grid-cols-1 gap-4 bg-slate-50/30 p-3 rounded-lg border border-slate-100">
                  <DetailRow
                    label="Client Name"
                    value={clientData?.name}
                    onUpdate={handleUpdateField("name")}
                    disableInternalEdit={!canModify}
                  />
                  <DetailRow
                    label="Client Industry"
                    value={clientData?.industry}
                    onUpdate={handleUpdateField("industry")}
                    disableInternalEdit={true}
                    customInput={
                      <IndustrySelector
                        value={clientData?.industry}
                        onValueChange={handleUpdateField("industry")}
                        disabled={!canModify}
                      />
                    }
                  />
                  <DetailRow
                    label="Client Phone Number"
                    value={clientData?.phoneNumber}
                    formattedValue={formatPhoneNumber(clientData?.phoneNumber, clientData?.countryCode)}
                    onUpdate={handleUpdateField("phoneNumber")}
                    disableInternalEdit={!canModify}
                  />
                  <DetailRow
                    label="Client Email(s)"
                    value={clientData?.emails?.join(", ") || ""}
                    onUpdate={handleUpdateEmails}
                    alwaysShowEdit={true}
                    disableInternalEdit={!canModify}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md overflow-hidden">
            <div className="flex items-center gap-3 p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="p-2 bg-brand/10 rounded-lg">
                <Users className="w-4 h-4 text-brand" />
              </div>
              <h4 className="text-base font-semibold text-slate-800">Primary Contacts</h4>
            </div>
            <div className="p-5 space-y-3">
              {clientData?.primaryContacts?.length > 0 ? (
                clientData.primaryContacts.map((contact: any, index: number) => (
                  <TeamMember
                    key={contact._id || index}
                    name={`${contact.firstName} ${contact.lastName}`}
                    role={contact.designation || contact.position}
                    email={contact.email}
                    phone={contact.phone}
                    countryCode={contact.countryCode}
                  />
                ))
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Primary Contacts</p>
                  <p className="text-[10px] text-slate-400 mt-1">Add contacts in the Contacts tab</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Location & Documents */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md overflow-hidden">
            <div className="flex items-center gap-3 p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="p-2 bg-brand/10 rounded-lg">
                <Users className="w-4 h-4 text-brand" />
              </div>
              <h4 className="text-base font-semibold text-slate-800">Presence & Compliance</h4>
            </div>
            <div className="p-5 space-y-6">
              <div className="space-y-4">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-2 px-1">Online & Location</h5>
                <div className="grid grid-cols-1 gap-4 bg-slate-50/30 p-3 rounded-lg border border-slate-100">
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
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-2 px-1">Compliance Documents</h5>
                <div className="grid grid-cols-1 gap-3">
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
                    onUploadClick={canModify ? () =>
                      handleOpenFileUploadModal("gstTinDocument", "GST TIN Document") : () => { }}
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
        </div>
      </div>



      {/* PDF Viewer */}
      <PDFViewer
        isOpen={isPdfPreviewOpen}
        onClose={() => setIsPdfPreviewOpen(false)}
        pdfUrl={previewFileUrl}
        candidateName={previewFileName}

      />

      {/* File Upload Modal */}
      <FileUploadModal
        open={isFileUploadModalOpen}
        onOpenChange={setIsFileUploadModalOpen}
        onUpload={handleFileUploadFromModal}
        title={currentUploadTitle}
        acceptedFileTypes=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.svg"
        maxSizeInMB={10}
      />

      {/* Sales Lead User Select Dialog */}
      {canModify && (
        <UserSelectDialog
          open={showSalesLeadDialog}
          onClose={() => setShowSalesLeadDialog(false)}
          title="Select Sales Lead"
          onSelect={(user) => {
            const name = user?.name || user?.email || "";
            setPendingSalesLeadName(name || null);
            setShowSalesLeadDialog(false);
            setShowConfirmSalesLead(true);
          }}
        />
      )}

      {/* Confirm Sales Lead Update */}
      <Dialog open={showConfirmSalesLead} onOpenChange={setShowConfirmSalesLead}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Sales Lead</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            {pendingSalesLeadName
              ? `Set "Sales Lead" to ${pendingSalesLeadName}?`
              : "No user selected."}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmSalesLead(false);
                setPendingSalesLeadName(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (pendingSalesLeadName) {
                  await updateClientDetails("salesLead", pendingSalesLeadName);
                }
                setShowConfirmSalesLead(false);
                setPendingSalesLeadName(null);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
