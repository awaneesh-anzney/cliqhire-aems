import React, { useRef, useState, useEffect } from "react";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Upload, DollarSign, Clock, User, Briefcase, FileText, CheckCircle } from "lucide-react";
import DatePicker from "../create-client-modal/date-picker";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "../ui/tooltip";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { CURRENCIES, HRC_CONTRACT_TYPES, MGTC_CONTRACT_TYPES } from "../create-client-modal/constants";

interface ConsultingContractFormProps {
  businessType?: string;
  formData: {
    contractStartDate: Date | null;
    contractEndDate: Date | null;
    contractType: string;
    salaryCurrency: string;
    // HRC Specific
    serviceScope?: string;
    clientContact?: string;
    estimatedHours?: string;
    totalCost: number;
    // MGTC Specific
    projectScope?: string;
    clientCompany?: string;
    keyDeliverables?: string;
    
    technicalProposalNotes: string;
    financialProposalNotes: string;
    technicalProposalDocument: File | null;
    financialProposalDocument: File | null;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const ConsultingForm = ({ businessType, formData, setFormData }: ConsultingContractFormProps) => {
  const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
  const [openEndDatePicker, setOpenEndDatePicker] = useState(false);

  const technicalProposalOptionInputRef = useRef<HTMLInputElement>(null);
  const financialProposalOptionInputRef = useRef<HTMLInputElement>(null);

  const isHRC = businessType === "HR Consulting" || !businessType;
  const isMGTC = businessType === "Mgt Consulting";

  const contractTypes = isHRC ? HRC_CONTRACT_TYPES : MGTC_CONTRACT_TYPES;

  // Set default contract type if not set
  useEffect(() => {
    if (!formData.contractType && contractTypes.length > 0) {
      setFormData((prev: any) => ({ ...prev, contractType: contractTypes[0] }));
    }
  }, [businessType, formData.contractType, contractTypes, setFormData]);

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6 mt-4 p-2">
        {/* Core Settings Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Contract Start Date */}
          <div className="space-y-1.5">
            <Label htmlFor="contractStartDate" className="text-sm font-medium">Contract Start Date</Label>
            <DatePicker
              open={openStartDatePicker}
              setOpen={setOpenStartDatePicker}
              value={formData.contractStartDate!}
              setValue={(date) => setFormData((prev: any) => ({ ...prev, contractStartDate: date }))}
            />
          </div>

          {/* Contract End Date */}
          <div className="space-y-1.5">
            <Label htmlFor="contractEndDate" className="text-sm font-medium">Contract End Date</Label>
            <DatePicker
              open={openEndDatePicker}
              setOpen={setOpenEndDatePicker}
              value={formData.contractEndDate!}
              setValue={(date) => setFormData((prev: any) => ({ ...prev, contractEndDate: date }))}
            />
          </div>

          {/* Contract Type */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Contract Type</Label>
            <Select
              value={formData.contractType}
              onValueChange={(value) => setFormData((prev: any) => ({ ...prev, contractType: value }))}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {contractTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Currency */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Currency</Label>
            <Select
              value={formData.salaryCurrency}
              onValueChange={(value) => setFormData((prev: any) => ({ ...prev, salaryCurrency: value }))}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((curr) => (
                  <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Business Type Specific Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isHRC && (
            <>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" /> Service Scope
                </Label>
                <Textarea
                  value={formData.serviceScope || ""}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, serviceScope: e.target.value }))}
                  placeholder="Describe the scope of services..."
                  className="min-h-[100px] resize-none"
                />
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" /> Client Contact
                  </Label>
                  <Input
                    value={formData.clientContact || ""}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, clientContact: e.target.value }))}
                    placeholder="Name of contact person"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" /> Est. Hours
                    </Label>
                    <Input
                      value={formData.estimatedHours || ""}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, estimatedHours: e.target.value }))}
                      placeholder="e.g. 160"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-primary" /> Total Cost
                    </Label>
                    <Input
                      type="number"
                      value={formData.totalCost || ""}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, totalCost: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {isMGTC && (
            <>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" /> Project Scope
                </Label>
                <Textarea
                  value={formData.projectScope || ""}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, projectScope: e.target.value }))}
                  placeholder="Describe the project scope..."
                  className="min-h-[100px] resize-none"
                />
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary" /> Client Company
                  </Label>
                  <Input
                    value={formData.clientCompany || ""}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, clientCompany: e.target.value }))}
                    placeholder="Company name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" /> Key Deliverables
                  </Label>
                  <Input
                    value={formData.keyDeliverables || ""}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, keyDeliverables: e.target.value }))}
                    placeholder="Main outcomes"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" /> Total Cost
                  </Label>
                  <Input
                    type="number"
                    value={formData.totalCost || ""}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, totalCost: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Proposals Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Technical Proposal */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2 text-slate-700">
              <FileText className="w-4 h-4 text-primary" /> Technical Proposal
            </Label>
            <Textarea
              value={formData.technicalProposalNotes || ""}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, technicalProposalNotes: e.target.value }))}
              placeholder="Technical proposal notes..."
              className="min-h-[80px] bg-white"
            />
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => technicalProposalOptionInputRef.current?.click()}
                className="bg-white hover:bg-slate-50 transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" /> Upload Document
              </Button>
              <input
                ref={technicalProposalOptionInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    technicalProposalDocument: e.target.files?.[0] || null,
                  }))
                }
              />
              {formData.technicalProposalDocument && (
                <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-200/50 px-2 py-1 rounded-md max-w-[200px]">
                  <span className="truncate">{formData.technicalProposalDocument.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Financial Proposal */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <Label className="text-sm font-semibold flex items-center gap-2 text-slate-700">
              <DollarSign className="w-4 h-4 text-primary" /> Financial Proposal
            </Label>
            <Textarea
              value={formData.financialProposalNotes || ""}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, financialProposalNotes: e.target.value }))}
              placeholder="Financial proposal notes..."
              className="min-h-[80px] bg-white"
            />
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => financialProposalOptionInputRef.current?.click()}
                className="bg-white hover:bg-slate-50 transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" /> Upload Document
              </Button>
              <input
                ref={financialProposalOptionInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    financialProposalDocument: e.target.files?.[0] || null,
                  }))
                }
              />
              {formData.financialProposalDocument && (
                <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-200/50 px-2 py-1 rounded-md max-w-[200px]">
                  <span className="truncate">{formData.financialProposalDocument.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ConsultingForm;
