"use client";

import { useState } from "react";
import { ChevronRight, FileText, Calendar, Edit, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import BusinessForm from "@/components/contract-forms/business-form";
import ConsultingForm from "@/components/contract-forms/consulting-form";
import OutsourcingForm from "@/components/contract-forms/outsourcing-form";
import { ContractInformationTab } from "@/components/contract-forms/new-contract-modal";
import { toast } from "sonner";
import { useClientContracts } from "@/hooks/useClientContracts";
import { ClientContractInfo } from "@/components/create-client-modal/type";
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

  // Add Contract Dialog state
  const [addContractDialogOpen, setAddContractDialogOpen] = useState(false);
  const [addContractFormData, setAddContractFormData] = useState<ClientContractInfo>({
    lineOfBusiness: [],
    contractForms: {},
  });
  
  const { contractsQuery, addContractMutation, updateContractMutation, deleteContractMutation } = useClientContracts(clientId);
  const queryClient = useQueryClient();
  
  const isAddingContract = addContractMutation.isPending;
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
        contractType: contractData?.ContractType || contractData?.contractType || "",
        fixedPercentage: contractData?.fixedPercentage || 0,
        advanceMoneyCurrency: contractData?.advanceMoneyCurrency || "SAR",
        advanceMoneyAmount: contractData?.advanceMoneyAmount || 0,
        fixedPercentageAdvanceNotes: contractData?.fixedPercentageAdvanceNotes || "",
        contractDocument: contractData?.contractDocument || null,
        fixWithoutAdvanceValue: contractData?.fixedPercentageWithoutAdvance || 0,
        fixWithoutAdvanceNotes: contractData?.fixedPercentageWithoutAdvanceNotes || "",
        levelBasedHiring: contractData?.levelBasedHiring || {
          levelTypes: [],
          seniorLevel: { percentage: 0, notes: "" },
          executives: { percentage: 0, notes: "" },
          nonExecutives: { percentage: 0, notes: "" },
          other: { percentage: 0, notes: "" },
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

        // Proposal notes
        technicalProposalNotes: contractData?.technicalProposalNotes || "",
        financialProposalNotes: contractData?.financialProposalNotes || "",

        // Proposal documents
        technicalProposalDocument,
        financialProposalDocument,

        // Preserve any additional fields that might exist in the original data
        // These will be sent back to the backend even if not edited
        ...(contractData?.contractType && { contractType: contractData.contractType }),
        ...(contractData?.contractValue && { contractValue: contractData.contractValue }),
        ...(contractData?.contractNumber && { contractNumber: contractData.contractNumber }),
        ...(contractData?.businessType && { businessType: contractData.businessType }),
        ...(contractData?.clientId && { clientId: contractData.clientId }),
        ...(contractData?._id && { _id: contractData._id }),
        ...(contractData?.createdAt && { createdAt: contractData.createdAt }),
        ...(contractData?.updatedAt && { updatedAt: contractData.updatedAt }),
        ...(contractData?.createdBy && { createdBy: contractData.createdBy }),
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
    setAddContractFormData({
      lineOfBusiness: [],
      contractForms: {},
    });
    setAddContractDialogOpen(true);
  };

  const handleCloseAddContractDialog = () => {
    setAddContractDialogOpen(false);
    setAddContractFormData({
      lineOfBusiness: [],
      contractForms: {},
    });
  };

  const handleSubmitContract = async () => {
    if (!canModify) return;
    if (!clientId || !addContractFormData.lineOfBusiness.length) {
      toast.error("Please select at least one line of business");
      return;
    }

    try {
      const promises = addContractFormData.lineOfBusiness.map(async (businessType: string) => {
        const contractFormData = addContractFormData.contractForms[businessType];
        if (contractFormData) {
          const contractKey = CONTRACT_MAPPING[businessType as keyof typeof CONTRACT_MAPPING];
          await addContractMutation.mutateAsync({ contractType: contractKey, contractData: contractFormData });
        }
      });

      await Promise.all(promises);
      handleCloseAddContractDialog();
    } catch (error) {
      console.error("Failed to add contract:", error);
    }
  };

  const renderEditForm = (businessType: string) => {
    const formType = getFormType(businessType);

    if (formType === "business") {
      return <BusinessForm formData={formData} setFormData={setFormData} />;
    }

    if (formType === "consulting") {
      return <ConsultingForm formData={formData} setFormData={setFormData} />;
    }

    if (formType === "outsourcing") {
      return <OutsourcingForm formData={formData} setFormData={setFormData} />;
    }

    return null;
  };

  if (!clientData) {
    return <div className="text-center py-8 text-gray-500">Loading contract information...</div>;
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
        <div className="text-center py-8 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-sm">No contract information available</p>
          <p className="text-xs text-gray-400 mt-1">
            Contract details will appear here once configured
          </p>
          <Button onClick={handleAddContract} className="mt-4 flex items-center gap-2 mx-auto">
            <Plus className="h-4 w-4" />
            Add Contract
          </Button>
        </div>
        {/* Add Contract Dialog */}
        <Dialog open={addContractDialogOpen} onOpenChange={handleCloseAddContractDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Contract</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <ContractInformationTab
                formData={addContractFormData}
                setFormData={setAddContractFormData}
              />
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleCloseAddContractDialog}
                  disabled={isAddingContract}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmitContract} disabled={isAddingContract}>
                  {isAddingContract ? "Adding Contract..." : "Submit Contract"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
      if (contractData.ContractType === "Fix with Advance") {
        summary.details = `${contractData.fixedPercentage || 0}% + ${contractData.advanceMoneyAmount || 0} ${contractData.advanceMoneyCurrency || "SAR"}`;
      } else if (contractData.ContractType === "Fix without Advance") {
        summary.details = `${contractData.fixedPercentageWithoutAdvance || 0}%`;
      } else if (contractData.ContractType === "Level Based Hiring") {
        const levelTypes = contractData.levelBasedHiring?.levelTypes || [];
        summary.details = `${levelTypes.length} levels configured`;
      } else if (contractData.ContractType === "Level Based Advance Hiring") {
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
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border space-y-3">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">Contract Type:</span>
            <p className="text-gray-800">
              {contractData.ContractType || contractData.contractType || "Not specified"}
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Duration:</span>
            <p className="text-gray-800">
              {formatDate(contractData.contractStartDate)} -{" "}
              {formatDate(contractData.contractEndDate)}
            </p>
          </div>
        </div>

        {/* Recruitment/IT specific details */}
        {(contractType === "Recruitment" ||
          contractType === "IT & Technology" ||
          contractType === "HR Managed Services") && (
            <div className="space-y-2">
              {contractData.ContractType === "Fix with Advance" ||
                (contractData.contractType === "Fix with Advance" && (
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Fixed Percentage:</span>
                      <p className="text-gray-800">{contractData.fixedPercentage || 0}%</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Advance Amount:</span>
                      <p className="text-gray-800">
                        {contractData.advanceMoneyAmount || 0}{" "}
                        {contractData.advanceMoneyCurrency || "SAR"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Notes:</span>
                      <p className="text-gray-800">
                        {contractData.fixedPercentageAdvanceNotes || "No notes"}
                      </p>
                    </div>
                  </div>
                ))}

              {contractData.ContractType === "Level Based Hiring" ||
                (contractData.contractType === "Level Based Hiring" &&
                  contractData.levelBasedHiring?.levelTypes?.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-600">Level Configuration:</span>
                      <div className="mt-2 space-y-1">
                        {contractData.levelBasedHiring.levelTypes.map((level: string) => {
                          const levelKey =
                            LEVEL_TYPE_MAPPING[level] || level.toLowerCase().replace(/[^a-z]/g, "");
                          const levelData = contractData.levelBasedHiring[levelKey] || {};
                          return (
                            <div key={level} className="text-sm grid grid-cols-2 gap-4">
                              <div>
                                <p className="font-medium text-gray-600">Level Type:</p>
                                <p>{level}</p>
                              </div>
                              <div>
                                <p className="font-medium text-gray-600">Percentage:</p>
                                <p>{levelData.percentage || 0}%</p>
                              </div>
                              <div>
                                <p className="font-medium text-gray-600">Amount:</p>
                                <p>{levelData.amount || 0} {levelData.currency || "SAR"}</p>
                              </div>
                              <div>
                                <p className="font-medium text-gray-600">Notes:</p>
                                <p>{levelData.notes || "No notes"}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

              {contractData.ContractType === "Level Based Advance Hiring" ||
                (contractData.contractType === "Level Based Advance Hiring" &&
                  contractData.levelBasedAdvanceHiring?.levelTypes?.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-600">
                        Level Configuration (With Advance):
                      </span>
                      <div className="mt-2 space-y-1">
                        {contractData.levelBasedAdvanceHiring.levelTypes.map((level: string) => {
                          const levelKey =
                            LEVEL_TYPE_MAPPING[level] || level.toLowerCase().replace(/[^a-z]/g, "");
                          const levelData = contractData.levelBasedAdvanceHiring[levelKey] || {};
                          return (
                            <div key={level} className="text-sm grid grid-cols-3 gap-4">
                              <div>
                                <p className="font-medium text-gray-600">Level Type:</p>
                                <p>{level}</p>
                              </div>
                              <div>
                                <p className="font-medium text-gray-600">Percentage:</p>
                                <p>{levelData.percentage || 0}%</p>
                              </div>
                              <div>
                                <p className="font-medium text-gray-600">Amount:</p>
                                <p>
                                  {levelData.amount || 0} {levelData.currency || "SAR"}
                                </p>
                              </div>
                              <div>
                                <p className="font-medium text-gray-600">Notes:</p>
                                <p>{levelData.notes || "No notes"}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
            </div>
          )}

        {/* Consulting specific details */}
        {(contractType === "HR Consulting" || contractType === "Mgt Consulting") && (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Currency:</span>
                <p className="text-gray-800">{contractData.salaryCurrency || "SAR"}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Technical Proposal:</span>
                <p className="text-gray-800">{contractData.technicalProposalNotes || "No notes"}</p>
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-600">Financial Proposal:</span>
                <p className="text-gray-800">{contractData.financialProposalNotes || "No notes"}</p>
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
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">
                      Technical Proposal Document:
                    </span>
                    <span className="text-sm text-gray-800">
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
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">
                      Financial Proposal Document:
                    </span>
                    <span className="text-sm text-gray-800">
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
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">
                      Technical Proposal Document:
                    </span>
                    <span className="text-sm text-gray-800">
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
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">
                      Financial Proposal Document:
                    </span>
                    <span className="text-sm text-gray-800">
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
              <span className="font-medium text-gray-600">Resources:</span>
              <p className="text-gray-800">{contractData.numberOfResources || 0}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Total Cost:</span>
              <p className="text-gray-800">{contractData.totalCost || 0}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Service Category:</span>
              <p className="text-gray-800">{contractData.serviceCategory || "Not specified"}</p>
            </div>
          </div>
        )}

        {/* Contract Document */}
        {contractData.contractDocument?.url && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Contract Document:</span>
                <span className="text-sm text-gray-800">
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
    <div className="bg-slate-50/50 rounded-2xl p-6 flex flex-col space-y-6">
      {/* Add Contract Button */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand/10 rounded-lg">
            <FileText className="w-4 h-4 text-brand" />
          </div>
          <h2 className="text-base font-semibold text-slate-800">Client Contracts</h2>
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

        return (
          <div key={businessType} className="bg-white rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md overflow-hidden">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-sm font-semibold text-gray-800">{businessType} Contract</h3>
                    <Badge variant="secondary" className="text-xs">
                      {summary?.contractType || summary?.ContractType}
                    </Badge>
                  </div>

                  {summary?.details && (
                    <p className="text-sm text-gray-600 mt-1">{summary.details}</p>
                  )}

                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
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
            </div>
          </div>
        );
      })}

      {/* Edit Contract Dialog */}
      <Dialog open={!!editDialogOpen} onOpenChange={(open) => !open && setEditDialogOpen(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {editDialogOpen} Contract</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editDialogOpen && renderEditForm(editDialogOpen)}
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
        </DialogContent>
      </Dialog>

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

      {/* Add Contract Dialog */}
      <Dialog open={addContractDialogOpen} onOpenChange={handleCloseAddContractDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Contract</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ContractInformationTab
              formData={addContractFormData}
              setFormData={setAddContractFormData}
            />
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleCloseAddContractDialog}
                disabled={isAddingContract}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmitContract} disabled={isAddingContract || !canModify}>
                {isAddingContract ? "Adding Contract..." : "Submit Contract"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
