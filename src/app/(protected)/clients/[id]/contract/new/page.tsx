"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MuiButton from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import PostAddOutlinedIcon from "@mui/icons-material/PostAddOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";

import { useClientById } from "@/hooks/useClient";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/contexts/PermissionContext";
import { useClientContracts } from "@/hooks/useClientContracts";
import { ClientContractInfo } from "@/components/create-client-modal/type";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import BusinessForm from "@/components/contract-forms/business-form";
import ConsultingForm from "@/components/contract-forms/consulting-form";
import OutsourcingForm from "@/components/contract-forms/outsourcing-form";
import {
  businessInitialState,
  consultingInitialState,
  outsourcingInitialState,
} from "@/components/create-client-modal/constants";

interface PageProps {
  params: { id: string };
}

const CONTRACT_MAPPING: Record<string, string> = {
  Recruitment: "businessContractRQT",
  "HR Managed Services": "businessContractHMS",
  "IT & Technology": "businessContractIT",
  "Mgt Consulting": "consultingContractMGTC",
  "HR Consulting": "consultingContractHRC",
  Outsourcing: "outsourcingContract",
};

const BUSINESS_OPTIONS = [
  {
    name: "Recruitment",
    category: "Talent Acquisition",
    icon: PeopleAltOutlinedIcon,
    description: "Standard & executive placement contract terms and fee structure",
    bgColor: "bg-blue-500/10",
    color: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-500/30",
  },
  {
    name: "HR Managed Services",
    category: "Managed HR",
    icon: VerifiedUserOutlinedIcon,
    description: "End-to-end HR operations management and dedicated service SLAs",
    bgColor: "bg-indigo-500/10",
    color: "text-indigo-600 dark:text-indigo-400",
    borderColor: "border-indigo-500/30",
  },
  {
    name: "IT & Technology",
    category: "Tech Hiring",
    icon: CodeOutlinedIcon,
    description: "Specialized engineering recruitment & technology staffing agreements",
    bgColor: "bg-purple-500/10",
    color: "text-purple-600 dark:text-purple-400",
    borderColor: "border-purple-500/30",
  },
  {
    name: "Mgt Consulting",
    category: "Advisory",
    icon: WorkOutlineOutlinedIcon,
    description: "Strategic management consulting, proposal documents & project scope",
    bgColor: "bg-emerald-500/10",
    color: "text-emerald-600 dark:text-emerald-400",
    borderColor: "border-emerald-500/30",
  },
  {
    name: "HR Consulting",
    category: "Advisory",
    icon: PersonSearchOutlinedIcon,
    description: "Human resources advisory, technical & financial proposal agreements",
    bgColor: "bg-teal-500/10",
    color: "text-teal-600 dark:text-teal-400",
    borderColor: "border-teal-500/30",
  },
  {
    name: "Outsourcing",
    category: "Staffing",
    icon: ApartmentOutlinedIcon,
    description: "Resource allocation, SLA service guarantees & monthly staffing costs",
    bgColor: "bg-amber-500/10",
    color: "text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-500/30",
  },
];

export default function NewContractPage({ params }: PageProps) {
  const { id } = params;
  const router = useRouter();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();

  const isAdmin = user?.role === "ADMIN";
  const canModifyClients =
    isAdmin ||
    hasPermission("clients", "create") ||
    hasPermission("clients", "edit");

  const { data: client, isLoading, isError } = useClientById(id);
  const { addContractMutation } = useClientContracts(id);
  const isAddingContract = addContractMutation.isPending;

  const [addContractFormData, setAddContractFormData] =
    useState<ClientContractInfo>({
      lineOfBusiness: [],
      contractForms: {},
    });

  const handleBusinessCheckChange = (business: string, checked: boolean) => {
    setAddContractFormData((prev) => {
      const currentLob = prev.lineOfBusiness || [];
      if (checked) {
        let initialState: any = {};
        if (
          ["Recruitment", "HR Managed Services", "IT & Technology"].includes(business)
        ) {
          initialState = { ...businessInitialState };
        } else if (
          ["HR Consulting", "Mgt Consulting"].includes(business)
        ) {
          initialState = { ...consultingInitialState };
        } else if (business === "Outsourcing") {
          initialState = { ...outsourcingInitialState };
        }

        return {
          ...prev,
          lineOfBusiness: [...currentLob, business],
          contractForms: {
            ...prev.contractForms,
            [business]: initialState,
          },
        };
      } else {
        const newLob = currentLob.filter((b) => b !== business);
        const newForms = { ...prev.contractForms };
        delete newForms[business];
        return {
          ...prev,
          lineOfBusiness: newLob,
          contractForms: newForms,
        };
      }
    });
  };

  const createUpdateFormHandler = (business: string) => (updater: any) => {
    setAddContractFormData((prev) => {
      const currentData = prev.contractForms[business];
      const newData = typeof updater === "function" ? updater(currentData) : updater;
      return {
        ...prev,
        contractForms: {
          ...prev.contractForms,
          [business]: newData,
        },
      };
    });
  };

  const handleSubmitContract = async () => {
    if (!canModifyClients) return;

    const { lineOfBusiness, contractForms } = addContractFormData;

    if (!lineOfBusiness || lineOfBusiness.length === 0) {
      toast.error("Please select at least one line of business");
      return;
    }

    const unfilledLOBs = lineOfBusiness.filter((lob) => !contractForms[lob]);
    if (unfilledLOBs.length > 0) {
      toast.error(`Please fill out the contract parameters for: ${unfilledLOBs.join(", ")}`);
      return;
    }

    try {
      const promises = lineOfBusiness.map(async (businessType: string) => {
        const contractData = contractForms[businessType];
        if (contractData) {
          const contractKey = CONTRACT_MAPPING[businessType];
          await addContractMutation.mutateAsync({
            contractType: contractKey,
            contractData,
          });
        }
      });

      await Promise.all(promises);
      toast.success("Contract configurations successfully saved!");
      router.push(`/clients/${id}/contract`);
    } catch (error) {
      console.error("Failed to add contract:", error);
      toast.error("Failed to add contract. Please try again.");
    }
  };

  // Error State
  if (isError) {
    return (
      <Box className="flex min-h-[70vh] flex-col items-center justify-center p-4 sm:p-6 bg-background">
        <Box className="mx-auto max-w-md w-full rounded-2xl border border-destructive/20 bg-destructive/5 p-6 sm:p-8 text-center shadow-lg">
          <Box className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <ErrorOutlineOutlinedIcon sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
            Unable to Load Client Data
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: "text.secondary", fontSize: "0.8125rem", lineHeight: 1.5 }}>
            We encountered an issue fetching client information. Please try again later.
          </Typography>
          <MuiButton
            variant="outlined"
            size="small"
            onClick={() => router.back()}
            sx={{ mt: 3, textTransform: "none", fontWeight: 600, borderRadius: "10px", fontSize: "0.75rem" }}
          >
            Go Back
          </MuiButton>
        </Box>
      </Box>
    );
  }

  // Loading State
  if (isLoading || !client) {
    return (
      <Box className="flex min-h-[70vh] flex-col items-center justify-center p-6 bg-background">
        <Box className="flex flex-col items-center gap-3 p-8 rounded-2xl border border-border/60 bg-card/80 shadow-xs">
          <CircularProgress size={36} thickness={4} sx={{ color: "primary.main" }} />
          <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary", fontSize: "0.875rem" }}>
            Loading Contract Configuration...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Unauthorized State
  if (!canModifyClients) {
    return (
      <Box className="flex min-h-[70vh] flex-col items-center justify-center p-4 sm:p-6 bg-background">
        <Box className="mx-auto max-w-md w-full rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 sm:p-8 text-center shadow-lg">
          <Box className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <SecurityOutlinedIcon sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
            Access Restricted
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: "text.secondary", fontSize: "0.8125rem", lineHeight: 1.5 }}>
            You do not have permission to configure contracts for this client.
          </Typography>
          <MuiButton
            variant="outlined"
            size="small"
            onClick={() => router.back()}
            sx={{ mt: 3, textTransform: "none", fontWeight: 600, borderRadius: "10px", fontSize: "0.75rem" }}
          >
            Return to Contracts
          </MuiButton>
        </Box>
      </Box>
    );
  }

  const clientInitial = client.name ? client.name.charAt(0).toUpperCase() : "C";
  const avatarSrc = (client as any).avatarUrl || (client as any).logo;
  const selectedCount = addContractFormData.lineOfBusiness.length;

  return (
    <Box className="flex flex-col min-h-screen w-full max-w-full overflow-hidden bg-background">
      {/* 1. Header Bar (Breadcrumb & Top Action Bar) */}
      <Box className="bg-card/80 border-b border-border/70 backdrop-blur-md sticky top-0 z-20">
        <Box className="px-3 sm:px-4 md:px-5 py-1.5 flex items-center justify-between gap-2">
          {/* Breadcrumb Navigation */}
          <Box className="flex items-center gap-1.5 min-w-0">
            <MuiButton
              variant="text"
              size="small"
              onClick={() => router.push(`/clients/${id}/contract`)}
              startIcon={<ArrowBackOutlinedIcon sx={{ fontSize: 16 }} />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.75rem",
                color: "text.secondary",
                px: 1,
                py: 0.25,
                borderRadius: "8px",
                minWidth: "auto",
                "&:hover": { bgcolor: "action.hover", color: "text.primary" },
              }}
            >
              Contracts
            </MuiButton>

            <Typography variant="caption" sx={{ color: "text.disabled", mx: 0.25 }}>
              /
            </Typography>

            <MuiButton
              variant="text"
              size="small"
              onClick={() => router.push(`/clients/${id}`)}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.75rem",
                color: "text.secondary",
                px: 1,
                py: 0.25,
                borderRadius: "8px",
                minWidth: "auto",
                maxWidth: { xs: 100, sm: 180 },
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                "&:hover": { bgcolor: "action.hover", color: "text.primary" },
              }}
            >
              {client.name || "Client"}
            </MuiButton>

            <Typography variant="caption" sx={{ color: "text.disabled", mx: 0.25 }}>
              /
            </Typography>

            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                fontSize: "0.8125rem",
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <PostAddOutlinedIcon sx={{ fontSize: 15, color: "primary.main" }} />
              <span>New Contract</span>
            </Typography>
          </Box>

          {/* Top Quick Actions */}
          <Box className="flex items-center gap-2 shrink-0">
            <MuiButton
              variant="outlined"
              size="small"
              onClick={() => router.push(`/clients/${id}/contract`)}
              disabled={isAddingContract}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.75rem",
                borderRadius: "8px",
                height: 28,
                px: 1.5,
              }}
            >
              Cancel
            </MuiButton>
            <MuiButton
              variant="contained"
              size="small"
              onClick={handleSubmitContract}
              disabled={isAddingContract || selectedCount === 0}
              startIcon={
                isAddingContract ? (
                  <CircularProgress size={14} thickness={5} sx={{ color: "inherit" }} />
                ) : (
                  <SaveOutlinedIcon sx={{ fontSize: 15 }} />
                )
              }
              sx={{
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.75rem",
                borderRadius: "8px",
                height: 28,
                px: 2,
                bgcolor: "primary.main",
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              {isAddingContract ? "Saving..." : "Save Contract"}
            </MuiButton>
          </Box>
        </Box>

        {/* 2. Executive Hero Banner */}
        <Box className="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 border-t border-border/50 bg-muted/15">
          <Box className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <Box className="flex items-center gap-3 min-w-0 flex-1">
              <Box className="relative shrink-0">
                {avatarSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarSrc}
                    alt={client.name || "Client"}
                    className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl object-cover border border-border shadow-xs"
                  />
                ) : (
                  <Box className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-[#1C252E] to-[#2563EB] text-white flex items-center justify-center font-bold text-sm sm:text-base shadow-xs border border-border/80">
                    {clientInitial}
                  </Box>
                )}
              </Box>

              <Box className="min-w-0 flex-1 space-y-0.5">
                <Box className="flex flex-wrap items-center gap-2">
                  <Typography
                    variant="h6"
                    component="h1"
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: "1.0625rem", sm: "1.1875rem" },
                      color: "text.primary",
                      lineHeight: 1.2,
                    }}
                    className="truncate max-w-[260px] sm:max-w-md"
                  >
                    Configure New Contract
                  </Typography>

                  {client.clientId && (
                    <Chip
                      label={client.clientId}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.625rem",
                        fontFamily: "monospace",
                        fontWeight: 700,
                        bgcolor: "action.selected",
                        color: "text.secondary",
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    />
                  )}
                </Box>

                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span>Client:</span>
                  <span className="font-semibold text-foreground">{client.name}</span>
                </p>
              </Box>
            </Box>

            {/* Selection Counter Pill */}
            <Box className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <Chip
                icon={<LayersOutlinedIcon sx={{ fontSize: "14px !important" }} />}
                label={`${selectedCount} ${selectedCount === 1 ? "Service Line" : "Service Lines"} Selected`}
                size="small"
                sx={{
                  height: 26,
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  bgcolor: selectedCount > 0 ? "rgba(37,99,235,0.08)" : "action.selected",
                  color: selectedCount > 0 ? "primary.main" : "text.secondary",
                  border: "1px solid",
                  borderColor: selectedCount > 0 ? "rgba(37,99,235,0.25)" : "divider",
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* 3. Main Content Viewport (Fluid full width, compact spacing) */}
      <Box className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 md:px-5 py-3 w-full space-y-4">
        {/* Step 1: Line of Business Selection */}
        <div className="rounded-xl border border-border/70 bg-card p-3 sm:p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary text-white font-bold text-[11px]">
                  1
                </span>
                <h2 className="text-sm font-bold text-foreground">
                  Select Lines of Business
                </h2>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Choose one or multiple service lines to configure specific pricing and commercial parameters.
              </p>
            </div>
          </div>

          {/* Business Selection Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {BUSINESS_OPTIONS.map((option) => {
              const isSelected = addContractFormData.lineOfBusiness.includes(option.name);
              const Icon = option.icon;

              return (
                <div
                  key={option.name}
                  onClick={() => handleBusinessCheckChange(option.name, !isSelected)}
                  className={cn(
                    "group relative flex flex-col justify-between p-3 rounded-xl border transition-all duration-150 cursor-pointer select-none",
                    isSelected
                      ? `bg-primary/5 ${option.borderColor} ring-1 ring-primary/30 shadow-2xs`
                      : "bg-card border-border/70 hover:border-border hover:bg-muted/30"
                  )}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${option.bgColor} ${option.color}`}>
                        <Icon sx={{ fontSize: 18 }} />
                      </div>
                      <div
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-md border transition-all",
                          isSelected
                            ? "bg-primary border-primary text-white"
                            : "border-border/80 bg-background text-transparent"
                        )}
                      >
                        <CheckOutlinedIcon sx={{ fontSize: 13, strokeWidth: 2 }} />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-foreground">
                        {option.name}
                      </h3>
                      <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Contract Parameters Forms */}
        {selectedCount > 0 && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 border-b border-border/60 pb-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary text-white font-bold text-[11px]">
                2
              </span>
              <h2 className="text-sm font-bold text-foreground">
                Configure Service Terms & Financial Parameters
              </h2>
            </div>

            <div className="space-y-3">
              {addContractFormData.lineOfBusiness.map((business) => {
                const optionCfg = BUSINESS_OPTIONS.find((o) => o.name === business);
                const ServiceIcon = optionCfg?.icon || PostAddOutlinedIcon;

                return (
                  <div
                    key={business}
                    className="rounded-xl border border-border/70 bg-card shadow-2xs overflow-hidden transition-all"
                  >
                    {/* Section Card Header */}
                    <div className="bg-muted/30 px-3.5 py-2.5 border-b border-border/60 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`p-1.5 rounded-lg ${
                            optionCfg?.bgColor || "bg-primary/10"
                          } ${optionCfg?.color || "text-primary"}`}
                        >
                          <ServiceIcon sx={{ fontSize: 16 }} />
                        </div>
                        <div>
                          <h3 className="font-bold text-xs text-foreground">
                            {business} Terms
                          </h3>
                          <p className="text-[10px] text-muted-foreground">
                            Configure contract dates, fees, and deliverables
                          </p>
                        </div>
                      </div>
                      <Chip
                        label={optionCfg?.category || "Contract"}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.625rem",
                          fontWeight: 600,
                          bgcolor: "action.selected",
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      />
                    </div>

                    {/* Form Body */}
                    <div className="p-3 sm:p-4">
                      {["Recruitment", "HR Managed Services", "IT & Technology"].includes(business) && (
                        <BusinessForm
                          formData={addContractFormData.contractForms[business]}
                          setFormData={createUpdateFormHandler(business)}
                        />
                      )}
                      {["HR Consulting", "Mgt Consulting"].includes(business) && (
                        <ConsultingForm
                          businessType={business}
                          formData={addContractFormData.contractForms[business]}
                          setFormData={createUpdateFormHandler(business)}
                        />
                      )}
                      {business === "Outsourcing" && (
                        <OutsourcingForm
                          formData={addContractFormData.contractForms[business]}
                          setFormData={createUpdateFormHandler(business)}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Sticky Action Footer */}
        <div className="sticky bottom-3 z-20 rounded-xl border border-border/80 bg-card/95 p-3 shadow-md backdrop-blur-md flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground hidden sm:block">
            {selectedCount === 0 ? (
              <span>Select at least one line of business to enable saving.</span>
            ) : (
              <span className="text-foreground font-medium flex items-center gap-1.5">
                <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 16, color: "#10b981" }} />
                Ready to configure {selectedCount} service line(s).
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <MuiButton
              variant="outlined"
              size="small"
              onClick={() => router.push(`/clients/${id}/contract`)}
              disabled={isAddingContract}
              sx={{ textTransform: "none", fontSize: "0.75rem", fontWeight: 600, borderRadius: "8px", height: 32, px: 2 }}
            >
              Cancel
            </MuiButton>
            <MuiButton
              variant="contained"
              size="small"
              onClick={handleSubmitContract}
              disabled={isAddingContract || selectedCount === 0}
              startIcon={
                isAddingContract ? (
                  <CircularProgress size={14} thickness={5} sx={{ color: "inherit" }} />
                ) : (
                  <SaveOutlinedIcon sx={{ fontSize: 16 }} />
                )
              }
              sx={{
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.75rem",
                borderRadius: "8px",
                height: 32,
                px: 2.5,
                bgcolor: "primary.main",
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              {isAddingContract ? "Saving..." : "Save Contract Configurations"}
            </MuiButton>
          </div>
        </div>
      </Box>
    </Box>
  );
}
