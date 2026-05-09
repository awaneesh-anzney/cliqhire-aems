import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil } from "lucide-react";
import { EditFieldModal } from "./edit-field-modal";
import { toast } from "sonner";
import { currencies } from "country-data-list";
import CurrencyFlag from "react-currency-flags";

// Get currency options from country-data-list
const currencyOptions = Object.values(currencies)
  .filter((c: any) => c.code && c.name && c.symbol)
  .map((c: any) => ({
    code: c.code,
    name: c.name,
    symbol: c.symbol,
    countryCode: c.countries && c.countries.length > 0 ? c.countries[0] : undefined,
  }));

interface SalaryRangeProps {
  candidate: any;
  onCandidateUpdate?: (updatedCandidate: any) => void;
  canModify?: boolean;
}

const SalaryRange = ({ candidate, onCandidateUpdate, canModify = true }: SalaryRangeProps) => {
  // ...existing hooks and state...

  // Save handler for current salary row
  const handleSaveCurrentSalaryRow = () => {
    const updatedCandidate = {
      ...localCandidate,
      currentSalary: editCurrentSalary,
      currentSalaryCurrency: editCurrentSalaryCurrency,
    };
    setLocalCandidate(updatedCandidate);
    setEditField(null);
    if (onCandidateUpdate) {
      onCandidateUpdate(updatedCandidate);
    }
    toast.success("Current Salary and Currency updated successfully");
  };

  // Save handler for expected salary row
  const handleSaveExpectedSalaryRow = () => {
    const updatedCandidate = {
      ...localCandidate,
      expectedSalary: editExpectedSalary,
      expectedSalaryCurrency: editExpectedSalaryCurrency,
    };
    setLocalCandidate(updatedCandidate);
    setEditField(null);
    if (onCandidateUpdate) {
      onCandidateUpdate(updatedCandidate);
    }
    toast.success("Expected Salary and Currency updated successfully");
  };

  const [editField, setEditField] = useState<string | null>(null);
  const [localCandidate, setLocalCandidate] = useState(candidate);

  // Temporary edit states
  const [editCurrentSalary, setEditCurrentSalary] = useState<string | number>("");
  const [editCurrentSalaryCurrency, setEditCurrentSalaryCurrency] = useState<string>("SAR");
  const [editExpectedSalary, setEditExpectedSalary] = useState<string | number>("");
  const [editExpectedSalaryCurrency, setEditExpectedSalaryCurrency] = useState<string>("SAR");

  // When opening modals, initialize temp states
  useEffect(() => {
    if (editField === "currentSalaryRow") {
      setEditCurrentSalary(localCandidate?.currentSalary || "");
      setEditCurrentSalaryCurrency(localCandidate?.currentSalaryCurrency || "SAR");
    } else if (editField === "expectedSalaryRow") {
      setEditExpectedSalary(localCandidate?.expectedSalary || "");
      setEditExpectedSalaryCurrency(localCandidate?.expectedSalaryCurrency || "SAR");
    }
  }, [editField, localCandidate]);

  const handleSave = (fieldKey: string, newValue: any) => {
    const updatedCandidate = { ...localCandidate, [fieldKey]: newValue };
    setLocalCandidate(updatedCandidate);
    setEditField(null);
    
    // Notify parent component of the update
    if (onCandidateUpdate) {
      onCandidateUpdate(updatedCandidate);
    }
    
    // Show success toast message
    const fieldLabels: { [key: string]: string } = {
      currentSalaryCurrency: "Current Salary Currency",
      currentSalary: "Current Salary",
      expectedSalaryCurrency: "Expected Salary Currency",
      expectedSalary: "Expected Salary"
    };
    const fieldLabel = fieldLabels[fieldKey] || fieldKey;
    toast.success(`${fieldLabel} updated successfully`);
  };

  const renderCurrentSalaryRow = () => {
    const currencyValue = localCandidate?.currentSalaryCurrency || "SAR";
    const salaryValue = localCandidate?.currentSalary;
    const hasSalary = salaryValue !== undefined && salaryValue !== null && salaryValue !== '';
    return (
      <div className="flex items-center gap-4 p-3 border rounded-md bg-muted">
        <div className="flex items-center gap-2 flex-1">
          <Label className="text-sm font-medium text-foreground min-w-[100px]">Current Salary:</Label>
          <div className="bg-card px-3 py-2 rounded border flex-1">
            <span className={`text-sm ${hasSalary ? 'font-medium' : 'text-muted-foreground'}`}>
              {hasSalary ? `${currencyValue} ${salaryValue}` : 'No Details'}
            </span>
          </div>
        </div>
        {canModify && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 flex items-center"
            onClick={() => setEditField("currentSalaryRow")}
          >
            <Pencil className="h-4 w-4 mr-2" />Edit
          </Button>
        )}
      </div>
    );
  };

  const renderExpectedSalaryRow = () => {
    const currencyValue = localCandidate?.expectedSalaryCurrency || "SAR";
    const salaryValue = localCandidate?.expectedSalary;
    const hasSalary = salaryValue !== undefined && salaryValue !== null && salaryValue !== '';
    return (
      <div className="flex items-center gap-4 p-3 border rounded-md bg-muted">
        <div className="flex items-center gap-2 flex-1">
          <Label className="text-sm font-medium text-foreground min-w-[100px]">Expected Salary:</Label>
          <div className="bg-card px-3 py-2 rounded border flex-1">
            <span className={`text-sm ${hasSalary ? 'font-medium' : 'text-muted-foreground'}`}>
              {hasSalary ? `${currencyValue} ${salaryValue}` : 'No Details'}
            </span>
          </div>
        </div>
        {canModify && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 flex items-center"
            onClick={() => setEditField("expectedSalaryRow")}
          >
            <Pencil className="h-4 w-4 mr-2" />Edit
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-lg border shadow-sm">
      <div className="p-4">
        <h4 className="text-sm font-semibold mb-4">Salary Range</h4>
        <div className="space-y-4">
          {/* Current Salary Row */}
          {renderCurrentSalaryRow()}
          
          {/* Expected Salary Row */}
          {renderExpectedSalaryRow()}
        </div>
      </div>

      {/* Current Salary Row Edit Modal */}
      <Dialog open={editField === "currentSalaryRow"} onOpenChange={() => setEditField(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Current Salary</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select 
                  value={editCurrentSalaryCurrency}
                  onValueChange={(val) => setEditCurrentSalaryCurrency(val)}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {localCandidate?.currentSalaryCurrency && (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-3">
                            <CurrencyFlag currency={localCandidate.currentSalaryCurrency} size="sm" />
                          </div>
                          <span>{localCandidate.currentSalaryCurrency}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {currencyOptions.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-3">
                            <CurrencyFlag currency={currency.code} size="sm" />
                          </div>
                          <span>{currency.name}</span>
                          <span className="text-muted-foreground ml-auto">{currency.symbol}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Current Salary</Label>
                <Input
                  type="number"
                  value={editCurrentSalary}
                  onChange={(e) => setEditCurrentSalary(e.target.value)}
                  placeholder="Enter current salary"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditField(null)} type="button">
                Cancel
              </Button>
              <Button
                onClick={() => handleSaveCurrentSalaryRow()}
                type="button"
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Expected Salary Row Edit Modal */}
      <Dialog open={editField === "expectedSalaryRow"} onOpenChange={() => setEditField(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expected Salary</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select 
                  value={editExpectedSalaryCurrency}
                  onValueChange={(val) => setEditExpectedSalaryCurrency(val)}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {localCandidate?.expectedSalaryCurrency && (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-3">
                            <CurrencyFlag currency={localCandidate.expectedSalaryCurrency} size="sm" />
                          </div>
                          <span>{localCandidate.expectedSalaryCurrency}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {currencyOptions.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-3">
                            <CurrencyFlag currency={currency.code} size="sm" />
                          </div>
                          <span>{currency.name}</span>
                          <span className="text-muted-foreground ml-auto">{currency.symbol}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Expected Salary</Label>
                <Input
                  type="number"
                  value={editExpectedSalary}
                  onChange={(e) => setEditExpectedSalary(e.target.value)}
                  placeholder="Enter expected salary"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditField(null)} type="button">
                Cancel
              </Button>
              <Button
                onClick={() => handleSaveExpectedSalaryRow()}
                type="button"
              >
                Save
              </Button>
              </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalaryRange; 