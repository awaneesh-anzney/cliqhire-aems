"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MuiButton from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";

import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AutorenewOutlinedIcon from "@mui/icons-material/AutorenewOutlined";
import KeyboardArrowRightOutlinedIcon from "@mui/icons-material/KeyboardArrowRightOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";

import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import BusinessForm from "@/components/contract-forms/business-form";
import ConsultingForm from "@/components/contract-forms/consulting-form";
import OutsourcingForm from "@/components/contract-forms/outsourcing-form";
import { useClientContracts } from "@/hooks/useClientContracts";
import { useToggleContractSource } from "@/hooks/useClient";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface ContractSectionProps {
  clientId: string;
  clientData?: any;
  canModify?: boolean;
}

// Mapping between line of business and contract object keys
const CONTRACT_MAPPING: Record<string, string> = {
  Recruitment: "businessContractRQT",
  "HR Managed Services": "businessContractHMS",
  "IT & Technology": "businessContractIT",
  "Mgt Consulting": "consultingContractMGTC",
  "HR Consulting": "consultingContractHRC",
  Outsourcing: "outsourcingContract",
};

const getContractStatus = (contract: any) => {
  const now = new Date();

  if (contract?.endDateType === "open-ended") {
    if (!contract.nextRenewalDate) return "ACTIVE";
    const daysToRenewal = Math.ceil(
      (new Date(contract.nextRenewalDate).getTime() - now.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    if (daysToRenewal <= 0) return "RENEWAL_OVERDUE";
    if (daysToRenewal <= 7) return "RENEWAL_SOON";
    if (daysToRenewal <= 30) return "RENEWAL_DUE";
    return "ACTIVE";
  }

  // Fixed end date
  if (!contract?.contractEndDate) return "ACTIVE";
  const daysToExpiry = Math.ceil(
    (new Date(contract.contractEndDate).getTime() - now.getTime()) /
      (1000 * 60 * 60 * 24)
  );
  if (daysToExpiry <= 0) return "EXPIRED";
  if (daysToExpiry <= 7) return "EXPIRING_SOON";
  if (daysToExpiry <= 30) return "EXPIRY_WARNING";
  return "ACTIVE";
};

const getStatusBadgeConfig = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return {
        label: "Active",
        className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        dotColor: "bg-emerald-500",
      };
    case "RENEWAL_OVERDUE":
      return {
        label: "Renewal Overdue",
        className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 animate-pulse",
        dotColor: "bg-rose-500",
      };
    case "RENEWAL_SOON":
      return {
        label: "Renewal Soon",
        className: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
        dotColor: "bg-orange-500",
      };
    case "RENEWAL_DUE":
      return {
        label: "Renewal Due",
        className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        dotColor: "bg-amber-500",
      };
    case "EXPIRED":
      return {
        label: "Expired",
        className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
        dotColor: "bg-rose-500",
      };
    case "EXPIRING_SOON":
      return {
        label: "Expiring Soon",
        className: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
        dotColor: "bg-orange-500",
      };
    case "EXPIRY_WARNING":
      return {
        label: "Expiry Warning",
        className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        dotColor: "bg-amber-500",
      };
    default:
      return {
        label: "Active",
        className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        dotColor: "bg-emerald-500",
      };
  }
};

// Helper function to get service icon and theme styling
const getServiceConfig = (businessType: string) => {
  switch (businessType) {
    case "Recruitment":
      return {
        icon: PeopleAltOutlinedIcon,
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20",
      };
    case "HR Managed Services":
      return {
        icon: VerifiedUserOutlinedIcon,
        color: "text-indigo-600 dark:text-indigo-400",
        bgColor: "bg-indigo-500/10",
        borderColor: "border-indigo-500/20",
      };
    case "IT & Technology":
      return {
        icon: CodeOutlinedIcon,
        color: "text-purple-600 dark:text-purple-400",
        bgColor: "bg-purple-500/10",
        borderColor: "border-purple-500/20",
      };
    case "Mgt Consulting":
      return {
        icon: WorkOutlineOutlinedIcon,
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/20",
      };
    case "HR Consulting":
      return {
        icon: PersonSearchOutlinedIcon,
        color: "text-teal-600 dark:text-teal-400",
        bgColor: "bg-teal-500/10",
        borderColor: "border-teal-500/20",
      };
    case "Outsourcing":
      return {
        icon: ApartmentOutlinedIcon,
        color: "text-amber-600 dark:text-amber-400",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/20",
      };
    default:
      return {
        icon: DescriptionOutlinedIcon,
        color: "text-primary",
        bgColor: "bg-primary/10",
        borderColor: "border-primary/20",
      };
  }
};

// Helper function to get form type based on business type
const getFormType = (businessType: string) => {
  if (["Recruitment", "HR Managed Services", "IT & Technology"].includes(businessType)) {
    return "business";
  }
  if (["Mgt Consulting", "HR Consulting"].includes(businessType)) {
    return "consulting";
  }
  if (businessType === "Outsourcing") {
    return "outsourcing";
  }
  return "business";
};

export function ContractSection({
  clientId,
  clientData,
  canModify = true,
}: ContractSectionProps) {
  const [expandedContract, setExpandedContract] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);
  const [renewDialogOpen, setRenewDialogOpen] = useState<string | null>(null);
  const [renewNotes, setRenewNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<string>("all");

  const {
    contractsQuery,
    updateContractMutation,
    deleteContractMutation,
    renewContractMutation,
  } = useClientContracts(clientId);
  const toggleContractSourceMutation = useToggleContractSource();
  const router = useRouter();

  const isSubmitting = updateContractMutation.isPending;
  const isDeleting = deleteContractMutation.isPending;
  const isSubsidiary = !!clientData?.parentClientId;
  const contractSource = clientData?.contractSource || "own";
  const effectiveCanModify = canModify && contractSource !== "parent";

  // Use contracts from the new API if available, fallback to clientData
  const contractsObj = contractsQuery.data?.data || clientData?.contracts || {};

  // Function to map contract data to form data structure
  const mapContractDataToFormData = (contractData: any, businessType: string) => {
    const formType = getFormType(businessType);
    if (formType === "business") {
      return {
        contractStartDate: contractData?.contractStartDate ? new Date(contractData.contractStartDate) : null,
        contractEndDate: contractData?.contractEndDate ? new Date(contractData.contractEndDate) : null,
        endDateType: contractData?.endDateType || "fixed",
        renewalPeriod: contractData?.renewalPeriod || "",
        contractType: contractData?.contractType || contractData?.ContractType || "",
        fixedPercentage: contractData?.fixedPercentage || 0,
        advanceMoneyCurrency: contractData?.advanceMoneyCurrency || "SAR",
        advanceMoneyAmount: contractData?.advanceMoneyAmount || 0,
        fixedPercentageAdvanceNotes: contractData?.fixedPercentageAdvanceNotes || "",
        contractDocument: contractData?.contractDocument || null,
        fixWithoutAdvanceValue: contractData?.fixWithoutAdvanceValue || 0,
        fixWithoutAdvanceNotes: contractData?.fixWithoutAdvanceNotes || "",
        levelBasedHiring: contractData?.levelBasedHiring || {
          levelTypes: [],
          seniorLevel: { percentage: 0, notes: "", amount: 0, currency: "SAR" },
          executives: { percentage: 0, notes: "", amount: 0, currency: "SAR" },
          nonExecutives: { percentage: 0, notes: "", amount: 0, currency: "SAR" },
          other: { percentage: 0, notes: "", amount: 0, currency: "SAR" },
        },
        levelBasedAdvanceHiring: contractData?.levelBasedAdvanceHiring || {
          levelTypes: [],
          seniorLevel: { percentage: 0, notes: "", amount: 0, currency: "SAR" },
          executives: { percentage: 0, notes: "", amount: 0, currency: "SAR" },
          nonExecutives: { percentage: 0, notes: "", amount: 0, currency: "SAR" },
          other: { percentage: 0, notes: "", amount: 0, currency: "SAR" },
        },
      };
    }

    if (formType === "consulting") {
      let technicalProposalDocument = null;
      let financialProposalDocument = null;

      if (businessType === "HR Consulting") {
        technicalProposalDocument = contractData?.techProposalDocHRC || null;
        financialProposalDocument = contractData?.finProposalDocHRC || null;
      } else if (businessType === "Mgt Consulting") {
        technicalProposalDocument = contractData?.techProposalDocMGTC || null;
        financialProposalDocument = contractData?.finProposalDocMGTC || null;
      } else {
        technicalProposalDocument = contractData?.technicalProposalDocument || null;
        financialProposalDocument = contractData?.financialProposalDocument || null;
      }

      return {
        contractStartDate: contractData?.contractStartDate ? new Date(contractData.contractStartDate) : null,
        contractEndDate: contractData?.contractEndDate ? new Date(contractData.contractEndDate) : null,
        endDateType: contractData?.endDateType || "fixed",
        renewalPeriod: contractData?.renewalPeriod || "",
        contractType: contractData?.contractType || "",
        salaryCurrency: contractData?.salaryCurrency || "SAR",
        serviceScope: contractData?.serviceScope || "",
        clientContact: contractData?.clientContact || "",
        estimatedHours: contractData?.estimatedHours || "",
        projectScope: contractData?.projectScope || "",
        clientCompany: contractData?.clientCompany || "",
        keyDeliverables: contractData?.keyDeliverables || "",
        technicalProposalNotes: contractData?.technicalProposalNotes || "",
        financialProposalNotes: contractData?.financialProposalNotes || "",
        technicalProposalDocument,
        financialProposalDocument,
        totalCost: contractData?.totalCost || 0,
        ...(contractData?._id && { _id: contractData._id }),
        ...(contractData?.createdAt && { createdAt: contractData.createdAt }),
        ...(contractData?.updatedAt && { updatedAt: contractData.updatedAt }),
      };
    }

    if (formType === "outsourcing") {
      return {
        contractStartDate: contractData?.contractStartDate ? new Date(contractData.contractStartDate) : null,
        contractEndDate: contractData?.contractEndDate ? new Date(contractData.contractEndDate) : null,
        endDateType: contractData?.endDateType || "fixed",
        renewalPeriod: contractData?.renewalPeriod || "",
        contractType: contractData?.ContractType || contractData?.contractType || "",
        serviceCategory: contractData?.serviceCategory || "",
        numberOfResources: contractData?.numberOfResources || 0,
        durationPerResource: contractData?.durationPerResource || 0,
        slaTerms: contractData?.slaTerms || "",
        totalCost: contractData?.totalCost || 0,
        contractDocument: contractData?.contractDocument || null,
      };
    }

    return {};
  };

  const handleEditContract = (businessType: string) => {
    if (!effectiveCanModify) return;
    const contractKey = CONTRACT_MAPPING[businessType as keyof typeof CONTRACT_MAPPING];
    const contractData = contractsObj[contractKey];
    const mappedData = mapContractDataToFormData(contractData, businessType);
    setFormData(mappedData);
    setEditDialogOpen(businessType);
  };

  const handleFormSubmit = async (updatedFormData: any) => {
    if (!effectiveCanModify || !editDialogOpen || !clientId) return;

    try {
      const contractKey = CONTRACT_MAPPING[editDialogOpen as keyof typeof CONTRACT_MAPPING];
      await updateContractMutation.mutateAsync({
        contractType: contractKey,
        contractData: updatedFormData,
      });
      setEditDialogOpen(null);
    } catch (error) {
      console.error("Failed to update contract:", error);
    }
  };

  const handleDeleteContract = async () => {
    if (!effectiveCanModify || !deleteDialogOpen || !clientId) return;

    try {
      const contractKey = CONTRACT_MAPPING[deleteDialogOpen as keyof typeof CONTRACT_MAPPING];
      await deleteContractMutation.mutateAsync(contractKey);
      setDeleteDialogOpen(null);
    } catch (error) {
      console.error("Failed to delete contract:", error);
    }
  };

  const handleRenewContract = async () => {
    if (!effectiveCanModify || !renewDialogOpen || !clientId) return;

    try {
      const contractKey = CONTRACT_MAPPING[renewDialogOpen as keyof typeof CONTRACT_MAPPING];
      await renewContractMutation.mutateAsync({
        contractType: contractKey,
        notes: renewNotes,
      });
      setRenewDialogOpen(null);
      setRenewNotes("");
    } catch (error) {
      console.error("Failed to renew contract:", error);
    }
  };

  const handleAddContract = () => {
    if (!effectiveCanModify) return;
    router.push(`/clients/${clientId}/contract/new`);
  };

  const renderEditForm = (businessType: string) => {
    const formType = getFormType(businessType);

    if (formType === "business") {
      return <BusinessForm formData={formData} setFormData={setFormData} />;
    }

    if (formType === "consulting") {
      return (
        <ConsultingForm
          businessType={businessType}
          formData={formData}
          setFormData={setFormData}
        />
      );
    }

    if (formType === "outsourcing") {
      return (
        <OutsourcingForm formData={formData} setFormData={setFormData} />
      );
    }

    return null;
  };

  if (!clientData) {
    return (
      <Box className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-border bg-card shadow-xs">
        <CircularProgress size={32} thickness={4} sx={{ color: "primary.main", mb: 1.5 }} />
        <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.8125rem" }}>
          Loading contract information...
        </Typography>
      </Box>
    );
  }

  // Get line of business array
  const lineOfBusiness = clientData.lineOfBusiness || [];

  // Determine available contracts from both lineOfBusiness and actual contracts present
  const contractsBusinessTypes = Object.keys(contractsObj)
    .map((key) => {
      const found = Object.entries(CONTRACT_MAPPING).find(
        ([, mappedKey]) => mappedKey === key
      );
      return found ? found[0] : undefined;
    })
    .filter((v): v is string => Boolean(v));

  const lobArray = Array.isArray(lineOfBusiness) ? lineOfBusiness : [];
  const lobWithExistingContracts = lobArray.filter((business: string) => {
    const contractKey = CONTRACT_MAPPING[business as keyof typeof CONTRACT_MAPPING];
    return !!(contractKey && contractsObj[contractKey]);
  });

  const availableContracts = Array.from(
    new Set([...lobWithExistingContracts, ...contractsBusinessTypes])
  );

  // Calculate status counts for KPI overview
  let activeCount = 0;
  let warningCount = 0;

  availableContracts.forEach((bt) => {
    const key = CONTRACT_MAPPING[bt as keyof typeof CONTRACT_MAPPING];
    const data = contractsObj[key];
    if (data) {
      const status = getContractStatus(data);
      if (status === "ACTIVE") activeCount++;
      if (
        [
          "RENEWAL_OVERDUE",
          "RENEWAL_SOON",
          "RENEWAL_DUE",
          "EXPIRED",
          "EXPIRING_SOON",
          "EXPIRY_WARNING",
        ].includes(status)
      ) {
        warningCount++;
      }
    }
  });

  // Empty State Layout
  if (availableContracts.length === 0) {
    return (
      <Box className="rounded-2xl border border-dashed border-border/80 bg-card/60 p-8 sm:p-12 text-center shadow-xs">
        <Box className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
          <DescriptionOutlinedIcon sx={{ fontSize: 30 }} />
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "text.primary" }}>
          No Contracts Configured Yet
        </Typography>
        <Typography variant="body2" sx={{ mx: "auto", mt: 1, maxWidth: 400, fontSize: "0.75rem", color: "text.secondary" }}>
          Create and configure formal service agreements, terms, pricing structures, and renewal cycles for {clientData.name}.
        </Typography>
        <MuiButton
          variant="contained"
          size="small"
          onClick={handleAddContract}
          disabled={!effectiveCanModify}
          startIcon={<AddOutlinedIcon sx={{ fontSize: 16 }} />}
          sx={{
            mt: 3,
            textTransform: "none",
            fontWeight: 700,
            borderRadius: "10px",
            fontSize: "0.75rem",
            px: 2.5,
            py: 0.75,
            bgcolor: "primary.main",
            "&:hover": { bgcolor: "primary.dark" },
          }}
        >
          Add First Contract
        </MuiButton>
      </Box>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getContractSummary = (contractData: any, contractType: string) => {
    if (!contractData) return null;

    const summary: {
      contractType?: string;
      ContractType?: string;
      startDate?: string;
      endDate?: string;
      endDateType?: string;
      renewalPeriod?: string;
      nextRenewalDate?: string;
      lastRenewedAt?: string;
      renewalCount?: number;
      hasDocument: boolean;
      details?: string;
      hasTechProposal?: boolean;
      hasFinProposal?: boolean;
    } = {
      contractType: contractData.ContractType || contractData.contractType || "Not specified",
      startDate: contractData.contractStartDate,
      endDate: contractData.contractEndDate,
      endDateType: contractData.endDateType || "fixed",
      renewalPeriod: contractData.renewalPeriod || "",
      nextRenewalDate: contractData.nextRenewalDate,
      lastRenewedAt: contractData.lastRenewedAt,
      renewalCount: contractData.renewalCount || 0,
      hasDocument: !!contractData.contractDocument?.url,
    };

    if (
      contractType === "Recruitment" ||
      contractType === "IT & Technology" ||
      contractType === "HR Managed Services"
    ) {
      const type = contractData.contractType || contractData.ContractType;
      if (type === "Fix with Advance") {
        summary.details = `${contractData.fixedPercentage || 0}% Fee + ${
          contractData.advanceMoneyAmount || 0
        } ${contractData.advanceMoneyCurrency || "SAR"} Advance`;
      } else if (type === "Fix without Advance") {
        summary.details = `${contractData.fixWithoutAdvanceValue || 0}% Fixed Fee`;
      } else if (type === "Level Based Hiring") {
        const levelTypes = contractData.levelBasedHiring?.levelTypes || [];
        summary.details = `${levelTypes.length} Seniority Tiers Configured`;
      } else if (type === "Level Based Advance Hiring") {
        const levelTypes = contractData.levelBasedAdvanceHiring?.levelTypes || [];
        summary.details = `${levelTypes.length} Seniority Tiers (With Advance)`;
      }
    } else if (contractType === "HR Consulting" || contractType === "Mgt Consulting") {
      summary.hasTechProposal = !!(contractData.techProposalDocHRC?.url || contractData.techProposalDocMGTC?.url);
      summary.hasFinProposal = !!(contractData.finProposalDocHRC?.url || contractData.finProposalDocMGTC?.url);
      summary.details = `Total Value: ${contractData.totalCost || 0} ${contractData.salaryCurrency || "SAR"}`;
    } else if (contractType === "Outsourcing") {
      summary.details = `${contractData.numberOfResources || 0} Resources Allocated • Total Cost: ${contractData.totalCost || 0} SAR`;
    }

    return summary;
  };

  const handleShowDetails = (contractType: string) => {
    setExpandedContract(expandedContract === contractType ? null : contractType);
  };

  // Filtered list based on search and tab selections
  const filteredContracts = availableContracts.filter((bt) => {
    const matchesSearch = bt.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (selectedTab === "all") return true;
    if (selectedTab === "open-ended") {
      const key = CONTRACT_MAPPING[bt as keyof typeof CONTRACT_MAPPING];
      return contractsObj[key]?.endDateType === "open-ended";
    }
    if (selectedTab === "fixed") {
      const key = CONTRACT_MAPPING[bt as keyof typeof CONTRACT_MAPPING];
      return contractsObj[key]?.endDateType !== "open-ended";
    }
    return true;
  });

  const renderContractDetails = (contractData: any, contractType: string) => {
    if (!contractData) return null;

    const isOpenEnded = contractData.endDateType === "open-ended";

    const RENEWAL_PERIOD_LABELS: Record<string, string> = {
      "1_month": "Every Month",
      "2_month": "Every 2 Months",
      "3_month": "Every 3 Months",
      "6_month": "Every 6 Months",
      "1_year": "Every 1 Year",
    };

    return (
      <Box className="mt-3 pt-3 border-t border-border/60 space-y-3.5 animate-in fade-in duration-200">
        {/* Core Timeline & Renewal Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Contract Model
            </span>
            <p className="text-xs font-semibold text-foreground mt-1">
              {contractData.ContractType || contractData.contractType || "Not specified"}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Start Date
            </span>
            <p className="text-xs font-semibold text-foreground mt-1 flex items-center gap-1.5">
              <CalendarTodayOutlinedIcon sx={{ fontSize: 14, color: "primary.main" }} />
              {formatDate(contractData.contractStartDate)}
            </p>
          </div>
          {!isOpenEnded ? (
            <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Contract End Date
              </span>
              <p className="text-xs font-semibold text-foreground mt-1 flex items-center gap-1.5">
                <CalendarTodayOutlinedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                {formatDate(contractData.contractEndDate)}
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Renewal Cycle Frequency
              </span>
              <p className="text-xs font-semibold text-foreground mt-1 flex items-center gap-1.5">
                <AutorenewOutlinedIcon sx={{ fontSize: 14, color: "#10b981" }} />
                {RENEWAL_PERIOD_LABELS[contractData.renewalPeriod] || contractData.renewalPeriod || "—"}
              </p>
            </div>
          )}
        </div>

        {/* Open Ended Renewal Summary Box */}
        {isOpenEnded && (
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/5 via-card to-card border border-emerald-500/20 shadow-2xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-center">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Next Renewal Date
                </span>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {formatDate(contractData.nextRenewalDate)}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Last Renewed
                </span>
                <p className="text-xs font-semibold text-foreground mt-0.5">
                  {formatDate(contractData.lastRenewedAt)}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Cycles Completed
                </span>
                <p className="text-xs font-semibold text-foreground mt-0.5">
                  {contractData.renewalCount || 0} times
                </p>
              </div>
              <div className="text-right col-span-2 sm:col-span-1">
                {effectiveCanModify && (
                  <MuiButton
                    variant="contained"
                    size="small"
                    onClick={() => setRenewDialogOpen(contractType)}
                    startIcon={<AutorenewOutlinedIcon sx={{ fontSize: 15 }} />}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      borderRadius: "8px",
                      px: 1.5,
                      py: 0.5,
                      bgcolor: "#059669",
                      "&:hover": { bgcolor: "#047857" },
                    }}
                  >
                    Renew Contract
                  </MuiButton>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Outsourcing Resources Details Box */}
        {contractType === "Outsourcing" && (
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-card border border-border/70 shadow-2xs">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Resource Count
                </span>
                <p className="text-xs font-bold text-foreground mt-0.5">
                  {contractData.numberOfResources || 0} Staff
                </p>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border/70 shadow-2xs">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Total Contract Cost
                </span>
                <p className="text-xs font-bold text-foreground mt-0.5">
                  {contractData.totalCost || 0} SAR
                </p>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border/70 shadow-2xs">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Service Category
                </span>
                <p className="text-xs font-semibold text-foreground mt-0.5">
                  {contractData.serviceCategory || "Not specified"}
                </p>
              </div>
            </div>
            {contractData.slaTerms && (
              <div className="p-3 rounded-xl bg-card border border-border/70 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  SLA Terms & Service Guarantees
                </span>
                <p className="text-xs text-foreground leading-relaxed">
                  {contractData.slaTerms}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Contract Documents Section */}
        <div className="space-y-2">
          <Typography variant="caption" sx={{ fontWeight: 700, color: "text.primary", display: "flex", alignItems: "center", gap: 1, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 15, color: "primary.main" }} />
            Contract Documents & Attachments
          </Typography>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Standard Contract Document */}
            {contractData.contractDocument?.url && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border/70 shadow-2xs hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <DescriptionOutlinedIcon sx={{ fontSize: 16 }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      Main Contract Document
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {contractData.contractDocument.fileName || "View Agreement PDF"}
                    </p>
                  </div>
                </div>
                <MuiButton
                  variant="outlined"
                  size="small"
                  onClick={() => window.open(contractData.contractDocument.url, "_blank")}
                  endIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 13 }} />}
                  sx={{ textTransform: "none", fontSize: "0.6875rem", fontWeight: 600, borderRadius: "7px", py: 0.25, px: 1, minWidth: "auto" }}
                >
                  View
                </MuiButton>
              </div>
            )}

            {/* Consulting Technical Proposal */}
            {(contractData.techProposalDocHRC?.url || contractData.techProposalDocMGTC?.url) && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border/70 shadow-2xs hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <DescriptionOutlinedIcon sx={{ fontSize: 16 }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      Technical Proposal
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {contractData.techProposalDocHRC?.fileName ||
                        contractData.techProposalDocMGTC?.fileName ||
                        "Technical Proposal Doc"}
                    </p>
                  </div>
                </div>
                <MuiButton
                  variant="outlined"
                  size="small"
                  onClick={() =>
                    window.open(
                      contractData.techProposalDocHRC?.url || contractData.techProposalDocMGTC?.url,
                      "_blank"
                    )
                  }
                  endIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 13 }} />}
                  sx={{ textTransform: "none", fontSize: "0.6875rem", fontWeight: 600, borderRadius: "7px", py: 0.25, px: 1, minWidth: "auto" }}
                >
                  View
                </MuiButton>
              </div>
            )}

            {/* Consulting Financial Proposal */}
            {(contractData.finProposalDocHRC?.url || contractData.finProposalDocMGTC?.url) && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border/70 shadow-2xs hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <DescriptionOutlinedIcon sx={{ fontSize: 16 }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      Financial Proposal
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {contractData.finProposalDocHRC?.fileName ||
                        contractData.finProposalDocMGTC?.fileName ||
                        "Financial Proposal Doc"}
                    </p>
                  </div>
                </div>
                <MuiButton
                  variant="outlined"
                  size="small"
                  onClick={() =>
                    window.open(
                      contractData.finProposalDocHRC?.url || contractData.finProposalDocMGTC?.url,
                      "_blank"
                    )
                  }
                  endIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 13 }} />}
                  sx={{ textTransform: "none", fontSize: "0.6875rem", fontWeight: 600, borderRadius: "7px", py: 0.25, px: 1, minWidth: "auto" }}
                >
                  View
                </MuiButton>
              </div>
            )}
          </div>
        </div>

        {/* Renewal History Timeline */}
        {isOpenEnded && contractData.renewalHistory && contractData.renewalHistory.length > 0 && (
          <div className="space-y-2 pt-1">
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.primary", display: "flex", alignItems: "center", gap: 1, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <HistoryOutlinedIcon sx={{ fontSize: 15, color: "#10b981" }} />
              Renewal Audit History
            </Typography>
            <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 text-muted-foreground uppercase tracking-wider text-[10px] font-bold border-b border-border/60">
                    <tr>
                      <th className="px-3 py-2">Renewed Date</th>
                      <th className="px-3 py-2">Cycle Start</th>
                      <th className="px-3 py-2">Cycle End</th>
                      <th className="px-3 py-2">Renewal Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-foreground">
                    {contractData.renewalHistory.map((historyItem: any, index: number) => (
                      <tr key={index} className="hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-2 font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatDate(historyItem.renewedAt)}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {formatDate(historyItem.newCycleStart || historyItem.previousNextRenewalDate)}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {formatDate(historyItem.newCycleEnd || historyItem.newNextRenewalDate)}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground max-w-[200px] truncate" title={historyItem.notes}>
                          {historyItem.notes || "Standard Renewal"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Box>
    );
  };

  return (
    <Box className="space-y-3">
      {/* Subsidiary Warning Banner */}
      {isSubsidiary && (
        <div className="p-3 rounded-xl bg-card border border-border/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ApartmentOutlinedIcon sx={{ fontSize: 18 }} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Subsidiary Client Terms</h4>
              <p className="text-xs text-muted-foreground">
                Parent: <span className="font-semibold text-foreground">{clientData.parentCompany?.name || "Parent Company"}</span>.
                {contractSource === "parent"
                  ? " Sharing parent's contract agreements."
                  : " Managing dedicated contracts."}
              </p>
            </div>
          </div>
          {canModify && (
            <MuiButton
              variant="outlined"
              size="small"
              disabled={toggleContractSourceMutation.isPending}
              onClick={() => {
                const newSource = contractSource === "parent" ? "own" : "parent";
                toggleContractSourceMutation.mutate({ clientId, contractSource: newSource });
              }}
              sx={{ textTransform: "none", fontSize: "0.75rem", fontWeight: 600, borderRadius: "8px", height: 32, shrink: 0 }}
            >
              {toggleContractSourceMutation.isPending
                ? "Updating..."
                : contractSource === "parent"
                ? "Manage Own Contracts"
                : "Share Parent Contract"}
            </MuiButton>
          )}
        </div>
      )}

      {/* Portfolio Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* KPI Card 1: Active Contracts */}
        <div className="rounded-xl border border-border/70 bg-card p-3 shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Total Contracts
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-foreground">
                {availableContracts.length}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                {activeCount} Active
              </span>
            </div>
          </div>
          <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <DescriptionOutlinedIcon sx={{ fontSize: 20 }} />
          </div>
        </div>

        {/* KPI Card 2: Renewal & Expiry Status */}
        <div className="rounded-xl border border-border/70 bg-card p-3 shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Lifecycle Alerts
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-xl font-bold ${
                  warningCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-foreground"
                }`}
              >
                {warningCount}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {warningCount === 0 ? "All agreements healthy" : "Requires review"}
              </span>
            </div>
          </div>
          <div
            className={`h-9 w-9 rounded-lg flex items-center justify-center ${
              warningCount > 0
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {warningCount > 0 ? (
              <WarningAmberOutlinedIcon sx={{ fontSize: 20 }} />
            ) : (
              <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 20 }} />
            )}
          </div>
        </div>

        {/* KPI Card 3: Action & Management */}
        <div className="rounded-xl border border-border/70 bg-card p-3 shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Management
            </span>
            <p className="text-[11px] text-muted-foreground">
              Configure contract parameters
            </p>
          </div>
          <MuiButton
            variant="contained"
            size="small"
            onClick={handleAddContract}
            disabled={!effectiveCanModify}
            startIcon={<AddOutlinedIcon sx={{ fontSize: 16 }} />}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.75rem",
              borderRadius: "8px",
              height: 32,
              px: 1.5,
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            Add Contract
          </MuiButton>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-card p-2 rounded-xl border border-border/70 shadow-2xs">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <SearchOutlinedIcon sx={{ fontSize: 17 }} className="absolute left-3 top-2.5 text-muted-foreground" />
          <Input
            placeholder="Search contracts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-8 text-xs rounded-lg border-border/70 bg-background/60"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setSelectedTab("all")}
            className={cn(
              "h-7 px-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all",
              selectedTab === "all"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
            )}
          >
            All ({availableContracts.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab("open-ended")}
            className={cn(
              "h-7 px-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all",
              selectedTab === "open-ended"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
            )}
          >
            Open-Ended
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab("fixed")}
            className={cn(
              "h-7 px-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all",
              selectedTab === "fixed"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
            )}
          >
            Fixed Term
          </button>
        </div>
      </div>

      {/* Contract Cards List */}
      <div className="space-y-3">
        {filteredContracts.map((businessType: string) => {
          const contractKey = CONTRACT_MAPPING[businessType as keyof typeof CONTRACT_MAPPING];
          const contractData = contractsObj[contractKey];
          const summary = getContractSummary(contractData, businessType);
          const serviceCfg = getServiceConfig(businessType);
          const ServiceIcon = serviceCfg.icon;
          const isExpanded = expandedContract === businessType;
          const isEditing = editDialogOpen === businessType;

          return (
            <div
              key={businessType}
              className={cn(
                "rounded-xl border bg-card transition-all duration-200 shadow-2xs overflow-hidden",
                isExpanded ? "border-primary/50 ring-1 ring-primary/20" : "border-border/70 hover:border-border"
              )}
            >
              <div className="p-3.5 sm:p-4">
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${serviceCfg.bgColor} ${serviceCfg.color}`}>
                          <ServiceIcon sx={{ fontSize: 18 }} />
                        </div>
                        <h3 className="text-sm font-bold text-foreground">
                          Edit {businessType} Contract Terms
                        </h3>
                      </div>
                    </div>
                    {renderEditForm(businessType)}
                    <div className="flex justify-end gap-2 pt-3 border-t border-border/60">
                      <MuiButton
                        variant="outlined"
                        size="small"
                        onClick={() => setEditDialogOpen(null)}
                        disabled={isSubmitting}
                        sx={{ textTransform: "none", fontSize: "0.75rem", fontWeight: 600, borderRadius: "8px" }}
                      >
                        Cancel
                      </MuiButton>
                      <MuiButton
                        variant="contained"
                        size="small"
                        onClick={() => handleFormSubmit(formData)}
                        disabled={isSubmitting || !effectiveCanModify}
                        sx={{
                          textTransform: "none",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          borderRadius: "8px",
                          bgcolor: "primary.main",
                          "&:hover": { bgcolor: "primary.dark" },
                        }}
                      >
                        {isSubmitting ? "Saving..." : "Save Contract"}
                      </MuiButton>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      {/* Left Contract Category Identity & Status */}
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`p-2.5 rounded-xl ${serviceCfg.bgColor} ${serviceCfg.color} border ${serviceCfg.borderColor} shrink-0 mt-0.5`}
                        >
                          <ServiceIcon sx={{ fontSize: 20 }} />
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-bold text-foreground tracking-tight">
                              {businessType} Contract
                            </h3>

                            {summary?.contractType && (
                              <Chip
                                label={summary.contractType}
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
                            )}

                            {contractData && (() => {
                              const status = getContractStatus(contractData);
                              const badgeConfig = getStatusBadgeConfig(status);
                              return (
                                <span
                                  className={cn(
                                    "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-flex items-center gap-1.5 border",
                                    badgeConfig.className
                                  )}
                                >
                                  <span className={cn("size-1.5 rounded-full", badgeConfig.dotColor)} />
                                  {badgeConfig.label}
                                </span>
                              );
                            })()}
                          </div>

                          {summary?.details && (
                            <p className="text-xs font-medium text-foreground/90">
                              {summary.details}
                            </p>
                          )}

                          {/* Quick Info Badges */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <CalendarTodayOutlinedIcon sx={{ fontSize: 13, opacity: 0.7 }} />
                              <span>
                                {summary?.endDateType === "open-ended"
                                  ? `Open-Ended • Started ${formatDate(summary.startDate)}`
                                  : summary?.startDate
                                  ? `${formatDate(summary.startDate)} to ${formatDate(summary.endDate)}`
                                  : "Duration not set"}
                              </span>
                            </div>

                            {summary?.endDateType === "open-ended" && summary?.nextRenewalDate && (
                              <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-md border border-amber-500/20 text-[10px] font-bold">
                                <AccessTimeOutlinedIcon sx={{ fontSize: 12 }} />
                                <span>Next Renewal: {formatDate(summary.nextRenewalDate)}</span>
                              </div>
                            )}

                            {summary?.hasDocument && (
                              <div className="flex items-center gap-1 text-primary text-[11px] font-semibold">
                                <AttachFileOutlinedIcon sx={{ fontSize: 13 }} />
                                <span>Document Attached</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Button Controls */}
                      <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                        <MuiButton
                          variant="text"
                          size="small"
                          onClick={() => handleShowDetails(businessType)}
                          endIcon={
                            isExpanded ? (
                              <KeyboardArrowDownOutlinedIcon sx={{ fontSize: 16 }} />
                            ) : (
                              <KeyboardArrowRightOutlinedIcon sx={{ fontSize: 16 }} />
                            )
                          }
                          sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            height: 28,
                            borderRadius: "7px",
                            px: 1,
                            color: "text.secondary",
                            "&:hover": { bgcolor: "action.hover", color: "text.primary" },
                          }}
                        >
                          {isExpanded ? "Hide Details" : "View Details"}
                        </MuiButton>

                        <Tooltip title="Edit Contract Parameters" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleEditContract(businessType)}
                            disabled={!effectiveCanModify}
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: "7px",
                              border: "1px solid",
                              borderColor: "divider",
                              "&:hover": { bgcolor: "action.hover" },
                            }}
                          >
                            <EditOutlinedIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete Contract" arrow>
                          <IconButton
                            size="small"
                            onClick={() => setDeleteDialogOpen(businessType)}
                            disabled={!effectiveCanModify}
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: "7px",
                              border: "1px solid rgba(239, 68, 68, 0.2)",
                              color: "error.main",
                              "&:hover": { bgcolor: "rgba(239, 68, 68, 0.08)" },
                            }}
                          >
                            <DeleteOutlineOutlinedIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </div>

                    {isExpanded && renderContractDetails(contractData, businessType)}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Contract Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteDialogOpen}
        onOpenChange={(open) => !open && setDeleteDialogOpen(null)}
        title={`Delete ${deleteDialogOpen} Contract`}
        description={`Are you sure you want to delete the ${deleteDialogOpen} contract configuration for this client? This action will remove all recorded pricing parameters and documents.`}
        confirmText="Delete Contract"
        cancelText="Cancel"
        onConfirm={handleDeleteContract}
        loading={isDeleting}
        disabled={!effectiveCanModify}
        confirmVariant="destructive"
      />

      {/* Renew Contract Modal */}
      <Dialog
        open={!!renewDialogOpen}
        onOpenChange={(open) => !open && setRenewDialogOpen(null)}
      >
        <DialogContent className="max-w-md w-full p-5 bg-card border border-border rounded-xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <AutorenewOutlinedIcon sx={{ fontSize: 18 }} />
              </div>
              Renew {renewDialogOpen} Contract
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 my-2 text-xs">
            <p className="text-muted-foreground leading-relaxed">
              This action will mark the current contract cycle as completed and calculate the next renewal date based on the configured cycle frequency.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="renewNotes" className="text-xs font-semibold">
                Renewal Notes & Revisions
              </Label>
              <Textarea
                id="renewNotes"
                placeholder="Enter notes for this renewal cycle (e.g. Annual rate revision, scope addition, client approval reference)..."
                value={renewNotes}
                onChange={(e) => setRenewNotes(e.target.value)}
                className="min-h-[90px] text-xs resize-none rounded-lg border-border/80"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2 justify-end pt-2">
            <MuiButton
              variant="outlined"
              size="small"
              onClick={() => {
                setRenewDialogOpen(null);
                setRenewNotes("");
              }}
              disabled={renewContractMutation.isPending}
              sx={{ textTransform: "none", fontSize: "0.75rem", fontWeight: 600, borderRadius: "8px" }}
            >
              Cancel
            </MuiButton>
            <MuiButton
              variant="contained"
              size="small"
              onClick={handleRenewContract}
              disabled={renewContractMutation.isPending}
              sx={{
                textTransform: "none",
                fontSize: "0.75rem",
                fontWeight: 700,
                borderRadius: "8px",
                bgcolor: "#059669",
                "&:hover": { bgcolor: "#047857" },
              }}
            >
              {renewContractMutation.isPending ? "Renewing..." : "Confirm Renewal"}
            </MuiButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
