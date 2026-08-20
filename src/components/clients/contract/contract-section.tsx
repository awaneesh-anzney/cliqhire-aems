"use client";

import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Calendar,
  Edit,
  Trash2,
  Plus,
  Building2,
  Users,
  Briefcase,
  ShieldCheck,
  Code2,
  UserCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  FileCheck,
  History,
  ExternalLink,
  Sparkles,
  Search,
  RefreshCcw,
  BadgePercent,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useQueryClient } from "@tanstack/react-query";

interface ContractSectionProps {
  clientId: string;
  clientData?: any;
}

// Mapping between line of business and contract object keys
const CONTRACT_MAPPING = {
  Recruitment: "businessContractRQT",
  "HR Managed Services": "businessContractHMS",
  "IT & Technology": "businessContractIT",
  "Mgt Consulting": "consultingContractMGTC",
  "HR Consulting": "consultingContractHRC",
  Outsourcing: "outsourcingContract",
};

// Mapping between level type names from backend and object keys
const LEVEL_TYPE_MAPPING: { [key: string]: string } = {
  "Non-Executives": "nonExecutives",
  Executives: "executives",
  "Senior Level": "seniorLevel",
  Other: "other",
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
        className:
          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 ring-emerald-500/10",
        dotColor: "bg-emerald-500",
      };
    case "RENEWAL_OVERDUE":
      return {
        label: "Renewal Overdue",
        className:
          "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 ring-red-500/10 animate-pulse",
        dotColor: "bg-red-500",
      };
    case "RENEWAL_SOON":
      return {
        label: "Renewal Soon",
        className:
          "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 ring-orange-500/10",
        dotColor: "bg-orange-500",
      };
    case "RENEWAL_DUE":
      return {
        label: "Renewal Due",
        className:
          "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 ring-amber-500/10",
        dotColor: "bg-amber-500",
      };
    case "EXPIRED":
      return {
        label: "Expired",
        className:
          "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 ring-red-500/10",
        dotColor: "bg-red-500",
      };
    case "EXPIRING_SOON":
      return {
        label: "Expiring Soon",
        className:
          "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 ring-orange-500/10",
        dotColor: "bg-orange-500",
      };
    case "EXPIRY_WARNING":
      return {
        label: "Expiry Warning",
        className:
          "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 ring-amber-500/10",
        dotColor: "bg-amber-500",
      };
    default:
      return {
        label: "Active",
        className:
          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 ring-emerald-500/10",
        dotColor: "bg-emerald-500",
      };
  }
};

// Helper function to get service icon and theme styling
const getServiceConfig = (businessType: string) => {
  switch (businessType) {
    case "Recruitment":
      return {
        icon: Users,
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20",
      };
    case "HR Managed Services":
      return {
        icon: ShieldCheck,
        color: "text-indigo-600 dark:text-indigo-400",
        bgColor: "bg-indigo-500/10",
        borderColor: "border-indigo-500/20",
      };
    case "IT & Technology":
      return {
        icon: Code2,
        color: "text-purple-600 dark:text-purple-400",
        bgColor: "bg-purple-500/10",
        borderColor: "border-purple-500/20",
      };
    case "Mgt Consulting":
      return {
        icon: Briefcase,
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/20",
      };
    case "HR Consulting":
      return {
        icon: UserCheck,
        color: "text-teal-600 dark:text-teal-400",
        bgColor: "bg-teal-500/10",
        borderColor: "border-teal-500/20",
      };
    case "Outsourcing":
      return {
        icon: Building2,
        color: "text-amber-600 dark:text-amber-400",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/20",
      };
    default:
      return {
        icon: FileText,
        color: "text-primary",
        bgColor: "bg-primary/10",
        borderColor: "border-primary/20",
      };
  }
};

// Helper function to get form type based on business type
const getFormType = (businessType: string) => {
  if (
    ["Recruitment", "HR Managed Services", "IT & Technology"].includes(
      businessType
    )
  ) {
    return "business";
  }
  if (["Mgt Consulting", "HR Consulting"].includes(businessType)) {
    return "consulting";
  }
  if (businessType === "Outsourcing") {
    return "outsourcing";
  }
  return "business"; // default
};

export function ContractSection({
  clientId,
  clientData,
  canModify = true,
}: ContractSectionProps & { canModify?: boolean }) {
  const [expandedContract, setExpandedContract] = useState<string | null>(
    null
  );
  const [editDialogOpen, setEditDialogOpen] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(
    null
  );
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
  const queryClient = useQueryClient();
  const router = useRouter();

  const isSubmitting = updateContractMutation.isPending;
  const isDeleting = deleteContractMutation.isPending;

  // Use contracts from the new API if available, fallback to clientData
  const contractsObj =
    contractsQuery.data?.data || clientData?.contracts || {};

  // Function to map contract data to form data structure
  const mapContractDataToFormData = (
    contractData: any,
    businessType: string
  ) => {
    const formType = getFormType(businessType);
    if (formType === "business") {
      return {
        contractStartDate: contractData?.contractStartDate
          ? new Date(contractData.contractStartDate)
          : null,
        contractEndDate: contractData?.contractEndDate
          ? new Date(contractData.contractEndDate)
          : null,
        endDateType: contractData?.endDateType || "fixed",
        renewalPeriod: contractData?.renewalPeriod || "",
        contractType:
          contractData?.contractType || contractData?.ContractType || "",
        fixedPercentage: contractData?.fixedPercentage || 0,
        advanceMoneyCurrency: contractData?.advanceMoneyCurrency || "SAR",
        advanceMoneyAmount: contractData?.advanceMoneyAmount || 0,
        fixedPercentageAdvanceNotes:
          contractData?.fixedPercentageAdvanceNotes || "",
        contractDocument: contractData?.contractDocument || null,
        fixWithoutAdvanceValue: contractData?.fixWithoutAdvanceValue || 0,
        fixWithoutAdvanceNotes: contractData?.fixWithoutAdvanceNotes || "",
        levelBasedHiring: contractData?.levelBasedHiring || {
          levelTypes: [],
          seniorLevel: { percentage: 0, notes: "", amount: 0, currency: "SAR" },
          executives: { percentage: 0, notes: "", amount: 0, currency: "SAR" },
          nonExecutives: {
            percentage: 0,
            notes: "",
            amount: 0,
            currency: "SAR",
          },
          other: { percentage: 0, notes: "", amount: 0, currency: "SAR" },
        },
        levelBasedAdvanceHiring: contractData?.levelBasedAdvanceHiring || {
          levelTypes: [],
          seniorLevel: { percentage: 0, notes: "", amount: 0, currency: "SAR" },
          executives: { percentage: 0, notes: "", amount: 0, currency: "SAR" },
          nonExecutives: {
            percentage: 0,
            notes: "",
            amount: 0,
            currency: "SAR",
          },
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
        technicalProposalDocument =
          contractData?.technicalProposalDocument || null;
        financialProposalDocument =
          contractData?.financialProposalDocument || null;
      }

      return {
        contractStartDate: contractData?.contractStartDate
          ? new Date(contractData.contractStartDate)
          : null,
        contractEndDate: contractData?.contractEndDate
          ? new Date(contractData.contractEndDate)
          : null,
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
        contractStartDate: contractData?.contractStartDate
          ? new Date(contractData.contractStartDate)
          : null,
        contractEndDate: contractData?.contractEndDate
          ? new Date(contractData.contractEndDate)
          : null,
        endDateType: contractData?.endDateType || "fixed",
        renewalPeriod: contractData?.renewalPeriod || "",
        contractType:
          contractData?.ContractType || contractData?.contractType || "",
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
    if (!canModify) return;
    const contractKey =
      CONTRACT_MAPPING[businessType as keyof typeof CONTRACT_MAPPING];
    const contractData = contractsObj[contractKey];
    const mappedData = mapContractDataToFormData(contractData, businessType);
    setFormData(mappedData);
    setEditDialogOpen(businessType);
  };

  const handleFormSubmit = async (updatedFormData: any) => {
    if (!canModify) return;
    if (!editDialogOpen || !clientId) return;

    try {
      const contractKey =
        CONTRACT_MAPPING[editDialogOpen as keyof typeof CONTRACT_MAPPING];
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
    if (!canModify) return;
    if (!deleteDialogOpen || !clientId) return;

    try {
      const contractKey =
        CONTRACT_MAPPING[deleteDialogOpen as keyof typeof CONTRACT_MAPPING];
      await deleteContractMutation.mutateAsync(contractKey);
      setDeleteDialogOpen(null);
    } catch (error) {
      console.error("Failed to delete contract:", error);
    }
  };

  const handleRenewContract = async () => {
    if (!canModify || !renewDialogOpen || !clientId) return;

    try {
      const contractKey =
        CONTRACT_MAPPING[renewDialogOpen as keyof typeof CONTRACT_MAPPING];
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
    if (!canModify) return;
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
      <div className="flex flex-col items-center justify-center p-6 text-center rounded-2xl border border-border bg-card shadow-xs">
        <Clock className="h-8 w-8 animate-spin text-muted-foreground mb-3" />
        <p className="text-sm font-medium text-muted-foreground">
          Loading contract information...
        </p>
      </div>
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
    const contractKey =
      CONTRACT_MAPPING[business as keyof typeof CONTRACT_MAPPING];
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
      <div className="rounded-3xl border border-dashed border-border/80 bg-card/60 p-2  text-center shadow-xs backdrop-blur-sm">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 ring-8 ring-primary/5">
          <FileText className="size-8" />
        </div>
        <h3 className="text-lg font-bold text-foreground tracking-tight">
          No Contracts Configured Yet
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-xs text-muted-foreground leading-relaxed">
          Create and configure formal service agreements, terms, pricing structures, and renewal cycles for {clientData.name}.
        </p>
        <Button
          onClick={handleAddContract}
          disabled={!canModify}
          className="mt-6 shadow-sm gap-2 rounded-xl px-5 h-10 bg-primary hover:bg-primary/90 text-white font-medium"
        >
          <Plus className="size-4" />
          Add First Contract
        </Button>
      </div>
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
      contractType:
        contractData.ContractType ||
        contractData.contractType ||
        "Not specified",
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
        const levelTypes =
          contractData.levelBasedAdvanceHiring?.levelTypes || [];
        summary.details = `${levelTypes.length} Seniority Tiers (With Advance)`;
      }
    } else if (
      contractType === "HR Consulting" ||
      contractType === "Mgt Consulting"
    ) {
      if (contractType === "HR Consulting") {
        summary.hasTechProposal = !!contractData.techProposalDocHRC?.url;
        summary.hasFinProposal = !!contractData.finProposalDocHRC?.url;
        summary.details = `Total Value: ${
          contractData.totalCost || 0
        } ${contractData.salaryCurrency || "SAR"}`;
      } else {
        summary.hasTechProposal = !!contractData.techProposalDocMGTC?.url;
        summary.hasFinProposal = !!contractData.finProposalDocMGTC?.url;
        summary.details = `Total Value: ${
          contractData.totalCost || 0
        } ${contractData.salaryCurrency || "SAR"}`;
      }
    } else if (contractType === "Outsourcing") {
      summary.details = `${
        contractData.numberOfResources || 0
      } Resources Allocated • Total Cost: ${contractData.totalCost || 0} SAR`;
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
      <div className="mt-2 pt-2 border-t border-border/60 space-y-5 animate-in fade-in duration-200">
        
        {/* Core Timeline & Renewal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Contract Model
            </span>
            <p className="text-xs font-semibold text-foreground mt-1">
              {contractData.ContractType || contractData.contractType || "Not specified"}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Start Date
            </span>
            <p className="text-xs font-semibold text-foreground mt-1 flex items-center gap-1.5">
              <Calendar className="size-3.5 text-primary" />
              {formatDate(contractData.contractStartDate)}
            </p>
          </div>
          {!isOpenEnded ? (
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Contract End Date
              </span>
              <p className="text-xs font-semibold text-foreground mt-1 flex items-center gap-1.5">
                <Calendar className="size-3.5 text-muted-foreground" />
                {formatDate(contractData.contractEndDate)}
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Renewal Cycle Frequency
              </span>
              <p className="text-xs font-semibold text-foreground mt-1 flex items-center gap-1.5">
                <RefreshCcw className="size-3.5 text-emerald-500" />
                {RENEWAL_PERIOD_LABELS[contractData.renewalPeriod] ||
                  contractData.renewalPeriod ||
                  "—"}
              </p>
            </div>
          )}
        </div>

        {/* Open Ended Renewal Summary Box */}
        {isOpenEnded && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/5 via-card to-card border border-emerald-500/20 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-center">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Next Renewal Date
                </span>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {formatDate(contractData.nextRenewalDate)}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Last Renewed On
                </span>
                <p className="text-xs font-semibold text-foreground mt-0.5">
                  {formatDate(contractData.lastRenewedAt)}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Completed Cycles
                </span>
                <p className="text-xs font-semibold text-foreground mt-0.5">
                  {contractData.renewalCount || 0} Renewal Cycles
                </p>
              </div>
              <div className="sm:col-span-2 md:col-span-1">
                <Button
                  type="button"
                  onClick={() => setRenewDialogOpen(contractType)}
                  disabled={!canModify}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs h-9 rounded-xl shadow-xs gap-1.5"
                >
                  <Calendar className="size-3.5" />
                  Trigger Contract Renewal
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Commercial Details Breakdown: Recruitment / IT / HR Managed Services */}
        {(contractType === "Recruitment" ||
          contractType === "IT & Technology" ||
          contractType === "HR Managed Services") && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <BadgePercent className="size-3.5 text-primary" />
              Commercial & Pricing Structure
            </h4>

            {/* Fix with Advance */}
            {(contractData.ContractType || contractData.contractType) ===
              "Fix with Advance" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-card border border-border/80 shadow-xs">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Placement Fee Percentage
                  </span>
                  <p className="text-sm font-bold text-primary mt-0.5">
                    {contractData.fixedPercentage || 0}%
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Advance Payment
                  </span>
                  <p className="text-sm font-bold text-foreground mt-0.5">
                    {contractData.advanceMoneyAmount || 0}{" "}
                    {contractData.advanceMoneyCurrency || "SAR"}
                  </p>
                </div>
                <div className="sm:col-span-3 pt-2 border-t border-border/40">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Commercial Notes
                  </span>
                  <p className="text-xs text-muted-foreground italic mt-0.5">
                    {contractData.fixedPercentageAdvanceNotes || "No additional commercial terms notes specified."}
                  </p>
                </div>
              </div>
            )}

            {/* Fix without Advance */}
            {(contractData.ContractType || contractData.contractType) ===
              "Fix without Advance" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-card border border-border/80 shadow-xs">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Fixed Placement Fee
                  </span>
                  <p className="text-sm font-bold text-primary mt-0.5">
                    {contractData.fixWithoutAdvanceValue || 0}%
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Commercial Notes
                  </span>
                  <p className="text-xs text-muted-foreground italic mt-0.5">
                    {contractData.fixWithoutAdvanceNotes || "No notes specified."}
                  </p>
                </div>
              </div>
            )}

            {/* Level Based Hiring */}
            {(contractData.ContractType || contractData.contractType) ===
              "Level Based Hiring" &&
              contractData.levelBasedHiring?.levelTypes?.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {contractData.levelBasedHiring.levelTypes.map(
                    (level: string) => {
                      const levelKey =
                        LEVEL_TYPE_MAPPING[level] ||
                        level.toLowerCase().replace(/[^a-z]/g, "");
                      const levelData =
                        contractData.levelBasedHiring[levelKey] || {};
                      return (
                        <div
                          key={level}
                          className="p-3.5 rounded-xl bg-card border border-border/80 shadow-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs text-foreground">
                              {level}
                            </span>
                            <Badge
                              variant="secondary"
                              className="text-[11px] font-bold text-primary"
                            >
                              {levelData.percentage || 0}% Fee
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <span>Target Amount: </span>
                            <span className="font-medium text-foreground">
                              {levelData.amount || 0}{" "}
                              {levelData.currency || "SAR"}
                            </span>
                          </div>
                          {levelData.notes && (
                            <p className="text-[11px] text-muted-foreground italic border-t border-border/40 pt-1.5">
                              {levelData.notes}
                            </p>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              )}

            {/* Level Based Advance Hiring */}
            {(contractData.ContractType || contractData.contractType) ===
              "Level Based Advance Hiring" &&
              contractData.levelBasedAdvanceHiring?.levelTypes?.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {contractData.levelBasedAdvanceHiring.levelTypes.map(
                    (level: string) => {
                      const levelKey =
                        LEVEL_TYPE_MAPPING[level] ||
                        level.toLowerCase().replace(/[^a-z]/g, "");
                      const levelData =
                        contractData.levelBasedAdvanceHiring[levelKey] || {};
                      return (
                        <div
                          key={level}
                          className="p-3.5 rounded-xl bg-card border border-border/80 shadow-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs text-foreground">
                              {level}
                            </span>
                            <Badge
                              variant="secondary"
                              className="text-[11px] font-bold text-primary"
                            >
                              {levelData.percentage || 0}% Fee
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <span>Advance Amount: </span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {levelData.amount || 0}{" "}
                              {levelData.currency || "SAR"}
                            </span>
                          </div>
                          {levelData.notes && (
                            <p className="text-[11px] text-muted-foreground italic border-t border-border/40 pt-1.5">
                              {levelData.notes}
                            </p>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              )}
          </div>
        )}

        {/* Consulting Specific Details */}
        {(contractType === "HR Consulting" ||
          contractType === "Mgt Consulting") && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <Briefcase className="size-3.5 text-primary" />
              Scope of Work & Commercial Terms
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-card border border-border/80 shadow-xs">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Total Contract Cost
                </span>
                <p className="text-sm font-bold text-primary mt-0.5">
                  {contractData.totalCost || 0}{" "}
                  {contractData.salaryCurrency || "SAR"}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-card border border-border/80 shadow-xs">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Contract Currency
                </span>
                <p className="text-xs font-semibold text-foreground mt-0.5">
                  {contractData.salaryCurrency || "SAR"}
                </p>
              </div>
              {contractType === "HR Consulting" && (
                <div className="p-3.5 rounded-xl bg-card border border-border/80 shadow-xs">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Estimated Hours
                  </span>
                  <p className="text-xs font-semibold text-foreground mt-0.5">
                    {contractData.estimatedHours || "Not specified"}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {contractType === "HR Consulting" ? (
                <>
                  <div className="p-4 rounded-xl bg-card border border-border/80 shadow-xs space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Service Scope
                    </span>
                    <p className="text-xs text-foreground leading-relaxed">
                      {contractData.serviceScope || "No specific scope defined."}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-card border border-border/80 shadow-xs space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Client Contact Person
                    </span>
                    <p className="text-xs font-semibold text-foreground">
                      {contractData.clientContact || "Not specified"}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 rounded-xl bg-card border border-border/80 shadow-xs space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Project Scope
                    </span>
                    <p className="text-xs text-foreground leading-relaxed">
                      {contractData.projectScope || "No project scope defined."}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-card border border-border/80 shadow-xs space-y-2">
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Client Entity / Company
                      </span>
                      <p className="text-xs font-semibold text-foreground">
                        {contractData.clientCompany || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Key Deliverables
                      </span>
                      <p className="text-xs text-foreground leading-relaxed mt-0.5">
                        {contractData.keyDeliverables || "Not specified"}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Outsourcing Details */}
        {contractType === "Outsourcing" && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <Building2 className="size-3.5 text-primary" />
              Outsourcing & Resource Terms
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-card border border-border/80 shadow-xs">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Allocated Resources
                </span>
                <p className="text-sm font-bold text-primary mt-0.5">
                  {contractData.numberOfResources || 0} Staff
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-card border border-border/80 shadow-xs">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Total Contract Cost
                </span>
                <p className="text-sm font-bold text-foreground mt-0.5">
                  {contractData.totalCost || 0} SAR
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-card border border-border/80 shadow-xs">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Service Category
                </span>
                <p className="text-xs font-semibold text-foreground mt-0.5">
                  {contractData.serviceCategory || "Not specified"}
                </p>
              </div>
            </div>
            {contractData.slaTerms && (
              <div className="p-4 rounded-xl bg-card border border-border/80 shadow-xs space-y-1">
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
          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
            <FileCheck className="size-3.5 text-primary" />
            Contract Documents & Attachments
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Standard Contract Document */}
            {contractData.contractDocument?.url && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/80 shadow-xs hover:border-primary/40 transition-all group">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                    <FileText className="size-4" />
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(contractData.contractDocument.url, "_blank")
                  }
                  className="h-8 text-xs gap-1 rounded-lg shrink-0"
                >
                  <ExternalLink className="size-3" />
                  View
                </Button>
              </div>
            )}

            {/* Consulting Technical Proposal */}
            {(contractData.techProposalDocHRC?.url ||
              contractData.techProposalDocMGTC?.url) && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/80 shadow-xs hover:border-primary/40 transition-all group">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <FileText className="size-4" />
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(
                      contractData.techProposalDocHRC?.url ||
                        contractData.techProposalDocMGTC?.url,
                      "_blank"
                    )
                  }
                  className="h-8 text-xs gap-1 rounded-lg shrink-0"
                >
                  <ExternalLink className="size-3" />
                  View
                </Button>
              </div>
            )}

            {/* Consulting Financial Proposal */}
            {(contractData.finProposalDocHRC?.url ||
              contractData.finProposalDocMGTC?.url) && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/80 shadow-xs hover:border-primary/40 transition-all group">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <FileText className="size-4" />
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(
                      contractData.finProposalDocHRC?.url ||
                        contractData.finProposalDocMGTC?.url,
                      "_blank"
                    )
                  }
                  className="h-8 text-xs gap-1 rounded-lg shrink-0"
                >
                  <ExternalLink className="size-3" />
                  View
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Renewal History Timeline */}
        {isOpenEnded &&
          contractData.renewalHistory &&
          contractData.renewalHistory.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                <History className="size-3.5 text-emerald-500" />
                Renewal Audit History
              </h4>
              <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/60 text-muted-foreground uppercase tracking-wider text-[10px] font-semibold border-b border-border/60">
                      <tr>
                        <th className="px-4 py-3">Renewed Date</th>
                        <th className="px-4 py-3">Cycle Start</th>
                        <th className="px-4 py-3">Cycle End</th>
                        <th className="px-4 py-3">Renewal Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 text-foreground">
                      {contractData.renewalHistory.map(
                        (historyItem: any, index: number) => (
                          <tr
                            key={index}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">
                              {formatDate(historyItem.renewedAt)}
                            </td>
                            <td className="px-4 py-3">
                              {formatDate(
                                historyItem.newCycleStart ||
                                  historyItem.previousNextRenewalDate
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {formatDate(
                                historyItem.newCycleEnd ||
                                  historyItem.newNextRenewalDate
                              )}
                            </td>
                            <td
                              className="px-4 py-3 text-muted-foreground font-medium max-w-[220px] truncate"
                              title={historyItem.notes}
                            >
                              {historyItem.notes || "Standard Renewal"}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {/* Portfolio Overview & Actions Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* KPI Card 1: Active Contracts */}
        <div className="rounded-2xl border border-border/80 bg-card/90 p-4 shadow-xs backdrop-blur-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Total Contracts
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                {availableContracts.length}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {activeCount} Active
              </span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-primary/10 text-primary">
            <FileText className="size-5" />
          </div>
        </div>

        {/* KPI Card 2: Renewal & Expiry Status */}
        <div className="rounded-2xl border border-border/80 bg-card/90 p-4 shadow-xs backdrop-blur-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Lifecycle Alerts
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl font-bold ${
                  warningCount > 0
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-foreground"
                }`}
              >
                {warningCount}
              </span>
              <span className="text-xs text-muted-foreground">
                {warningCount === 0
                  ? "All contracts healthy"
                  : "Requires attention"}
              </span>
            </div>
          </div>
          <div
            className={`p-3 rounded-2xl ${
              warningCount > 0
                ? "bg-amber-500/10 text-amber-500"
                : "bg-emerald-500/10 text-emerald-500"
            }`}
          >
            {warningCount > 0 ? (
              <AlertTriangle className="size-5" />
            ) : (
              <CheckCircle2 className="size-5" />
            )}
          </div>
        </div>

        {/* KPI Card 3: Action & Quick Filter */}
        <div className="rounded-2xl border border-border/80 bg-card/90 p-4 shadow-xs backdrop-blur-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Management
            </span>
            <p className="text-xs text-muted-foreground">
              Configure contract parameters
            </p>
          </div>
          <Button
            onClick={handleAddContract}
            disabled={!canModify}
            className="shadow-xs gap-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium text-xs px-4 h-9"
          >
            <Plus className="size-4" />
            Add Contract
          </Button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-card p-2 rounded-2xl border border-border/80 shadow-xs">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search contracts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl border-border/60 bg-muted/30 focus-visible:bg-background"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Button
            variant={selectedTab === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedTab("all")}
            className="h-8 text-xs rounded-lg font-medium px-3"
          >
            All ({availableContracts.length})
          </Button>
          <Button
            variant={selectedTab === "open-ended" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedTab("open-ended")}
            className="h-8 text-xs rounded-lg font-medium px-3"
          >
            Open-Ended
          </Button>
          <Button
            variant={selectedTab === "fixed" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedTab("fixed")}
            className="h-8 text-xs rounded-lg font-medium px-3"
          >
            Fixed Term
          </Button>
        </div>
      </div>

      {/* Contract Cards Grid */}
      <div className="space-y-4">
        {filteredContracts.map((businessType: string) => {
          const contractKey =
            CONTRACT_MAPPING[businessType as keyof typeof CONTRACT_MAPPING];
          const contractData = contractsObj[contractKey];
          const summary = getContractSummary(contractData, businessType);
          const serviceCfg = getServiceConfig(businessType);
          const ServiceIcon = serviceCfg.icon;
          const isExpanded = expandedContract === businessType;
          const isEditing = editDialogOpen === businessType;

          return (
            <div
              key={businessType}
              className={`rounded-2xl border bg-card transition-all duration-200 shadow-xs hover:shadow-md overflow-hidden ${
                isExpanded ? "border-primary/40 ring-1 ring-primary/20" : "border-border/80"
              }`}
            >
              <div className="p-5">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-3 mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-2 rounded-xl ${serviceCfg.bgColor} ${serviceCfg.color}`}
                        >
                          <ServiceIcon className="size-4" />
                        </div>
                        <h3 className="text-base font-bold text-foreground">
                          Edit {businessType} Contract
                        </h3>
                      </div>
                    </div>
                    {renderEditForm(businessType)}
                    <div className="flex justify-end space-x-2 pt-4 border-t border-border/60">
                      <Button
                        variant="outline"
                        onClick={() => setEditDialogOpen(null)}
                        disabled={isSubmitting}
                        className="rounded-xl h-9 text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleFormSubmit(formData)}
                        disabled={isSubmitting || !canModify}
                        className="rounded-xl h-9 text-xs bg-primary hover:bg-primary/90 text-white font-medium"
                      >
                        {isSubmitting ? "Saving Changes..." : "Save Contract"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      
                      {/* Left Contract Category Identity & Status */}
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div
                          className={`p-3 rounded-2xl ${serviceCfg.bgColor} ${serviceCfg.color} border ${serviceCfg.borderColor} shrink-0`}
                        >
                          <ServiceIcon className="size-5" />
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold text-foreground tracking-tight">
                              {businessType} Contract
                            </h3>

                            {summary?.contractType && (
                              <Badge
                                variant="secondary"
                                className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                              >
                                {summary.contractType}
                              </Badge>
                            )}

                            {contractData && (() => {
                              const status = getContractStatus(contractData);
                              const badgeConfig = getStatusBadgeConfig(status);
                              return (
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 border ${badgeConfig.className}`}
                                >
                                  <span
                                    className={`size-1.5 rounded-full ${badgeConfig.dotColor}`}
                                  />
                                  {badgeConfig.label}
                                </Badge>
                              );
                            })()}
                          </div>

                          {summary?.details && (
                            <p className="text-xs font-medium text-foreground/90">
                              {summary.details}
                            </p>
                          )}

                          {/* Quick Info Badges */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs text-muted-foreground">
                            <div className="flex items-center space-x-1.5">
                              <Calendar className="size-3.5 text-muted-foreground/70" />
                              <span>
                                {summary?.endDateType === "open-ended"
                                  ? `Open-Ended • Started ${formatDate(
                                      summary.startDate
                                    )}`
                                  : summary?.startDate
                                  ? `${formatDate(
                                      summary.startDate
                                    )} to ${formatDate(summary.endDate)}`
                                  : "Duration not set"}
                              </span>
                            </div>

                            {summary?.endDateType === "open-ended" &&
                              summary?.nextRenewalDate && (
                                <div className="flex items-center space-x-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20 text-[10px] font-bold">
                                  <Clock className="size-3" />
                                  <span>
                                    Next Renewal:{" "}
                                    {formatDate(summary.nextRenewalDate)}
                                  </span>
                                </div>
                              )}

                            {summary?.hasDocument && (
                              <div className="flex items-center space-x-1 text-primary">
                                <FileCheck className="size-3.5" />
                                <span className="font-medium text-[11px]">
                                  Document Attached
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Button Controls */}
                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShowDetails(businessType)}
                          className="text-xs font-semibold h-8 rounded-xl gap-1 hover:bg-muted"
                        >
                          {isExpanded ? "Hide Details" : "View Details"}
                          <ChevronRight
                            className={`size-4 transition-transform duration-200 ${
                              isExpanded ? "rotate-90" : ""
                            }`}
                          />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditContract(businessType)}
                          disabled={!canModify}
                          className="text-xs h-8 rounded-xl gap-1 border-border/80"
                        >
                          <Edit className="size-3.5" />
                          Edit
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteDialogOpen(businessType)}
                          disabled={!canModify}
                          className="text-xs h-8 rounded-xl gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>

                    {isExpanded &&
                      renderContractDetails(contractData, businessType)}
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
        disabled={!canModify}
        confirmVariant="destructive"
      />

      {/* Renew Contract Modal */}
      <Dialog
        open={!!renewDialogOpen}
        onOpenChange={(open) => !open && setRenewDialogOpen(null)}
      >
        <DialogContent className="max-w-md w-full p-6 bg-card border border-border rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Calendar className="size-5" />
              </div>
              Renew {renewDialogOpen} Contract
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 my-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              This action will mark the current contract cycle as completed and calculate the next renewal date based on the configured cycle frequency.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="renewNotes" className="text-xs font-semibold">
                Renewal Notes & Term Revisions
              </Label>
              <Textarea
                id="renewNotes"
                placeholder="Enter any notes for this renewal cycle (e.g. Annual rate revision, scope addition, client approval reference)..."
                value={renewNotes}
                onChange={(e) => setRenewNotes(e.target.value)}
                className="min-h-[100px] text-xs resize-none rounded-xl border-border/80 focus-visible:ring-emerald-500"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2 justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setRenewDialogOpen(null);
                setRenewNotes("");
              }}
              disabled={renewContractMutation.isPending}
              className="rounded-xl h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenewContract}
              disabled={renewContractMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl h-9 text-xs shadow-xs"
            >
              {renewContractMutation.isPending
                ? "Renewing Contract..."
                : "Confirm Renewal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

