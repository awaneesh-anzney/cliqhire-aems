"use client";

import {
  getCountryByCode,
} from "@/lib/countryCodes";
import { DetailRow } from "./detail-row";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { FileUploadRow } from "./file-upload-row";
import { FileUploadModal } from "../modals/file-upload-modal";
import {
  FileText,
  Users,
  Building2,
  Globe,
  ShieldCheck,
  Briefcase,
  Layers,
  MapPin,
  Clock,
  Sparkles,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getFileType, ClientDetails, PrimaryContact, TeamMemberType } from "./summaryType";
import { api } from "@/lib/axios-config";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { PDFViewer } from "@/components/ui/pdf-viewer";
import UserSelectDialog from "@/components/shared/UserSelectDialog";
import { useIndustries } from "@/hooks/useIndustries";
import { IndustrySelector } from "@/components/shared/industry-selector";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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

  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [previewFileUrl, setPreviewFileUrl] = useState("");
  const [previewFileName, setPreviewFileName] = useState("");

  // File upload modal states
  const [isFileUploadModalOpen, setIsFileUploadModalOpen] = useState(false);
  const [currentUploadField, setCurrentUploadField] = useState<keyof ClientDetails | null>(null);
  const [currentUploadTitle, setCurrentUploadTitle] = useState("");

  // Sales Lead selection dialogs
  const [showSalesLeadDialog, setShowSalesLeadDialog] = useState(false);
  const [showConfirmSalesLead, setShowConfirmSalesLead] = useState(false);
  const [pendingSalesLeadName, setPendingSalesLeadName] = useState<string | null>(null);

  // Referred By selection dialogs
  const [showReferredByDialog, setShowReferredByDialog] = useState(false);
  const [showConfirmReferredBy, setShowConfirmReferredBy] = useState(false);
  const [pendingReferredByName, setPendingReferredByName] = useState<string | null>(null);

  // Client Source edit dialog
  const [showClientSourceDialog, setShowClientSourceDialog] = useState(false);
  const [editClientSource, setEditClientSource] = useState<string>("");
  const [editClientSourceDetails, setEditClientSourceDetails] = useState<any>({});

  // Client Group edit dialog
  const [showClientGroupDialog, setShowClientGroupDialog] = useState(false);
  const [groupSearchQuery, setGroupSearchQuery] = useState("");
  const { data: groupSearchResults, isLoading: isGroupSearchLoading } = useQuery({
    queryKey: ["clientGroups", groupSearchQuery],
    queryFn: async () => {
      const res = await api.get(`/api/client-groups`, { params: { search: groupSearchQuery, limit: 10 } });
      return res.data?.data || [];
    },
    enabled: showClientGroupDialog,
  });

  // Line of Business edit dialog
  const [showLineOfBusinessDialog, setShowLineOfBusinessDialog] = useState(false);
  const [editLineOfBusiness, setEditLineOfBusiness] = useState<string[]>([]);
  const LINE_OF_BUSINESS_OPTIONS = [
    "Recruitment",
    "HR Managed Services",
    "IT & Technology",
    "Mgt Consulting",
    "HR Consulting",
    "Outsourcing",
  ];

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const updateClientDetails = async (
    fieldName: string,
    value: string | string[] | PrimaryContact | { url: string; fileName: string },
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

  const updateClientFields = async (updates: Record<string, any>) => {
    if (!canModify) return;
    try {
      await api.patch(`/api/clients/${clientId}`, updates);
      queryClient.setQueryData(["clientsData", clientId], (old: any) => ({
        ...(old || {}),
        ...updates,
      }));
      toast.success("Client details updated successfully");
    } catch (error) {
      toast.error("Failed to update client details");
    }
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

  const handleFileUpload =
    (field: keyof ClientDetails) =>
      (file: File | null): void => {
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

  const handleUpdateField = (field: keyof ClientDetails) => (value: any) => {
    if (!canModify) return;
    if (typeof value === "object" && value !== null && "phone" in value) {
      updateClientFields({ phoneNumber: value.phone, countryCode: value.countryCode });
    } else {
      updateClientDetails(field, value as string);
    }
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

  // Helper values
  const priority = clientData?.clientPriority || "Not Set";
  const segment = clientData?.clientSegment || "Standard";
  const industry = clientData?.industry || "Not Specified";
  const source = clientData?.clientSource || "Direct";
  const salesLead = clientData?.salesLead || "Unassigned";

  return (
    <div className="space-y-4">
      {/* Top Executive KPI Highlight Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        <div className="bg-card p-3 rounded-xl border border-border/70 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Priority</span>
            <Sparkles className="h-3.5 w-3.5 text-brand" />
          </div>
          <div className="mt-1">
            <Badge
              variant="outline"
              className={cn(
                "font-semibold text-xs",
                priority.toLowerCase() === "high" && "bg-rose-500/10 text-rose-600 border-rose-500/20",
                priority.toLowerCase() === "medium" && "bg-amber-500/10 text-amber-600 border-amber-500/20",
                priority.toLowerCase() === "low" && "bg-slate-500/10 text-slate-600 border-slate-500/20",
              )}
            >
              {priority}
            </Badge>
          </div>
        </div>

        <div className="bg-card p-3 rounded-xl border border-border/70 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Segment</span>
            <Layers className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="mt-1">
            <span className="text-xs font-bold text-foreground">{segment}</span>
          </div>
        </div>

        <div className="bg-card p-3 rounded-xl border border-border/70 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Industry</span>
            <Building2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-1">
            <span className="text-xs font-bold text-foreground truncate block" title={industry}>
              {industry}
            </span>
          </div>
        </div>

        <div className="bg-card p-3 rounded-xl border border-border/70 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Source</span>
            <Briefcase className="h-3.5 w-3.5 text-indigo-500" />
          </div>
          <div className="mt-1">
            <span className="text-xs font-bold text-foreground truncate block" title={source}>
              {source}
            </span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-card p-3 rounded-xl border border-border/70 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Sales Lead</span>
            <Users className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <div className="mt-1">
            <span className="text-xs font-bold text-foreground truncate block" title={salesLead}>
              {salesLead}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column: Engagement & Classification */}
        <div className="space-y-4">
          {/* Card 1: Engagement Details */}
          <div className="bg-card rounded-xl border border-border/70 shadow-2xs overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/30">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <FileText className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Engagement & Source
                </h3>
              </div>
            </div>

            <div className="p-2 divide-y divide-border/40">
              <DetailRow
                label="Sales Lead (Internal)"
                value={clientData?.salesLead}
                onUpdate={handleUpdateField("salesLead")}
                disableInternalEdit={!canModify}
                customEdit={() => canModify && setShowSalesLeadDialog(true)}
              />
              <DetailRow
                label="Referred By (External)"
                value={clientData?.referredBy}
                onUpdate={handleUpdateField("referredBy")}
                disableInternalEdit={!canModify}
                customEdit={() => canModify && setShowReferredByDialog(true)}
              />
              <DetailRow
                label="Client Source"
                value={clientData?.clientSource}
                onUpdate={() => {}}
                disableInternalEdit={!canModify}
                customEdit={() => {
                  if (canModify) {
                    setEditClientSource(clientData?.clientSource || "");
                    setEditClientSourceDetails(clientData?.clientSourceDetails || {});
                    setShowClientSourceDialog(true);
                  }
                }}
              />
              {clientData?.clientSource === "Cold Call" && clientData?.clientSourceDetails?.date && (
                <DetailRow
                  label="Cold Call Date"
                  value={new Date(clientData.clientSourceDetails.date).toLocaleDateString()}
                  onUpdate={() => {}}
                  disableInternalEdit={!canModify}
                  customEdit={() => {
                    if (canModify) {
                      setEditClientSource(clientData?.clientSource || "");
                      setEditClientSourceDetails(clientData?.clientSourceDetails || {});
                      setShowClientSourceDialog(true);
                    }
                  }}
                />
              )}
              {clientData?.clientSource === "Events" && (
                <>
                  {clientData?.clientSourceDetails?.eventName && (
                    <DetailRow
                      label="Event Name"
                      value={clientData.clientSourceDetails.eventName}
                      onUpdate={() => {}}
                      disableInternalEdit={!canModify}
                      customEdit={() => {
                        if (canModify) {
                          setEditClientSource(clientData?.clientSource || "");
                          setEditClientSourceDetails(clientData?.clientSourceDetails || {});
                          setShowClientSourceDialog(true);
                        }
                      }}
                    />
                  )}
                  {clientData?.clientSourceDetails?.eventDate && (
                    <DetailRow
                      label="Event Date"
                      value={new Date(clientData.clientSourceDetails.eventDate).toLocaleDateString()}
                      onUpdate={() => {}}
                      disableInternalEdit={!canModify}
                      customEdit={() => {
                        if (canModify) {
                          setEditClientSource(clientData?.clientSource || "");
                          setEditClientSourceDetails(clientData?.clientSourceDetails || {});
                          setShowClientSourceDialog(true);
                        }
                      }}
                    />
                  )}
                  {clientData?.clientSourceDetails?.eventLocation && (
                    <DetailRow
                      label="Event Location"
                      value={clientData.clientSourceDetails.eventLocation}
                      onUpdate={() => {}}
                      disableInternalEdit={!canModify}
                      customEdit={() => {
                        if (canModify) {
                          setEditClientSource(clientData?.clientSource || "");
                          setEditClientSourceDetails(clientData?.clientSourceDetails || {});
                          setShowClientSourceDialog(true);
                        }
                      }}
                    />
                  )}
                </>
              )}
              {clientData?.clientSource === "Others" && clientData?.clientSourceDetails?.notes && (
                <DetailRow
                  label="Source Notes"
                  value={clientData.clientSourceDetails.notes}
                  onUpdate={() => {}}
                  disableInternalEdit={!canModify}
                  customEdit={() => {
                    if (canModify) {
                      setEditClientSource(clientData?.clientSource || "");
                      setEditClientSourceDetails(clientData?.clientSourceDetails || {});
                      setShowClientSourceDialog(true);
                    }
                  }}
                />
              )}
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

          {/* Card 2: Company Profile */}
          <div className="bg-card rounded-xl border border-border/70 shadow-2xs overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/30">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Building2 className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Company Profile & Classification
                </h3>
              </div>
            </div>

            <div className="p-2 divide-y divide-border/40">
              <DetailRow
                label="Client Name"
                value={clientData?.name}
                onUpdate={handleUpdateField("name")}
                disableInternalEdit={!canModify}
              />
              <DetailRow
                label="Client Group"
                value={clientData?.group?.name || ""}
                onUpdate={() => {}}
                disableInternalEdit={!canModify}
                customEdit={() => {
                  if (canModify) {
                    setGroupSearchQuery("");
                    setShowClientGroupDialog(true);
                  }
                }}
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
                label="Line of Business"
                value={
                  Array.isArray(clientData?.lineOfBusiness)
                    ? clientData.lineOfBusiness.join(", ")
                    : clientData?.lineOfBusiness || ""
                }
                formattedValue={
                  Array.isArray(clientData?.lineOfBusiness)
                    ? clientData.lineOfBusiness.join(", ")
                    : clientData?.lineOfBusiness || ""
                }
                onUpdate={() => {}}
                disableInternalEdit={!canModify}
                customEdit={() => {
                  if (canModify) {
                    const current = Array.isArray(clientData?.lineOfBusiness)
                      ? clientData.lineOfBusiness
                      : typeof clientData?.lineOfBusiness === "string" && clientData.lineOfBusiness
                        ? clientData.lineOfBusiness.split(",").map((s: string) => s.trim()).filter(Boolean)
                        : [];
                    setEditLineOfBusiness(current);
                    setShowLineOfBusinessDialog(true);
                  }
                }}
              />
              <DetailRow
                label="Client Phone Number"
                value={clientData?.phoneNumber}
                formattedValue={
                  clientData?.countryCode && clientData?.phoneNumber
                    ? `${clientData.countryCode}-${clientData.phoneNumber}`
                    : clientData?.phoneNumber
                }
                onUpdate={handleUpdateField("phoneNumber")}
                disableInternalEdit={!canModify}
                isPhone={true}
                countryCode={clientData?.countryCode || "+966"}
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

        {/* Right Column: Online Presence & Compliance Documents */}
        <div className="space-y-4">
          {/* Card 3: Online & Location Presence */}
          <div className="bg-card rounded-xl border border-border/70 shadow-2xs overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/30">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <Globe className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Online & Location Presence
                </h3>
              </div>
            </div>

            <div className="p-2 divide-y divide-border/40">
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

          {/* Card 4: Compliance Documents */}
          <div className="bg-card rounded-xl border border-border/70 shadow-2xs overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/30">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Compliance & Legal Documents
                </h3>
              </div>
              <span className="text-[11px] text-muted-foreground font-medium">
                4 Required Documents
              </span>
            </div>

            <div className="p-3 space-y-2.5">
              <FileUploadRow
                id="vat-copy-upload"
                label="VAT Copy"
                onFileSelect={canModify ? handleFileUpload("vatCopy") : () => {}}
                onUploadClick={canModify ? () => handleOpenFileUploadModal("vatCopy", "VAT Copy") : () => {}}
                docUrl={clientData?.vatCopy?.url}
                currentFileName={clientData?.vatCopy?.fileName}
                onPreview={() => handlePreviewFile(clientData?.vatCopy?.url || "", clientData?.vatCopy?.fileName)}
                onDownload={() => handleDownloadFile(clientData?.vatCopy?.url || "")}
              />
              <FileUploadRow
                id="cr-copy-upload"
                label="CR Copy"
                onFileSelect={canModify ? handleFileUpload("crCopy") : () => {}}
                onUploadClick={canModify ? () => handleOpenFileUploadModal("crCopy", "CR Copy") : () => {}}
                docUrl={clientData?.crCopy?.url}
                currentFileName={clientData?.crCopy?.fileName}
                onPreview={() => handlePreviewFile(clientData?.crCopy?.url || "", clientData?.crCopy?.fileName)}
                onDownload={() => handleDownloadFile(clientData?.crCopy?.url || "")}
              />
              <FileUploadRow
                id="gst-tin-document-upload"
                label="GST TIN Document"
                onFileSelect={canModify ? handleFileUpload("gstTinDocument") : () => {}}
                onUploadClick={canModify ? () => handleOpenFileUploadModal("gstTinDocument", "GST TIN Document") : () => {}}
                docUrl={clientData?.gstTinDocument?.url}
                currentFileName={clientData?.gstTinDocument?.fileName}
                onPreview={() => handlePreviewFile(clientData?.gstTinDocument?.url || "", clientData?.gstTinDocument?.fileName)}
                onDownload={() => handleDownloadFile(clientData?.gstTinDocument?.url || "")}
              />
              <FileUploadRow
                id="national-address-cert-upload"
                label="National Address Certificate"
                onFileSelect={canModify ? handleFileUpload("nationalAddressCertificate") : () => {}}
                onUploadClick={canModify ? () => handleOpenFileUploadModal("nationalAddressCertificate", "National Address Certificate") : () => {}}
                docUrl={clientData?.nationalAddressCertificate?.url}
                currentFileName={clientData?.nationalAddressCertificate?.fileName}
                onPreview={() => handlePreviewFile(clientData?.nationalAddressCertificate?.url || "", clientData?.nationalAddressCertificate?.fileName)}
                onDownload={() => handleDownloadFile(clientData?.nationalAddressCertificate?.url || "")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals & Dialogs */}
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

      {/* Sales Lead Dialog */}
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

      <Dialog open={showConfirmSalesLead} onOpenChange={setShowConfirmSalesLead}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Sales Lead</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground py-2">
            {pendingSalesLeadName ? `Set "Sales Lead" to ${pendingSalesLeadName}?` : "No user selected."}
          </div>
          <DialogFooter className="gap-2">
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

      {/* Referred By Dialog */}
      {canModify && (
        <UserSelectDialog
          open={showReferredByDialog}
          onClose={() => setShowReferredByDialog(false)}
          title="Select Referral Source"
          onSelect={(user) => {
            const name = user?.name || user?.email || "";
            setPendingReferredByName(name || null);
            setShowReferredByDialog(false);
            setShowConfirmReferredBy(true);
          }}
        />
      )}

      <Dialog open={showConfirmReferredBy} onOpenChange={setShowConfirmReferredBy}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Referral Source</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground py-2">
            {pendingReferredByName ? `Set "Referred By (External)" to ${pendingReferredByName}?` : "No user selected."}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmReferredBy(false);
                setPendingReferredByName(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (pendingReferredByName) {
                  await updateClientDetails("referredBy", pendingReferredByName);
                }
                setShowConfirmReferredBy(false);
                setPendingReferredByName(null);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Client Source Edit Dialog */}
      {canModify && (
        <Dialog open={showClientSourceDialog} onOpenChange={setShowClientSourceDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Client Source</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Client Source</Label>
                <Select
                  value={editClientSource}
                  onValueChange={(val) => {
                    setEditClientSource(val);
                    setEditClientSourceDetails({});
                  }}
                >
                  <SelectTrigger className="h-10 rounded-lg bg-background border-border">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cold Call">Cold Call</SelectItem>
                    <SelectItem value="Reference">Reference</SelectItem>
                    <SelectItem value="Events">Events</SelectItem>
                    <SelectItem value="Existing Old Client">Existing Old Client</SelectItem>
                    <SelectItem value="Others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editClientSource === "Cold Call" && (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cold Call Date</Label>
                  <Input
                    type="date"
                    value={editClientSourceDetails?.date ? new Date(editClientSourceDetails.date).toISOString().split("T")[0] : ""}
                    onChange={(e) => setEditClientSourceDetails({ ...editClientSourceDetails, date: e.target.value })}
                    className="h-10 rounded-lg bg-background border-border"
                  />
                </div>
              )}

              {editClientSource === "Events" && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Event Name</Label>
                    <Input
                      value={editClientSourceDetails?.eventName || ""}
                      onChange={(e) => setEditClientSourceDetails({ ...editClientSourceDetails, eventName: e.target.value })}
                      className="h-10 rounded-lg bg-background border-border"
                      placeholder="e.g. GITEX Dubai 2026"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Event Date</Label>
                    <Input
                      type="date"
                      value={editClientSourceDetails?.eventDate ? new Date(editClientSourceDetails.eventDate).toISOString().split("T")[0] : ""}
                      onChange={(e) => setEditClientSourceDetails({ ...editClientSourceDetails, eventDate: e.target.value })}
                      className="h-10 rounded-lg bg-background border-border"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Event Location</Label>
                    <Input
                      value={editClientSourceDetails?.eventLocation || ""}
                      onChange={(e) => setEditClientSourceDetails({ ...editClientSourceDetails, eventLocation: e.target.value })}
                      className="h-10 rounded-lg bg-background border-border"
                      placeholder="e.g. Dubai World Trade Centre"
                    />
                  </div>
                </>
              )}

              {editClientSource === "Others" && (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes</Label>
                  <Textarea
                    value={editClientSourceDetails?.notes || ""}
                    onChange={(e) => setEditClientSourceDetails({ ...editClientSourceDetails, notes: e.target.value })}
                    className="rounded-lg bg-background border-border min-h-[50px]"
                    placeholder="Enter additional source notes..."
                  />
                </div>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowClientSourceDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (!canModify) return;
                  try {
                    const payload = {
                      clientSource: editClientSource,
                      clientSourceDetails: editClientSourceDetails,
                    };
                    await api.patch(`/api/clients/${clientId}`, payload);
                    queryClient.setQueryData(["clientsData", clientId], (old: any) => ({
                      ...(old || {}),
                      ...payload,
                    }));
                    toast.success("Client source updated successfully");
                    setShowClientSourceDialog(false);
                  } catch (error) {
                    toast.error("Failed to update client source");
                  }
                }}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Client Group Dialog */}
      {canModify && (
        <Dialog open={showClientGroupDialog} onOpenChange={setShowClientGroupDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Select Client Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search groups..."
                  value={groupSearchQuery}
                  onChange={(e) => setGroupSearchQuery(e.target.value)}
                  className="pl-9 h-10"
                />
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1.5">
                {isGroupSearchLoading ? (
                  <div className="text-sm text-muted-foreground text-center py-4">Searching...</div>
                ) : groupSearchResults?.length > 0 ? (
                  groupSearchResults.map((group: any) => (
                    <div
                      key={group._id}
                      className="flex flex-col p-2.5 hover:bg-muted/70 rounded-lg cursor-pointer border border-transparent hover:border-border/60 transition-colors"
                      onClick={async () => {
                        try {
                          await api.patch(`/api/clients/${clientId}/link-group`, { groupId: group._id });
                          queryClient.setQueryData(["clientsData", clientId], (old: any) => ({
                            ...(old || {}),
                            groupId: group._id,
                            group: { _id: group._id, name: group.name },
                          }));
                          toast.success(`Client added to group ${group.name}`);
                          setShowClientGroupDialog(false);
                        } catch (error) {
                          toast.error("Failed to link client group");
                        }
                      }}
                    >
                      <span className="font-semibold text-sm text-foreground">{group.name}</span>
                      {group.groupCode && <span className="text-xs text-muted-foreground">{group.groupCode}</span>}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">No groups found.</div>
                )}
              </div>
              {clientData?.groupId && (
                <Button
                  variant="destructive"
                  className="w-full mt-2"
                  onClick={async () => {
                    try {
                      await api.patch(`/api/clients/${clientId}/link-group`, { groupId: null });
                      queryClient.setQueryData(["clientsData", clientId], (old: any) => {
                        const newData = { ...old };
                        delete newData.groupId;
                        delete newData.group;
                        return newData;
                      });
                      toast.success("Client removed from group");
                      setShowClientGroupDialog(false);
                    } catch (error) {
                      toast.error("Failed to unlink client group");
                    }
                  }}
                >
                  Unlink From Group
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Line of Business Dialog */}
      <Dialog open={showLineOfBusinessDialog} onOpenChange={setShowLineOfBusinessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Line of Business</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-3">
            <p className="text-xs text-muted-foreground mb-2">Select the line(s) of business applicable:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
              {LINE_OF_BUSINESS_OPTIONS.map((option) => {
                const isSelected = editLineOfBusiness.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setEditLineOfBusiness((prev) =>
                        prev.includes(option) ? prev.filter((x) => x !== option) : [...prev, option],
                      );
                    }}
                    className={cn(
                      "flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-semibold text-left transition-all",
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/70 hover:bg-muted/50 text-foreground",
                    )}
                  >
                    <div
                      className={cn(
                        "h-4 w-4 rounded-md flex items-center justify-center border text-[10px] font-bold shrink-0",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/40",
                      )}
                    >
                      {isSelected && "✓"}
                    </div>
                    <span className="truncate">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLineOfBusinessDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await updateClientDetails("lineOfBusiness", editLineOfBusiness);
                setShowLineOfBusinessDialog(false);
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
