"use client";

import { useState } from "react";
import { ChevronRight, FileText, Calendar, Edit, Trash2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
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
  return "business"; // default
};

export function ContractSection({ clientId, clientData, canModify = true }: ContractSectionProps & { canModify?: boolean }) {
  const [expandedContract, setExpandedContract] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);

  const { contractsQuery, updateContractMutation, deleteContractMutation } = useClientContracts(clientId);
  const queryClient = useQueryClient();
  const router = useRouter();
  
  const isSubmitting = updateContractMutation.isPending;
  const isDeleting = deleteContractMutation.isPending;
  
  // Use contracts from the new API if available, fallback to clientData
  const contractsObj = contractsQuery.data?.data || clientData?.contracts || {};

  // Function to map contract data to form data structure
  const mapContractDataToFormData = (contractData: any, businessType: string) => {
    const formType = getFormType(businessType);
    if (formType === "business") {
      return {
        contractStartDate: contractData?.contractStartDate
          ? new Date(contractData.contractStartDate)
          : null,
        contractEndDate: contractData?.contractEndDate
          ? new Date(contractData.contractEndDate)
          : null,
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
      // Map documents based on specific consulting type
      let technicalProposalDocument = null;
      let financialProposalDocument = null;

      if (businessType === "HR Consulting") {
        technicalProposalDocument = contractData?.techProposalDocHRC || null;
        financialProposalDocument = contractData?.finProposalDocHRC || null;
      } else if (businessType === "Mgt Consulting") {
        technicalProposalDocument = contractData?.techProposalDocMGTC || null;
        financialProposalDocument = contractData?.finProposalDocMGTC || null;
      } else {
        // Fallback for generic consulting contracts
        technicalProposalDocument = contractData?.technicalProposalDocument || null;
        financialProposalDocument = contractData?.financialProposalDocument || null;
      }

      // Create mapped data with all necessary fields
      const mappedData = {
        // Core contract fields
        contractStartDate: contractData?.contractStartDate
          ? new Date(contractData.contractStartDate)
          : null,
        contractEndDate: contractData?.contractEndDate
          ? new Date(contractData.contractEndDate)
          : null,
        
        contractType: contractData?.contractType || "",
        salaryCurrency: contractData?.salaryCurrency || "SAR",

        // HRC Specific
        serviceScope: contractData?.serviceScope || "",
        clientContact: contractData?.clientContact || "",
        estimatedHours: contractData?.estimatedHours || "",
        
        // MGTC Specific
        projectScope: contractData?.projectScope || "",
        clientCompany: contractData?.clientCompany || "",
        keyDeliverables: contractData?.keyDeliverables || "",

        // Proposal notes
        technicalProposalNotes: contractData?.technicalProposalNotes || "",
        financialProposalNotes: contractData?.financialProposalNotes || "",

        // Proposal documents
        technicalProposalDocument,
        financialProposalDocument,

        // Total Cost (used by both)
        totalCost: contractData?.totalCost || 0,

        // Preserve metadata
        ...(contractData?._id && { _id: contractData._id }),
        ...(contractData?.createdAt && { createdAt: contractData.createdAt }),
        ...(contractData?.updatedAt && { updatedAt: contractData.updatedAt }),
      };
      return mappedData;
    }

    if (formType === "outsourcing") {
      return {
        contractStartDate: contractData?.contractStartDate
          ? new Date(contractData.contractStartDate)
          : null,
        contractEndDate: contractData?.contractEndDate
          ? new Date(contractData.contractEndDate)
          : null,
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
    if (!canModify) return;
    const contractKey = CONTRACT_MAPPING[businessType as keyof typeof CONTRACT_MAPPING];
    const contractData = contractsObj[contractKey];
    const mappedData = mapContractDataToFormData(contractData, businessType);
    setFormData(mappedData);
    setEditDialogOpen(businessType);
  };

  const handleFormSubmit = async (updatedFormData: any) => {
    if (!canModify) return;
    if (!editDialogOpen || !clientId) return;

    try {
      const contractKey = CONTRACT_MAPPING[editDialogOpen as keyof typeof CONTRACT_MAPPING];
      await updateContractMutation.mutateAsync({ contractType: contractKey, contractData: updatedFormData });
      setEditDialogOpen(null);
    } catch (error) {
      console.error("Failed to update contract:", error);
    }
  };

  const handleDeleteContract = async () => {
    if (!canModify) return;
    if (!deleteDialogOpen || !clientId) return;

    try {
      const contractKey = CONTRACT_MAPPING[deleteDialogOpen as keyof typeof CONTRACT_MAPPING];
      await deleteContractMutation.mutateAsync(contractKey);
      setDeleteDialogOpen(null);
    } catch (error) {
      console.error("Failed to delete contract:", error);
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
      return <ConsultingForm businessType={businessType} formData={formData} setFormData={setFormData} />;
    }

    if (formType === "outsourcing") {
      return <OutsourcingForm formData={formData} setFormData={setFormData} />;
    }

    return null;
  };

  if (!clientData) {
    return <div className="text-center py-8 text-muted-foreground">Loading contract information...</div>;
  }

  // Get line of business array
  const lineOfBusiness = clientData.lineOfBusiness || [];

  // Determine available contracts from both lineOfBusiness and actual contracts present
  const contractsBusinessTypes = Object.keys(contractsObj)
    .map((key) => {
      const found = Object.entries(CONTRACT_MAPPING).find(([, mappedKey]) => mappedKey === key);
      return found ? found[0] : undefined;
    })
    .filter((v): v is string => Boolean(v));

  const lobArray = Array.isArray(lineOfBusiness) ? lineOfBusiness : [];
  const lobWithExistingContracts = lobArray.filter((business: string) => {
    const contractKey = CONTRACT_MAPPING[business as keyof typeof CONTRACT_MAPPING];
    return !!(contractKey && contractsObj[contractKey]);
  });

  const availableContracts = Array.from(new Set([...lobWithExistingContracts, ...contractsBusinessTypes]));

  if (availableContracts.length === 0) {
    return (
      <>
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm">No contract information available</p>
          <p className="text-xs text-muted-foreground mt-1">
            Contract details will appear here once configured
          </p>
          <Button onClick={handleAddContract} className="mt-4 flex items-center gap-2 mx-auto">
            <Plus className="h-4 w-4" />
            Add Contract
          </Button>
        </div>
      </>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getContractSummary = (contractData: any, contractType: string) => {
    if (!contractData) return null;

    // Common contract info with all possible properties
    const summary: {
      contractType?: string;
      ContractType?: string;
      startDate?: string;
      endDate?: string;
      hasDocument: boolean;
      details?: string;
      hasTechProposal?: boolean;
      hasFinProposal?: boolean;
    } = {
      contractType: contractData.ContractType || contractData.contractType || "Not specified",
      startDate: contractData.contractStartDate,
      endDate: contractData.contractEndDate,
      hasDocument: !!contractData.contractDocument?.url,
    };

    // Add specific details based on contract type
    if (
      contractType === "Recruitment" ||
      contractType === "IT & Technology" ||
      contractType === "HR Managed Services"
    ) {
      const type = contractData.contractType || contractData.ContractType;
      if (type === "Fix with Advance") {
        summary.details = `${contractData.fixedPercentage || 0}% + ${contractData.advanceMoneyAmount || 0} ${contractData.advanceMoneyCurrency || "SAR"}`;
      } else if (type === "Fix without Advance") {
        summary.details = `${contractData.fixWithoutAdvanceValue || 0}%`;
      } else if (type === "Level Based Hiring") {
        const levelTypes = contractData.levelBasedHiring?.levelTypes || [];
        summary.details = `${levelTypes.length} levels configured`;
      } else if (type === "Level Based Advance Hiring") {
        const levelTypes = contractData.levelBasedAdvanceHiring?.levelTypes || [];
        summary.details = `${levelTypes.length} levels with advance`;
      }
    } else if (contractType === "HR Consulting" || contractType === "Mgt Consulting") {
      if (contractType === "HR Consulting") {
        summary.hasTechProposal = !!contractData.techProposalDocHRC?.url;
        summary.hasFinProposal = !!contractData.finProposalDocHRC?.url;
      } else {
        summary.hasTechProposal = !!contractData.techProposalDocMGTC?.url;
        summary.hasFinProposal = !!contractData.finProposalDocMGTC?.url;
      }
    } else if (contractType === "Outsourcing") {
      summary.details = `${contractData.numberOfResources || 0} resources - ${contractData.totalCost || 0} total cost`;
    }

    return summary;
  };

  const handleShowDetails = (contractType: string) => {
    setExpandedContract(expandedContract === contractType ? null : contractType);
  };

  const renderContractDetails = (contractData: any, contractType: string) => {
    if (!contractData) return null;

    return (
      <div className="p-2 bg-muted rounded-lg border space-y-3">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-foreground">Contract Type:</span>
            <p className="text-foreground">
              {contractData.ContractType || contractData.contractType || "Not specified"}
            </p>
          </div>
          <div>
            <span className="font-medium text-foreground">Duration:</span>
            <p className="text-foreground">
              {formatDate(contractData.contractStartDate)} -{" "}
              {formatDate(contractData.contractEndDate)}
            </p>
          </div>
        </div>

        {/* Recruitment/IT specific details */}
        {(contractType === "Recruitment" ||
          contractType === "IT & Technology" ||
          contractType === "HR Managed Services") && (
            <div className="space-y-4">
              {/* Fix with Advance */}
              {((contractData.ContractType || contractData.contractType) === "Fix with Advance") && (
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-foreground">Fixed Percentage:</span>
                    <p className="text-foreground">{contractData.fixedPercentage || 0}%</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Advance Amount:</span>
                    <p className="text-foreground">
                      {contractData.advanceMoneyAmount || 0}{" "}
                      {contractData.advanceMoneyCurrency || "SAR"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Notes:</span>
                    <p className="text-foreground">
                      {contractData.fixedPercentageAdvanceNotes || "No notes"}
                    </p>
                  </div>
                </div>
              )}

              {/* Fix without Advance */}
              {((contractData.ContractType || contractData.contractType) === "Fix without Advance") && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-foreground">Fixed Percentage:</span>
                    <p className="text-foreground">{contractData.fixWithoutAdvanceValue || 0}%</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Notes:</span>
                    <p className="text-foreground">
                      {contractData.fixWithoutAdvanceNotes || "No notes"}
                    </p>
                  </div>
                </div>
              )}

              {/* Level Based Hiring */}
              {((contractData.ContractType || contractData.contractType) === "Level Based Hiring") &&
                contractData.levelBasedHiring?.levelTypes?.length > 0 && (
                  <div>
                    <span className="font-medium text-foreground">Level Configuration:</span>
                    <div className="mt-2 space-y-1">
                      {contractData.levelBasedHiring.levelTypes.map((level: string) => {
                        const levelKey =
                          LEVEL_TYPE_MAPPING[level] || level.toLowerCase().replace(/[^a-z]/g, "");
                        const levelData = contractData.levelBasedHiring[levelKey] || {};
                        return (
                          <div key={level} className="text-sm grid grid-cols-2 gap-4 bg-card p-3 rounded-md border border-border shadow-sm mb-2">
                            <div>
                              <p className="font-medium text-foreground">Level Type:</p>
                              <p className="font-semibold text-foreground">{level}</p>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">Percentage:</p>
                              <p className="text-brand font-bold">{levelData.percentage || 0}%</p>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">Amount:</p>
                              <p>{levelData.amount || 0} {levelData.currency || "SAR"}</p>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">Notes:</p>
                              <p className="text-xs text-muted-foreground italic">{levelData.notes || "No notes"}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* Level Based Advance Hiring */}
              {((contractData.ContractType || contractData.contractType) === "Level Based Advance Hiring") &&
                contractData.levelBasedAdvanceHiring?.levelTypes?.length > 0 && (
                  <div>
                    <span className="font-medium text-foreground">
                      Level Configuration (With Advance):
                    </span>
                    <div className="mt-2 space-y-1">
                      {contractData.levelBasedAdvanceHiring.levelTypes.map((level: string) => {
                        const levelKey =
                          LEVEL_TYPE_MAPPING[level] || level.toLowerCase().replace(/[^a-z]/g, "");
                        const levelData = contractData.levelBasedAdvanceHiring[levelKey] || {};
                        return (
                          <div key={level} className="text-sm grid grid-cols-3 gap-4 bg-card p-3 rounded-md border border-border shadow-sm mb-2">
                            <div>
                              <p className="font-medium text-foreground">Level Type:</p>
                              <p className="font-semibold text-foreground">{level}</p>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">Percentage:</p>
                              <p className="text-brand font-bold">{levelData.percentage || 0}%</p>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">Amount:</p>
                              <p className="font-semibold text-brand-600">
                                {levelData.amount || 0} {levelData.currency || "SAR"}
                              </p>
                            </div>
                            <div className="col-span-3 mt-1">
                              <p className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider">Notes:</p>
                              <p className="text-xs text-muted-foreground italic">{levelData.notes || "No notes"}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
            </div>
          )}

        {/* Consulting specific details */}
        {(contractType === "HR Consulting" || contractType === "Mgt Consulting") && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-card p-3 rounded-md border border-border shadow-sm">
                <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Currency</span>
                <p className="text-foreground font-medium">{contractData.salaryCurrency || "SAR"}</p>
              </div>
              <div className="bg-card p-3 rounded-md border border-border shadow-sm">
                <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Total Cost</span>
                <p className="text-foreground font-medium">{contractData.totalCost || 0} {contractData.salaryCurrency || "SAR"}</p>
              </div>
              {contractType === "HR Consulting" && (
                <div className="bg-card p-3 rounded-md border border-border shadow-sm">
                  <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Est. Hours</span>
                  <p className="text-foreground font-medium">{contractData.estimatedHours || "Not specified"}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {contractType === "HR Consulting" ? (
                <>
                  <div className="bg-card p-3 rounded-md border border-border shadow-sm">
                    <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Service Scope</span>
                    <p className="text-foreground mt-1">{contractData.serviceScope || "No scope defined"}</p>
                  </div>
                  <div className="bg-card p-3 rounded-md border border-border shadow-sm">
                    <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Client Contact</span>
                    <p className="text-foreground mt-1">{contractData.clientContact || "Not specified"}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-card p-3 rounded-md border border-border shadow-sm">
                    <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Project Scope</span>
                    <p className="text-foreground mt-1">{contractData.projectScope || "No scope defined"}</p>
                  </div>
                  <div className="bg-card p-3 rounded-md border border-border shadow-sm space-y-3">
                    <div>
                      <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Client Company</span>
                      <p className="text-foreground">{contractData.clientCompany || "Not specified"}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Key Deliverables</span>
                      <p className="text-foreground">{contractData.keyDeliverables || "Not specified"}</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-muted p-3 rounded-md border border-border">
                <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Technical Proposal Notes</span>
                <p className="text-foreground mt-1 italic">{contractData.technicalProposalNotes || "No notes"}</p>
              </div>
              <div className="bg-muted p-3 rounded-md border border-border">
                <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Financial Proposal Notes</span>
                <p className="text-foreground mt-1 italic">{contractData.financialProposalNotes || "No notes"}</p>
              </div>
            </div>
          </div>
        )}

        {/* HR Consulting Contract Documents */}
        {contractType === "HR Consulting" && (
          <div className="space-y-2">
            {contractData.techProposalDocHRC?.url && (
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      Technical Proposal Document:
                    </span>
                    <span className="text-sm text-foreground">
                      {contractData.techProposalDocHRC.fileName || "Technical Proposal"}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(contractData.techProposalDocHRC.url, "_blank")}
                  >
                    View
                  </Button>
                </div>
              </div>
            )}

            {contractData.finProposalDocHRC?.url && (
              <div className={contractData.techProposalDocHRC?.url ? "pt-2" : "pt-2 border-t"}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      Financial Proposal Document:
                    </span>
                    <span className="text-sm text-foreground">
                      {contractData.finProposalDocHRC.fileName || "Financial Proposal"}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(contractData.finProposalDocHRC.url, "_blank")}
                  >
                    View
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mgt Consulting Contract Documents */}
        {contractType === "Mgt Consulting" && (
          <div className="space-y-2">
            {contractData.techProposalDocMGTC?.url && (
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      Technical Proposal Document:
                    </span>
                    <span className="text-sm text-foreground">
                      {contractData.techProposalDocMGTC.fileName || "Technical Proposal"}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(contractData.techProposalDocMGTC.url, "_blank")}
                  >
                    View
                  </Button>
                </div>
              </div>
            )}

            {contractData.finProposalDocMGTC?.url && (
              <div className={contractData.techProposalDocMGTC?.url ? "pt-2" : "pt-2 border-t"}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      Financial Proposal Document:
                    </span>
                    <span className="text-sm text-foreground">
                      {contractData.finProposalDocMGTC.fileName || "Financial Proposal"}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(contractData.finProposalDocMGTC.url, "_blank")}
                  >
                    View
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Outsourcing specific details */}
        {contractType === "Outsourcing" && (
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-foreground">Resources:</span>
              <p className="text-foreground">{contractData.numberOfResources || 0}</p>
            </div>
            <div>
              <span className="font-medium text-foreground">Total Cost:</span>
              <p className="text-foreground">{contractData.totalCost || 0}</p>
            </div>
            <div>
              <span className="font-medium text-foreground">Service Category:</span>
              <p className="text-foreground">{contractData.serviceCategory || "Not specified"}</p>
            </div>
          </div>
        )}

        {/* Contract Document */}
        {contractData.contractDocument?.url && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Contract Document:</span>
                <span className="text-sm text-foreground">
                  {contractData.contractDocument.fileName}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(contractData.contractDocument.url, "_blank")}
              >
                View
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-muted/50 rounded-2xl p-6 flex flex-col space-y-6">
      {/* Add Contract Button */}
      <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand/10 rounded-lg">
            <FileText className="w-4 h-4 text-brand" />
          </div>
          <h2 className="text-base font-semibold text-foreground">Client Contracts</h2>
        </div>
        <Button
          onClick={handleAddContract}
          className="hover:bg-brand/90 transition-colors bg-brand text-white flex items-center gap-2"
          disabled={!canModify}
        >
          <Plus className="w-4 h-4" />
          Add New Contract
        </Button>
      </div>

      {availableContracts.map((businessType: string) => {
        const contractKey = CONTRACT_MAPPING[businessType as keyof typeof CONTRACT_MAPPING];
        const contractData = contractsObj[contractKey];
        const summary = getContractSummary(contractData, businessType);
        const isExpanded = expandedContract === businessType;
        const isEditing = editDialogOpen === businessType;

        return (
          <div key={businessType} className="bg-card rounded-xl border border-border shadow-sm transition-all hover:shadow-md overflow-hidden">
            <div className="p-5">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-4 mb-4">
                    <h3 className="text-lg font-semibold text-foreground">Edit {businessType} Contract</h3>
                  </div>
                  {renderEditForm(businessType)}
                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setEditDialogOpen(null)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button onClick={() => handleFormSubmit(formData)} disabled={isSubmitting || !canModify}>
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-sm font-semibold text-foreground">{businessType} Contract</h3>
                    <Badge variant="secondary" className="text-xs">
                      {summary?.contractType || summary?.ContractType}
                    </Badge>
                  </div>

                  {summary?.details && (
                    <p className="text-sm text-foreground mt-1">{summary.details}</p>
                  )}

                  <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                    {summary?.startDate && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(summary.startDate)}</span>
                      </div>
                    )}
                    {summary?.hasDocument && (
                      <div className="flex items-center space-x-1">
                        <FileText className="h-3 w-3" />
                        <span>Document attached</span>
                      </div>
                    )}
                    {summary?.hasTechProposal && (
                      <div className="flex items-center space-x-1">
                        <FileText className="h-3 w-3" />
                        <span>Technical proposal</span>
                      </div>
                    )}
                    {summary?.hasFinProposal && (
                      <div className="flex items-center space-x-1">
                        <FileText className="h-3 w-3" />
                        <span>Financial proposal</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShowDetails(businessType)}
                    className="text-xs"
                  >
                    {isExpanded ? "Hide Details" : "Show Complete Details"}
                    <ChevronRight
                      className={`h-4 w-4 ml-1 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                    />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditContract(businessType)}
                    className="text-xs"
                    disabled={!canModify}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(businessType)}
                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={!canModify}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>

              {isExpanded && renderContractDetails(contractData, businessType)}
                </>
              )}
            </div>
          </div>
        );
      })}

      {/* Delete Contract Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteDialogOpen}
        onOpenChange={(open) => !open && setDeleteDialogOpen(null)}
        title="Delete Contract"
        description={`Are you sure you want to delete the ${deleteDialogOpen} contract? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteContract}
        loading={isDeleting}
        disabled={!canModify}
        confirmVariant="destructive"
      />
    </div>
  );
}
