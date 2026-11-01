"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Database,
  Layers,
  Sparkles,
  Info,
  Check,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface ExportFilterParams {
  year?: number;
  month?: number;
  stage?: string;
  [key: string]: any;
}

export interface StageOption {
  value: string;
  label: string;
  description?: string;
  color?: "blue" | "amber" | "emerald" | "purple" | "rose" | "default";
}

export interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  onExport: (params?: ExportFilterParams) => Promise<Blob | any>;
  isExporting?: boolean;
  filename?: string;
  // Stage options
  showStageFilter?: boolean;
  stages?: StageOption[];
  defaultStages?: string[];
  fixedStage?: string;
  fixedStageLabel?: string;
  isLeadsModule?: boolean;
}

const DEFAULT_LEAD_STAGES: StageOption[] = [
  {
    value: "Lead",
    label: "Lead",
    description: "Prospects & initial contacts",
    color: "blue",
  },
  {
    value: "Engaged",
    label: "Engaged",
    description: "Active discussions, meetings & proposals",
    color: "amber",
  },
];

export function ExportDialog({
  isOpen,
  onClose,
  title = "Export Data",
  description = "Choose what data you would like to export.",
  onExport,
  filename = "export_data",
  showStageFilter = false,
  stages = DEFAULT_LEAD_STAGES,
  defaultStages = ["Lead", "Engaged"],
  fixedStage,
  fixedStageLabel,
  isLeadsModule = false,
}: ExportDialogProps) {
  const [filterType, setFilterType] = useState<"all" | "custom">("all");
  const [year, setYear] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [selectedStages, setSelectedStages] = useState<string[]>(defaultStages);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadedFilename, setDownloadedFilename] = useState<string>("");
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Reset or initialize state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedStages(defaultStages);
      setFilterType("all");
      setYear("");
      setMonth("");
      setIsDownloaded(false);
      setDownloadUrl(null);
    } else {
      if (downloadUrl) {
        window.URL.revokeObjectURL(downloadUrl);
      }
      setDownloadUrl(null);
      setIsDownloaded(false);
      setIsLoading(false);
    }
  }, [isOpen]);

  const toggleStage = (stageValue: string) => {
    setSelectedStages((prev) => {
      const exists = prev.includes(stageValue);
      if (exists) {
        return prev.filter((s) => s !== stageValue);
      } else {
        return [...prev, stageValue];
      }
    });
    // Reset downloaded state if user changes stage filters
    if (downloadUrl) {
      window.URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
      setIsDownloaded(false);
    }
  };

  const handleSelectAllStages = () => {
    const allStageValues = stages.map((s) => s.value);
    if (selectedStages.length === allStageValues.length) {
      setSelectedStages([]);
    } else {
      setSelectedStages(allStageValues);
    }
    if (downloadUrl) {
      window.URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
      setIsDownloaded(false);
    }
  };

  const handleExportClick = async () => {
    // Stage validation if stages are enabled
    if (showStageFilter && selectedStages.length === 0) {
      toast.error("Please select at least one stage to export");
      return;
    }

    try {
      setIsLoading(true);

      const params: ExportFilterParams = {};

      // Handle stage parameter
      if (showStageFilter && selectedStages.length > 0) {
        params.stage = selectedStages.join(",");
      } else if (fixedStage) {
        params.stage = fixedStage;
      }

      // Handle date filters
      if (filterType === "custom") {
        if (year) params.year = parseInt(year);
        if (month) params.month = parseInt(month);
      }

      const data = await onExport(params);

      // Create blob & trigger direct download
      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);

      const dateStr = new Date().toISOString().slice(0, 10);
      const outputFilename = `${filename}_${dateStr}.xlsx`;
      setDownloadedFilename(outputFilename);

      // Trigger instant download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", outputFilename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsDownloaded(true);
      toast.success("Export file downloaded successfully!");
    } catch (error) {
      console.error("Export failed in dialog:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadAgain = () => {
    if (!downloadUrl) return;

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", downloadedFilename || `${filename}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download re-triggered");
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // Validation
  const isStageSelectionInvalid = showStageFilter && selectedStages.length === 0;
  const isCustomDateInvalid = filterType === "custom" && (!year || !month);
  const isExportDisabled = isLoading || isStageSelectionInvalid || isCustomDateInvalid;

  // Selected stage summary text
  const stageSummaryText = useMemo(() => {
    if (showStageFilter) {
      if (selectedStages.length === 0) return "No stage selected";
      return selectedStages.join(", ");
    }
    if (fixedStage) {
      return fixedStage;
    }
    return "All";
  }, [showStageFilter, selectedStages, fixedStage]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[490px] p-0 overflow-hidden border border-border shadow-2xl rounded-2xl gap-0">
        {/* Header with gradient touch */}
        <div className="bg-gradient-to-b from-muted/60 via-muted/30 to-background px-6 pt-6 pb-4 border-b border-border/60">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                {title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                {description}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Dialog Body */}
        <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Stage Selection Section for Leads */}
          {showStageFilter && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-primary" />
                  Select Stage to Export
                </Label>
                <button
                  type="button"
                  onClick={handleSelectAllStages}
                  className="text-xs font-medium text-primary hover:underline transition-colors"
                >
                  {selectedStages.length === stages.length ? "Deselect All" : "Select Both"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {stages.map((stage) => {
                  const isChecked = selectedStages.includes(stage.value);
                  const isLead = stage.value === "Lead";
                  const isEngaged = stage.value === "Engaged";

                  return (
                    <div
                      key={stage.value}
                      onClick={() => toggleStage(stage.value)}
                      className={cn(
                        "relative flex flex-col p-3 rounded-xl border transition-all cursor-pointer select-none text-left",
                        isChecked
                          ? isLead
                            ? "bg-blue-50/60 dark:bg-blue-950/20 border-blue-500/50 shadow-xs ring-1 ring-blue-500/30"
                            : "bg-amber-50/60 dark:bg-amber-950/20 border-amber-500/50 shadow-xs ring-1 ring-amber-500/30"
                          : "bg-card hover:bg-muted/50 border-border/70 opacity-70 hover:opacity-100"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider",
                            isLead
                              ? "bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/20"
                              : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                          )}
                        >
                          {stage.label}
                        </span>
                        <div
                          className={cn(
                            "h-4 w-4 rounded-full flex items-center justify-center transition-all",
                            isChecked
                              ? isLead
                                ? "bg-blue-600 text-white"
                                : "bg-amber-600 text-white"
                              : "border border-muted-foreground/30"
                          )}
                        >
                          {isChecked && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                        {stage.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {isStageSelectionInvalid && (
                <div className="flex items-center gap-1.5 text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg border border-destructive/20 animate-in fade-in-50">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>Please select at least one stage (Lead or Engaged).</span>
                </div>
              )}
            </div>
          )}

          {/* Fixed Stage Notice for Clients */}
          {fixedStage && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-semibold flex items-center gap-1.5">
                  Target Stage:
                  <Badge variant="secondary" className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0 h-4">
                    {fixedStage}
                  </Badge>
                </div>
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 leading-tight">
                  {fixedStageLabel || "Exports all contracted and signed client accounts."}
                </p>
              </div>
            </div>
          )}

          {/* Time Range Filter Section */}
          <div className="space-y-2.5 pt-1">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              Date Filter
            </Label>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Option 1: All Records */}
              <button
                type="button"
                onClick={() => {
                  setFilterType("all");
                  if (downloadUrl) {
                    window.URL.revokeObjectURL(downloadUrl);
                    setDownloadUrl(null);
                    setIsDownloaded(false);
                  }
                }}
                className={cn(
                  "flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all select-none",
                  filterType === "all"
                    ? "bg-primary/5 border-primary/50 ring-1 ring-primary/30 shadow-xs"
                    : "bg-card hover:bg-muted/50 border-border/70"
                )}
              >
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors mt-0.5",
                    filterType === "all"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Database className="h-3.5 w-3.5" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-foreground">All Records</div>
                  <div className="text-[11px] text-muted-foreground">Export all data</div>
                </div>
              </button>

              {/* Option 2: Custom Filter */}
              <button
                type="button"
                onClick={() => {
                  setFilterType("custom");
                  if (downloadUrl) {
                    window.URL.revokeObjectURL(downloadUrl);
                    setDownloadUrl(null);
                    setIsDownloaded(false);
                  }
                }}
                className={cn(
                  "flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all select-none",
                  filterType === "custom"
                    ? "bg-primary/5 border-primary/50 ring-1 ring-primary/30 shadow-xs"
                    : "bg-card hover:bg-muted/50 border-border/70"
                )}
              >
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors mt-0.5",
                    filterType === "custom"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Calendar className="h-3.5 w-3.5" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-foreground">Specific Period</div>
                  <div className="text-[11px] text-muted-foreground">Filter by month & year</div>
                </div>
              </button>
            </div>

            {/* Custom Year & Month Controls */}
            {filterType === "custom" && (
              <div className="p-3 bg-muted/40 rounded-xl border border-border/60 animate-in slide-in-from-top-2 fade-in-0 duration-150 space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="year-select" className="text-[11px] font-medium text-muted-foreground">
                      Year *
                    </Label>
                    <Select
                      value={year}
                      onValueChange={(v) => {
                        setYear(v);
                        if (downloadUrl) {
                          window.URL.revokeObjectURL(downloadUrl);
                          setDownloadUrl(null);
                          setIsDownloaded(false);
                        }
                      }}
                    >
                      <SelectTrigger id="year-select" className="h-9 text-xs bg-background">
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((y) => (
                          <SelectItem key={y} value={String(y)} className="text-xs">
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="month-select" className="text-[11px] font-medium text-muted-foreground">
                      Month *
                    </Label>
                    <Select
                      value={month}
                      onValueChange={(v) => {
                        setMonth(v);
                        if (downloadUrl) {
                          window.URL.revokeObjectURL(downloadUrl);
                          setDownloadUrl(null);
                          setIsDownloaded(false);
                        }
                      }}
                    >
                      <SelectTrigger id="month-select" className="h-9 text-xs bg-background">
                        <SelectValue placeholder="Select Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((m) => (
                          <SelectItem key={m.value} value={m.value} className="text-xs">
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {isCustomDateInvalid && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400">
                    * Please select both year and month to proceed.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Downloaded Success Notification Card */}
          {isDownloaded && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 animate-in fade-in-50">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <Check className="h-4 w-4 stroke-[3]" />
                </div>
                <div>
                  <div className="text-xs font-semibold">Report Generated & Downloaded</div>
                  <div className="text-[10px] text-muted-foreground font-mono truncate max-w-[240px]">
                    {downloadedFilename}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownloadAgain}
                className="h-7 text-xs px-2.5 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10"
              >
                <Download className="mr-1.5 h-3 w-3" />
                Download Again
              </Button>
            </div>
          )}

          {/* Export Parameters Summary Strip */}
          <div className="rounded-lg bg-muted/30 border border-border/50 px-3 py-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground">Format:</span> XLSX (Excel)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground">Stage:</span>{" "}
              <span className="font-medium text-foreground">{stageSummaryText}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground">Scope:</span>{" "}
              <span>
                {filterType === "all"
                  ? "All Time"
                  : `${months.find((m) => m.value === month)?.label || ""} ${year || ""}`}
              </span>
            </span>
          </div>
        </div>

        {/* Dialog Footer */}
        <DialogFooter className="bg-muted/20 px-6 py-3.5 border-t border-border/60 flex items-center justify-between sm:justify-between">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="text-xs h-9 px-4 text-muted-foreground hover:text-foreground"
          >
            {isDownloaded ? "Close" : "Cancel"}
          </Button>

          <div className="flex items-center gap-2">
            {isDownloaded ? (
              <Button
                onClick={onClose}
                className="text-xs h-9 px-4 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              >
                <Check className="mr-1.5 h-3.5 w-3.5" />
                Done
              </Button>
            ) : (
              <Button
                onClick={handleExportClick}
                disabled={isExportDisabled}
                className="text-xs h-9 px-4 font-semibold shadow-xs"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Generating Export...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-3.5 w-3.5" />
                    Export to Excel
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
