import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { businessInitialState, outsourcingInitialState, consultingInitialState } from "../create-client-modal/constants";
import { ClientContractInfo } from "../create-client-modal/type";
import { Pencil, Eye, Trash2 } from "lucide-react";
import BusinessForm from "../contract-forms/business-form";
import ConsultingForm from "../contract-forms/consulting-form";
import OutsourcingForm from "../contract-forms/outsourcing-form";

interface ContractInformationTabProps {
  formData: ClientContractInfo;
  setFormData: React.Dispatch<React.SetStateAction<ClientContractInfo>>;
}

interface ConfirmationConfig {
  title: string;
  description: string;
  confirmText: string;
  onConfirm: () => void;
}

export function ContractInformationTab({ formData, setFormData }: ContractInformationTabProps) {
  // Business tabs
  const [activeBusinessTab, setActiveBusinessTab] = useState<string | null>(null);
  const [previewBusinessTab, setPreviewBusinessTab] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const [standardContractFormData, setStandardContractFormData] = useState(businessInitialState);
  const [consultingContractFormData, setConsultingContractFormData] =
    useState(consultingInitialState);
  const [outsourcingContractFormData, setOutsourcingContractFormData] =
    useState(outsourcingInitialState);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalBusiness, setModalBusiness] = useState<string | null>(null);

  // Single confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState<ConfirmationConfig | null>(null);

  // Effect to populate form data when in preview mode
  useEffect(() => {
    if (isPreviewMode && modalBusiness && formData.contractForms[modalBusiness]) {
      const savedData = formData.contractForms[modalBusiness];

      if (
        modalBusiness === "Recruitment" ||
        modalBusiness === "HR Managed Services" ||
        modalBusiness === "IT & Technology"
      ) {
        setStandardContractFormData(savedData as typeof businessInitialState);
      } else if (modalBusiness === "HR Consulting" || modalBusiness === "Mgt Consulting") {
        setConsultingContractFormData(savedData as typeof consultingInitialState);
      } else if (modalBusiness === "Outsourcing") {
        setOutsourcingContractFormData(savedData as typeof outsourcingInitialState);
      }
    }
  }, [isPreviewMode, modalBusiness, formData.contractForms]);

  const handleSaveContract = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Only save if not in preview mode
    if (!isPreviewMode) {
      if (
        modalBusiness === "Recruitment" ||
        modalBusiness === "HR Managed Services" ||
        modalBusiness === "IT & Technology"
      ) {
        const clonedFormData = structuredClone(formData);
        clonedFormData.contractForms[modalBusiness!] = standardContractFormData;
        setFormData(clonedFormData);
      } else if (modalBusiness === "HR Consulting" || modalBusiness === "Mgt Consulting") {
        const clonedFormData = structuredClone(formData);
        clonedFormData.contractForms[modalBusiness!] = consultingContractFormData;
        setFormData(clonedFormData);
      } else if (modalBusiness === "Outsourcing") {
        const clonedFormData = structuredClone(formData);
        clonedFormData.contractForms[modalBusiness!] = outsourcingContractFormData;
        setFormData(clonedFormData);
      }
    }

    // Reset form states when closing (only if not in preview mode)
    if (!isPreviewMode) {
      setStandardContractFormData(businessInitialState);
      setConsultingContractFormData(consultingInitialState);
      setOutsourcingContractFormData(outsourcingInitialState);
    }

    setModalOpen(false);
    setIsPreviewMode(false);
  };

  const handleCloseModal = () => {
    // Reset form states when closing
    if (!isPreviewMode) {
      setStandardContractFormData(businessInitialState);
      setConsultingContractFormData(consultingInitialState);
      setOutsourcingContractFormData(outsourcingInitialState);
    }

    setModalOpen(false);
    setIsPreviewMode(false);
  };

  const removeBusinessFromLineOfBusiness = (business: string) => {
    setFormData((prev: ClientContractInfo) => {
      const current = Array.isArray(prev.lineOfBusiness)
        ? prev.lineOfBusiness
        : prev.lineOfBusiness
          ? [prev.lineOfBusiness]
          : [];

      const clonedFormData = structuredClone(prev);
      clonedFormData.lineOfBusiness = current.filter((item: string) => item !== business);

      // Also remove the form data
      if (clonedFormData.contractForms[business]) {
        delete clonedFormData.contractForms[business];
      }

      return clonedFormData;
    });

    if (activeBusinessTab === business) {
      setActiveBusinessTab(null);
      setPreviewBusinessTab(null);
    }
  };

  const deleteFormData = (business: string) => {
    const clonedFormData = structuredClone(formData);
    delete clonedFormData.contractForms[business];
    setFormData(clonedFormData);
  };

  const handleDeleteFormData = (business: string) => {
    setConfirmationConfig({
      title: "Delete Form Data",
      description: `Are you sure you want to delete the form data for "${business}"? This action cannot be undone.`,
      confirmText: "Yes, Delete",
      onConfirm: () => deleteFormData(business),
    });
    setShowConfirmDialog(true);
  };

  const handleBusinessCheckChange = (business: string, checked: boolean) => {
    if (checked) {
      // Adding the business - no confirmation needed
      setFormData((prev: ClientContractInfo) => {
        const current = Array.isArray(prev.lineOfBusiness)
          ? prev.lineOfBusiness
          : prev.lineOfBusiness
            ? [prev.lineOfBusiness]
            : [];
        return {
          ...prev,
          lineOfBusiness: [...current, business],
        };
      });
    } else {
      // Removing the business - check if form data exists
      const hasFormData = formData.contractForms[business];

      if (hasFormData) {
        // Show confirmation dialog
        setConfirmationConfig({
          title: "Remove Line of Business",
          description: `You have filled form data for "${business}". If you uncheck this line of business, all the form data you have filled will be permanently removed. Are you sure you want to continue?`,
          confirmText: "Yes, Remove Data",
          onConfirm: () => removeBusinessFromLineOfBusiness(business),
        });
        setShowConfirmDialog(true);
      } else {
        // No form data, remove directly
        removeBusinessFromLineOfBusiness(business);
      }
    }
  };

  const handleConfirmAction = () => {
    if (confirmationConfig?.onConfirm) {
      confirmationConfig.onConfirm();
    }
    setShowConfirmDialog(false);
    setConfirmationConfig(null);
  };

  const handleCancelConfirmation = () => {
    setShowConfirmDialog(false);
    setConfirmationConfig(null);
  };

  const businessOptions = [
    "Recruitment",
    "HR Consulting",
    "Mgt Consulting",
    "Outsourcing",
    "HR Managed Services",
    "IT & Technology",
  ];

  return (
    <div className="space-y-6 pb-2">
      <div className="space-y-1">
        <Label htmlFor="lineOfBusiness">
          Line of Business<span className="text-red-700">*</span>
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border rounded-md p-2">
          {businessOptions.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={`lob-${option}`}
                checked={formData.lineOfBusiness?.includes(option)}
                onCheckedChange={(checked) => {
                  handleBusinessCheckChange(option, !!checked);
                }}
              />
              <label
                htmlFor={`lob-${option}`}
                className={`text-xs sm:text-sm font-medium leading-none cursor-pointer ${
                  formData.lineOfBusiness?.includes(option) ? "font-bold text-primary" : ""
                }`}
                onClick={() =>
                  formData.lineOfBusiness?.includes(option) &&
                  setFormData((prev: ClientContractInfo) => ({ ...prev, lineOfBusiness: [option] }))
                }
              >
                {option
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </label>
            </div>
          ))}
        </div>
      </div>

      {formData.lineOfBusiness &&
        Array.isArray(formData.lineOfBusiness) &&
        formData.lineOfBusiness.length > 0 && (
          <div className="w-full">
            {formData.lineOfBusiness.map((business: string) => {
              const isFormFilled = formData.contractForms[business];

              return (
                <div
                  key={business}
                  className="rounded border bg-card py-4 px-6 mb-4 flex items-center justify-between w-full"
                >
                  <span className="font-medium text-xs sm:text-sm">{business} contract form</span>
                  <div className="flex gap-2">
                    {/* Show Fill Form button only if form is not filled */}
                    {!isFormFilled && (
                      <Button
                        size="sm"
                        type="button"
                        className="w-24"
                        variant="outline"
                        onClick={() => {
                          setActiveBusinessTab(business);
                          setPreviewBusinessTab(null);
                          setModalBusiness(business);
                          setIsPreviewMode(false);
                          setModalOpen(true);
                        }}
                      >
                        <Pencil className="size-4" />
                        Fill Form
                      </Button>
                    )}

                    {/* Show Preview and Delete buttons only if form is filled */}
                    {isFormFilled && (
                      <>
                        <Button
                          size="sm"
                          type="button"
                          className="w-24"
                          onClick={() => {
                            setPreviewBusinessTab(business);
                            setActiveBusinessTab(null);
                            setModalBusiness(business);
                            setIsPreviewMode(true);
                            setModalOpen(true);
                          }}
                        >
                          <Eye className="size-4" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          type="button"
                          variant="destructive"
                          className="w-24"
                          onClick={() => handleDeleteFormData(business)}
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      {/* Modal for contract form */}
      <Dialog open={modalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl w-full h-[400px] p-4 gap-0 flex flex-col">
          <DialogHeader className="mb-0 pb-0">
            <DialogTitle className="text-base leading-tight m-0 p-0 flex items-center gap-2">
              {isPreviewMode && <Eye className="size-4" />}
              {modalBusiness} Contract Form {isPreviewMode ? "(Preview)" : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            <div className="overflow-y-auto overflow-x-hidden h-full pr-1 flex flex-col gap-1">
              {modalBusiness &&
                ["Recruitment", "HR Managed Services", "IT & Technology"].includes(
                  modalBusiness,
                ) && (
                  <BusinessForm
                    formData={standardContractFormData}
                    setFormData={setStandardContractFormData}
                  />
                )}
              {modalBusiness && ["HR Consulting", "Mgt Consulting"].includes(modalBusiness) && (
                <ConsultingForm
                  formData={consultingContractFormData}
                  setFormData={setConsultingContractFormData}
                />
              )}
              {modalBusiness === "Outsourcing" && (
                <OutsourcingForm
                  formData={outsourcingContractFormData}
                  setFormData={setOutsourcingContractFormData}
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                {isPreviewMode ? "Close" : "Cancel"}
              </Button>
              {!isPreviewMode && (
                <Button type="button" className="ml-auto" onClick={(e) => handleSaveContract(e)}>
                  Save
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Single reusable confirmation dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmationConfig?.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmationConfig?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelConfirmation}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>
              {confirmationConfig?.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
