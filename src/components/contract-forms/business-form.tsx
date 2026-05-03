import React, { useState } from "react";
import { Label } from "../ui/label";
import DatePicker from "../create-client-modal/date-picker";
import { Download, Eye, Upload } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";

// --- Constants ---
import { CONTRACT_TYPES, CURRENCIES, LEVELS, levelFieldMap } from "../create-client-modal/constants";

type LevelValue = {
  percentage: number;
  notes: string;
};

type LevelBasedHiring = {
  levelTypes: string[];
  seniorLevel: LevelValue;
  executives: LevelValue;
  nonExecutives: LevelValue;
  other: LevelValue;
};

type LevelValueAdvance = {
  percentage: number;
  notes: string;
  amount: number;
  currency: string;
};

type LevelBasedHiringAdvance = {
  levelTypes: string[];
  seniorLevel: LevelValueAdvance;
  executives: LevelValueAdvance;
  nonExecutives: LevelValueAdvance;
  other: LevelValueAdvance;
};

// --- Types ---
type StandardContractFormProps = {
  formData: {
    contractStartDate: Date | null;
    contractEndDate: Date | null;
    contractType: string;
    fixedPercentage: number;
    advanceMoneyCurrency: string;
    advanceMoneyAmount: number;
    fixedPercentageAdvanceNotes: string;
    contractDocument: File | null;
    fixWithoutAdvanceValue: number;
    fixWithoutAdvanceNotes: string;
    levelBasedHiring: LevelBasedHiring;
    levelBasedAdvanceHiring: LevelBasedHiringAdvance;
  };
  setFormData: (value: any) => void;
};

type UploadedFiles = {
  [key: string]: File | null;
};

// --- Constants ---

// --- Reusable Components ---
const ContractDocumentUpload: React.FC<{
  fileKey: string;
  formData: any;
  handleFileChange: (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePreview: (file: File | null) => void;
  handleDownload: (file: File | null) => void;
  label?: string;
}> = ({ fileKey, formData, handleFileChange, handlePreview, handleDownload, label }) => (
  <div className="space-y-2">
    {label && <Label className="text-sm sm:text-base font-semibold">{label}</Label>}
    <div className="flex flex-col space-y-2 sm:space-y-0 sm:space-x-2">
      <div className="flex gap-2">
        <div
          className="border-2 border-dashed rounded-lg p-2 text-center cursor-pointer hover:bg-muted/50 flex-1 w-full"
          onClick={() => document.getElementById(fileKey + "Input")?.click()}
        >
          <Upload className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Upload (PDF, JPEG, PNG)</p>
        </div>
        <input
          id={fileKey + "Input"}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={handleFileChange(fileKey)}
        />
        <div className="flex flex-col gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs px-2 gap-1"
            onClick={() => handlePreview(formData.contractDocument)}
            disabled={!formData.contractDocument}
          >
            <Eye className="h-3 w-3" />
            Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs px-2 gap-1"
            onClick={() => handleDownload(formData.contractDocument)}
            disabled={!formData.contractDocument}
          >
            <Download className="h-3 w-3" />
            Download
          </Button>
        </div>
      </div>
      {formData.contractDocument && (
        <p className="text-xs text-muted-foreground truncate w-full sm:w-auto">
          Selected file: {formData.contractDocument?.name}
        </p>
      )}
    </div>
  </div>
);

const PercentageCurrencyNotesRow: React.FC<{
  percentageValue: number | string | undefined;
  onPercentageChange: (value: number) => void;
  showCurrency?: boolean;
  currencyValue?: string;
  onCurrencyChange?: (value: string) => void;
  amountValue?: number | string | undefined;
  onAmountChange?: (value: number) => void;
  notesValue?: string;
  onNotesChange?: (value: string) => void;
  notesPlaceholder?: string;
  fullWidth?: boolean;
  splitNotesBelow?: boolean; // NEW PROP
}> = ({
  percentageValue,
  onPercentageChange,
  showCurrency,
  currencyValue,
  onCurrencyChange,
  amountValue,
  onAmountChange,
  notesValue,
  onNotesChange,
  notesPlaceholder = "Notes",
  fullWidth = false,
  splitNotesBelow = false,
}) => (
  <div className={fullWidth ? "w-full" : "w-full"}>
    <div className={`flex items-center space-x-2 w-full sm:w-auto${fullWidth ? "" : ""}`}>
      <div className={`relative ${fullWidth ? "flex-1" : !showCurrency ? "w-[22rem]" : "w-40"}`}>
        <Input
          type="number"
          placeholder="Percentage"
          min="0"
          max="100"
          onChange={(e) => {
            const value = e.target.value ? parseFloat(e.target.value) : 0;
            onPercentageChange(isNaN(value) ? 0 : Math.min(100, Math.max(0, value)));
          }}
          value={percentageValue || ""}
          className={`h-8 pl-2 pr-6 text-xs w-full`}
        />
        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
          %
        </span>
      </div>
      {showCurrency && onCurrencyChange && (
        <div
          className={`flex items-center space-x-0 border rounded-md overflow-hidden ${fullWidth ? "flex-1" : "w-48"}`}
        >
          <Select value={currencyValue || "SAR"} onValueChange={onCurrencyChange}>
            <SelectTrigger
              className={`h-8 text-xs ${fullWidth ? "w-full flex-1 rounded-none border-r-0" : "w-24 rounded-r-none border-r-0"}`}
            >
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Amount"
            min="0"
            onChange={(e) => {
              const value = e.target.value ? parseFloat(e.target.value) : 0;
              onAmountChange && onAmountChange(isNaN(value) ? 0 : value);
            }}
            value={amountValue || ""}
            className={`h-8 text-xs ${fullWidth ? "w-full flex-1 rounded-none border-l-0" : "w-24 rounded-l-none border-l-0"}`}
          />
        </div>
      )}
    </div>
    {onNotesChange && splitNotesBelow && (
      <div className="mt-2">
        <textarea
          placeholder={notesPlaceholder}
          onChange={(e) => onNotesChange(e.target.value)}
          value={notesValue || ""}
          className="h-16 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          rows={3}
        />
      </div>
    )}
    {onNotesChange && !splitNotesBelow && (
      <div className={`ml-2 ${fullWidth ? "flex-1" : ""}`}>
        <textarea
          placeholder={notesPlaceholder}
          onChange={(e) => onNotesChange(e.target.value)}
          value={notesValue || ""}
          className="h-16 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          rows={3}
        />
      </div>
    )}
  </div>
);

// --- Main Component ---
const levelToKey = (level: string): keyof LevelBasedHiring => {
  switch (level) {
    case "Senior Level":
      return "seniorLevel";
    case "Executives":
      return "executives";
    case "Non-Executives":
      return "nonExecutives";
    case "Other":
      return "other";
    default:
      throw new Error("Invalid level");
  }
};

const BusinessForm = ({ formData, setFormData }: StandardContractFormProps) => {
  const [openStartDate, setOpenStartDate] = useState(false);
  const [openEndDate, setOpenEndDate] = useState(false);
  const [activeLevel, setActiveLevel] = useState<string | null>(null);

  // --- File Handlers ---
  const handleFileChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev: any) => ({ ...prev, contractDocument: file }));
  };
  const handlePreview = (file: File | null) => {
    if (file) {
      const url = URL.createObjectURL(file);
      window.open(url, "_blank");
    }
  };
  const handleDownload = (file: File | null) => {
    if (file) {
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // --- Level Handlers ---
  const handleLevelChangeFix = (level: string) => {
    const clonedFormData = structuredClone(formData);
    clonedFormData.levelBasedHiring.levelTypes =
      clonedFormData.levelBasedHiring.levelTypes.includes(level)
        ? clonedFormData.levelBasedHiring.levelTypes.filter((l) => l !== level)
        : [...clonedFormData.levelBasedHiring.levelTypes, level];
    setFormData(clonedFormData);
    if (activeLevel === level) setActiveLevel(null);
  };

  const handleLevelChangeAdvance = (level: string) => {
    const clonedFormData = structuredClone(formData);
    clonedFormData.levelBasedAdvanceHiring.levelTypes =
      clonedFormData.levelBasedAdvanceHiring.levelTypes.includes(level)
        ? clonedFormData.levelBasedAdvanceHiring.levelTypes.filter((l) => l !== level)
        : [...clonedFormData.levelBasedAdvanceHiring.levelTypes, level];
    setFormData(clonedFormData);
    if (activeLevel === level) setActiveLevel(null);
  };

  const handleValueChangeAdvance = (
    level: string,
    value: number | string,
    type: keyof LevelValueAdvance,
  ) => {
    const clonedFormData = structuredClone(formData);
    if (type === "percentage" && typeof value === "number") {
      (clonedFormData.levelBasedAdvanceHiring[levelToKey(level)] as LevelValueAdvance).percentage =
        value;
    } else if (type === "notes" && typeof value === "string") {
      (clonedFormData.levelBasedAdvanceHiring[levelToKey(level)] as LevelValueAdvance).notes =
        value;
    } else if (type === "currency" && typeof value === "string") {
      (clonedFormData.levelBasedAdvanceHiring[levelToKey(level)] as LevelValueAdvance).currency =
        value;
    } else if (type === "amount" && typeof value === "number") {
      (clonedFormData.levelBasedAdvanceHiring[levelToKey(level)] as LevelValueAdvance).amount =
        value;
    }
    setFormData(clonedFormData);
  };

  const handleValueChangeFix = (level: string, value: number | string, type: keyof LevelValue) => {
    const clonedFormData = structuredClone(formData);
    if (type === "percentage" && typeof value === "number") {
      (clonedFormData.levelBasedHiring[levelToKey(level)] as LevelValue).percentage = value;
    } else if (type === "notes" && typeof value === "string") {
      (clonedFormData.levelBasedHiring[levelToKey(level)] as LevelValue).notes = value;
    }
    setFormData(clonedFormData);
  };

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex flex-row gap-4">
        {/* Contract Start Date */}
        <div className="flex-1 space-y-1">
          <Label htmlFor="contractStartDate">Contract Start Date</Label>
          <div className="grid gap-2">
            <DatePicker
              open={openStartDate}
              setOpen={setOpenStartDate}
              value={formData.contractStartDate!}
              setValue={(value: Date) =>
                setFormData((prev: typeof formData) => ({ ...prev, contractStartDate: value }))
              }
            />
          </div>
        </div>
        {/* Contract End Date */}
        <div className="flex-1 space-y-1">
          <Label htmlFor="contractEndDate">Contract End Date</Label>
          <div className="grid gap-2">
            <DatePicker
              open={openEndDate}
              setOpen={setOpenEndDate}
              value={formData.contractEndDate!}
              setValue={(value: Date) =>
                setFormData((prev: typeof formData) => ({ ...prev, contractEndDate: value }))
              }
            />
          </div>
        </div>
        {/* Contract Type */}
        <div className="flex-1 space-y-1">
          <Label htmlFor="contractType">Contract Type</Label>
          <Select
            value={formData.contractType}
            onValueChange={(value) =>
              setFormData((prev: typeof formData) => ({ ...prev, contractType: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select contract type" />
            </SelectTrigger>
            <SelectContent>
              {CONTRACT_TYPES.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Contract type-specific block below, in a single row if possible */}
      {formData.contractType === "Fix with Advance" && (
        <div className="w-full">
          <div className="space-y-4 col-span-1 sm:col-span-2 border rounded-lg p-4">
            <div className="shadow-sm rounded-lg p-2 cursor-pointer transition-colors w-full">
              <div className="flex flex-col">
                <h4 className="font-medium text-xs sm:text-sm shrink-0">Fix with Advance</h4>
                <PercentageCurrencyNotesRow
                  percentageValue={formData.fixedPercentage}
                  onPercentageChange={(value) =>
                    setFormData((prev: typeof formData) => ({ ...prev, fixedPercentage: value }))
                  }
                  showCurrency
                  currencyValue={formData.advanceMoneyCurrency}
                  onCurrencyChange={(value) =>
                    setFormData((prev: typeof formData) => ({
                      ...prev,
                      advanceMoneyCurrency: value,
                    }))
                  }
                  amountValue={formData.advanceMoneyAmount}
                  onAmountChange={(value) =>
                    setFormData((prev: typeof formData) => ({
                      ...prev,
                      advanceMoneyAmount: value,
                    }))
                  }
                  notesValue={formData.fixedPercentageAdvanceNotes}
                  onNotesChange={(value) =>
                    setFormData((prev: typeof formData) => ({
                      ...prev,
                      fixedPercentageAdvanceNotes: value,
                    }))
                  }
                  fullWidth
                  splitNotesBelow // NEW PROP
                />
              </div>
            </div>
            <ContractDocumentUpload
              fileKey="fixedPercentageAdvance"
              formData={formData}
              handleFileChange={handleFileChange}
              handlePreview={handlePreview}
              handleDownload={handleDownload}
              label="Contract Document"
            />
          </div>
        </div>
      )}
      {formData.contractType === "Fix without Advance" && (
        <div className="w-full">
          <div className="space-y-4 col-span-1 sm:col-span-2 border rounded-lg p-4">
            <div className="shadow-sm rounded-lg p-2 cursor-pointer transition-colors w-full">
              <div className="flex flex-col">
                <h4 className="font-medium text-xs sm:text-sm">Fix without Advance</h4>
                <PercentageCurrencyNotesRow
                  percentageValue={formData.fixWithoutAdvanceValue}
                  onPercentageChange={(value) =>
                    setFormData((prev: typeof formData) => ({
                      ...prev,
                      fixWithoutAdvanceValue: value,
                    }))
                  }
                  notesValue={formData.fixWithoutAdvanceNotes}
                  onNotesChange={(value) =>
                    setFormData((prev: typeof formData) => ({
                      ...prev,
                      fixWithoutAdvanceNotes: value,
                    }))
                  }
                  fullWidth // Make percentage input fill available width
                  splitNotesBelow // Move notes below as full-width
                />
              </div>
            </div>
            <ContractDocumentUpload
              fileKey="fixWithoutAdvance"
              formData={formData}
              handleFileChange={handleFileChange}
              handlePreview={handlePreview}
              handleDownload={handleDownload}
              label="Contract Document"
            />
          </div>
        </div>
      )}
      {/* Level Based Hiring */}
      {formData.contractType === "Level Based Hiring" && (
        <div className="w-full">
          <div className="space-y-4 col-span-1 sm:col-span-2 border rounded-lg p-4">
            <div className="space-y-1">
              <Label>Select Levels</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                {LEVELS.map((level) => (
                  <div key={level} className="flex items-center space-x-1">
                    <Checkbox
                      id={`level-${level}`}
                      checked={formData.levelBasedHiring.levelTypes.includes(level)}
                      onCheckedChange={() => handleLevelChangeFix(level)}
                    />
                    <label
                      htmlFor={`level-${level}`}
                      className="text-xs sm:text-sm font-medium leading-none cursor-pointer"
                    >
                      {level}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="">
              {formData.levelBasedHiring.levelTypes.length > 0 && (
                <div className="grid grid-cols-2">
                  {formData.levelBasedHiring.levelTypes.map((level) => {
                    const fieldKeys = levelFieldMap[level];
                    return (
                      <div
                        key={level}
                        className="rounded-lg p-2 cursor-pointer transition-colors w-full"
                      >
                        <div className="flex flex-col">
                          <h4 className="font-medium text-xs sm:text-sm">{level}</h4>
                          <PercentageCurrencyNotesRow
                            percentageValue={
                              (formData.levelBasedHiring[levelToKey(level)] as LevelValue)
                                .percentage
                            }
                            onPercentageChange={(value) =>
                              handleValueChangeFix(level, value, "percentage")
                            }
                            notesValue={
                              (formData.levelBasedHiring[levelToKey(level)] as LevelValue).notes
                            }
                            onNotesChange={(value) => handleValueChangeFix(level, value, "notes")}
                            fullWidth
                            splitNotesBelow
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <ContractDocumentUpload
              fileKey="fixWithoutAdvance"
              formData={formData}
              handleFileChange={handleFileChange}
              handlePreview={handlePreview}
              handleDownload={handleDownload}
              label="Contract Document"
            />
          </div>
        </div>
      )}
      {/* Level Based With Advance */}
      {formData.contractType === "Level Based Advance Hiring" && (
        <div className="w-full">
          <div className="space-y-4 col-span-1 sm:col-span-2 border rounded-lg p-4">
            <div className="space-y-1">
              <Label>Select Levels</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                {LEVELS.map((level) => (
                  <div key={level} className="flex items-center space-x-1">
                    <Checkbox
                      id={`level-${level}`}
                      checked={formData.levelBasedAdvanceHiring.levelTypes.includes(level)}
                      onCheckedChange={() => handleLevelChangeAdvance(level)}
                    />
                    <label
                      htmlFor={`level-${level}`}
                      className="text-xs sm:text-sm font-medium leading-none cursor-pointer"
                    >
                      {level}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            {formData.levelBasedAdvanceHiring.levelTypes.length > 0 && (
              <div className="space-y-2">
                {formData.levelBasedAdvanceHiring.levelTypes.map((level) => {
                  const fieldKeys = levelFieldMap[level];
                  return (
                    <div
                      key={level}
                      className=" rounded-lg p-2 cursor-pointer transition-colors w-full"
                    >
                      <div className="flex flex-col">
                        <h4 className="font-medium text-xs sm:text-sm">{level}</h4>
                        <PercentageCurrencyNotesRow
                          percentageValue={
                            (
                              formData.levelBasedAdvanceHiring[
                                levelToKey(level)
                              ] as LevelValueAdvance
                            ).percentage
                          }
                          onPercentageChange={(value) =>
                            handleValueChangeAdvance(level, value, "percentage")
                          }
                          showCurrency={formData.contractType === "Level Based Advance Hiring"}
                          currencyValue={
                            (
                              formData.levelBasedAdvanceHiring[
                                levelToKey(level)
                              ] as LevelValueAdvance
                            ).currency
                          }
                          onCurrencyChange={(value) =>
                            handleValueChangeAdvance(level, value, "currency")
                          }
                          amountValue={
                            (
                              formData.levelBasedAdvanceHiring[
                                levelToKey(level)
                              ] as LevelValueAdvance
                            ).amount
                          }
                          onAmountChange={(value) =>
                            handleValueChangeAdvance(level, value, "amount")
                          }
                          notesValue={
                            (
                              formData.levelBasedAdvanceHiring[
                                levelToKey(level)
                              ] as LevelValueAdvance
                            ).notes
                          }
                          onNotesChange={(value) => handleValueChangeAdvance(level, value, "notes")}
                          fullWidth
                          splitNotesBelow
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <ContractDocumentUpload
              fileKey="fixWithoutAdvance"
              formData={formData}
              handleFileChange={handleFileChange}
              handlePreview={handlePreview}
              handleDownload={handleDownload}
              label="Contract Document"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessForm;
