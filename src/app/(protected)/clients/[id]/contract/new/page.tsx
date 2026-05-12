"use client";
import React, { useState } from "react";
import { ArrowLeft, Loader, TriangleAlert, FilePlus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useClientById } from "@/hooks/useClient";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/contexts/PermissionContext";
import { useClientContracts } from "@/hooks/useClientContracts";
import { ClientContractInfo } from "@/components/create-client-modal/type";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

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
  "Recruitment",
  "HR Consulting",
  "Mgt Consulting",
  "Outsourcing",
  "HR Managed Services",
  "IT & Technology",
];

export default function NewContractPage({ params }: PageProps) {
  const { id } = params;
  const router = useRouter();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();

  const isAdmin = user?.role === "ADMIN";
  const canModifyClients = isAdmin || hasPermission("clients", "create") || hasPermission("clients", "edit");

  const { data: client, isLoading, isError } = useClientById(id);
  const { addContractMutation } = useClientContracts(id);
  const isAddingContract = addContractMutation.isPending;

  const [addContractFormData, setAddContractFormData] = useState<ClientContractInfo>({
    lineOfBusiness: [],
    contractForms: {},
  });

  const handleBusinessCheckChange = (business: string, checked: boolean) => {
    setAddContractFormData((prev) => {
      const currentLob = prev.lineOfBusiness || [];
      if (checked) {
        // Initialize the correct state for this business type
        let initialState: any = {};
        if (["Recruitment", "HR Managed Services", "IT & Technology"].includes(business)) {
          initialState = { ...businessInitialState };
        } else if (["HR Consulting", "Mgt Consulting"].includes(business)) {
          initialState = { ...consultingInitialState };
        } else if (business === "Outsourcing") {
          initialState = { ...outsourcingInitialState };
        }
        
        return {
          ...prev,
          lineOfBusiness: [...currentLob, business],
          contractForms: {
            ...prev.contractForms,
            [business]: initialState
          }
        };
      } else {
        const newLob = currentLob.filter((b) => b !== business);
        const newForms = { ...prev.contractForms };
        delete newForms[business];
        return {
          ...prev,
          lineOfBusiness: newLob,
          contractForms: newForms
        };
      }
    });
  };

  const createUpdateFormHandler = (business: string) => (updater: any) => {
    setAddContractFormData((prev) => {
      const currentData = prev.contractForms[business];
      const newData = typeof updater === 'function' ? updater(currentData) : updater;
      return {
        ...prev,
        contractForms: {
          ...prev.contractForms,
          [business]: newData
        }
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
    
    // Check if forms are actually filled for selected line of business
    const unfilledLOBs = lineOfBusiness.filter(lob => !contractForms[lob]);
    if (unfilledLOBs.length > 0) {
      toast.error(`Please fill out the contract forms for: ${unfilledLOBs.join(', ')}`);
      return;
    }

    try {
      const promises = lineOfBusiness.map(async (businessType: string) => {
        const contractData = contractForms[businessType];
        if (contractData) {
          const contractKey = CONTRACT_MAPPING[businessType];
          await addContractMutation.mutateAsync({ contractType: contractKey, contractData });
        }
      });

      await Promise.all(promises);
      toast.success("Contract successfully created!");
      router.push(`/clients/${id}/contract`);
    } catch (error) {
      console.error("Failed to add contract:", error);
      toast.error("Failed to add contract. Please try again.");
    }
  };

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center justify-center">
          <TriangleAlert className="size-4 text-red-500 mb-2" />
          <div className="text-gray-600">Something went wrong! Please try again later</div>
        </div>
      </div>
    );
  }

  if (isLoading || !client) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center flex-col justify-center">
          <Loader className="size-6 animate-spin text-primary mb-2" />
          <p className="text-gray-600">Loading client data...</p>
        </div>
      </div>
    );
  }

  if (!canModifyClients) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-muted-foreground">
          You do not have permission to modify contracts for this client.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto">
      <div className="border-b bg-white py-2 px-3 flex items-center sticky top-0 z-10 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/clients/${id}/contract`)} className="rounded-full hover:bg-slate-100 mr-4">
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FilePlus className="h-5 w-5 text-primary" />
            Add New Contract
          </h1>
          <p className="text-sm text-slate-500">For client: {client.name}</p>
        </div>
      </div>
      <div className="flex-1 p-2  w-full">
        <Card className="shadow-lg border-0 bg-white rounded-xl overflow-hidden mb-4">
          <CardHeader className="bg-slate-50/80 border-b px-6 py-4">
            <CardTitle className="text-2xl text-slate-800">Contract Configuration</CardTitle>
            <CardDescription className="text-base text-slate-500">
              Select one or more lines of business. You can fill out the specific contract terms for each below.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 py-6">
            <div className="space-y-4">
              <Label className="text-base font-semibold text-slate-800">
                Select Line of Business<span className="text-red-600 ml-1">*</span>
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {BUSINESS_OPTIONS.map((option) => (
                  <div 
                    key={option} 
                    className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                      addContractFormData.lineOfBusiness.includes(option) ? 'border-primary bg-primary/5' : 'hover:bg-slate-50'
                    }`}
                    onClick={() => handleBusinessCheckChange(option, !addContractFormData.lineOfBusiness.includes(option))}
                  >
                    <Checkbox
                      id={`lob-${option}`}
                      checked={addContractFormData.lineOfBusiness.includes(option)}
                      onCheckedChange={(checked) => handleBusinessCheckChange(option, !!checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <label
                      htmlFor={`lob-${option}`}
                      className="text-sm font-medium leading-none cursor-pointer select-none"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {addContractFormData.lineOfBusiness.length > 0 && (
              <div className="mt-10 space-y-8">
                {addContractFormData.lineOfBusiness.map((business) => (
                  <div key={business} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <div className="bg-slate-100/50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                      <h3 className="font-semibold text-lg text-slate-800">{business} Details</h3>
                    </div>
                    <div className="p-6">
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
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-slate-50/80 border-t px-6 py-4 flex justify-end gap-3 sticky bottom-0 z-10">
            <Button
              variant="outline"
              onClick={() => router.push(`/clients/${id}/contract`)}
              disabled={isAddingContract}
              className="px-6 border-slate-300"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitContract} 
              disabled={isAddingContract || addContractFormData.lineOfBusiness.length === 0}
              className="px-6 bg-primary hover:bg-primary/90 shadow-md"
            >
              {isAddingContract ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Contract
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
