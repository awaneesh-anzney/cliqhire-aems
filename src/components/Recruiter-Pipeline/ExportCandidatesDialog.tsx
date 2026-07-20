import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { pipelineStages, mapUIStageToBackendStage } from "./dummy-data";
import { exportCandidatesToExcel, getExportFields } from "@/services/recruitmentPipelineService";
import { toast } from "sonner";
import { Download, Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface ExportCandidatesDialogProps {
    isOpen: boolean;
    onClose: () => void;
    pipelineId: string;
    jobTitle: string;
}

export function ExportCandidatesDialog({
    isOpen,
    onClose,
    pipelineId,
    jobTitle,
}: ExportCandidatesDialogProps) {
    const [selectedStages, setSelectedStages] = useState<string[]>([]);
    const [isExporting, setIsExporting] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    const [exportMode, setExportMode] = useState<"all" | "custom">("all");
    const [fieldGroups, setFieldGroups] = useState<any[]>([]);
    const [alwaysKeys, setAlwaysKeys] = useState<string[]>([]);
    const [selectedFields, setSelectedFields] = useState<string[]>([]);
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
    const [isLoadingFields, setIsLoadingFields] = useState(false);

    const isAllSelected = selectedStages.length === pipelineStages.length;

    useEffect(() => {
        if (isOpen) {
            setIsLoadingFields(true);
            getExportFields()
                .then((res) => {
                    if (res.success && res.data) {
                        setFieldGroups(res.data.groups || []);
                        setAlwaysKeys(res.data.alwaysKeys || []);
                        
                        const defaultExpanded: Record<string, boolean> = {};
                        (res.data.groups || []).forEach((g: any, index: number) => {
                            defaultExpanded[g.name] = index === 0; // expand first section by default
                        });
                        setExpandedGroups(defaultExpanded);
                        
                        // Initialize selected fields with alwaysKeys
                        setSelectedFields(res.data.alwaysKeys || []);
                    }
                })
                .catch((err) => {
                    console.error("Failed to fetch export fields", err);
                    toast.error("Failed to load export field options");
                })
                .finally(() => {
                    setIsLoadingFields(false);
                });
        }
    }, [isOpen]);

    useEffect(() => {
        return () => {
            if (downloadUrl) {
                window.URL.revokeObjectURL(downloadUrl);
            }
        };
    }, [downloadUrl]);

    const handleClose = () => {
        if (downloadUrl) {
            window.URL.revokeObjectURL(downloadUrl);
            setDownloadUrl(null);
        }
        setIsExporting(false);
        setSelectedStages([]);
        setExportMode("all");
        setSelectedFields(alwaysKeys);
        onClose();
    };

    const handleToggleAll = (checked: boolean) => {
        if (checked) {
            setSelectedStages([...pipelineStages]);
        } else {
            setSelectedStages([]);
        }
        if (downloadUrl) {
            window.URL.revokeObjectURL(downloadUrl);
            setDownloadUrl(null);
        }
    };

    const handleToggleStage = (stage: string, checked: boolean) => {
        if (checked) {
            setSelectedStages((prev) => [...prev, stage]);
        } else {
            setSelectedStages((prev) => prev.filter((s) => s !== stage));
        }
        if (downloadUrl) {
            window.URL.revokeObjectURL(downloadUrl);
            setDownloadUrl(null);
        }
    };

    const handleExport = async () => {
        if (selectedStages.length === 0) {
            toast.warning("Please select at least one stage to export.");
            return;
        }

        if (exportMode === "custom" && selectedFields.length === 0) {
            toast.warning("Please select at least one column to export.");
            return;
        }

        setIsExporting(true);
        setDownloadUrl(null);

        try {
            const backendStages = isAllSelected
                ? []
                : selectedStages.map(mapUIStageToBackendStage);

            const fieldsParam = exportMode === "all" ? ["all"] : selectedFields;

            const blob = await exportCandidatesToExcel(pipelineId, backendStages, fieldsParam);

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([blob]));
            setDownloadUrl(url);

            toast.success("Export ready for download!");
        } catch (error: any) {
            console.error("Export failed:", error);
            toast.error("Failed to export candidates. Please try again.");
        } finally {
            setIsExporting(false);
        }
    };

    const handleDownloadFile = () => {
        if (!downloadUrl) return;

        const link = document.createElement("a");
        link.href = downloadUrl;

        // Clean up text for filename
        const cleanJobTitle = jobTitle.replace(/[^a-zA-Z0-9_-]/g, "_");
        link.setAttribute("download", `Candidate_Details_${cleanJobTitle}.xlsx`);

        document.body.appendChild(link);
        link.click();

        // Cleanup
        link.parentNode?.removeChild(link);
        handleClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Export Candidates</DialogTitle>
                    <DialogDescription>
                        Select the pipeline stages and columns you want to export.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-6">
                    {/* Stages Selection */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold">Pipeline Stages</Label>
                        <div className="flex items-center space-x-2 border-b pb-2">
                            <Checkbox
                                id="stage-all"
                                checked={isAllSelected}
                                onCheckedChange={(checked) => handleToggleAll(checked as boolean)}
                            />
                            <Label htmlFor="stage-all" className="font-semibold cursor-pointer">
                                All Stages
                            </Label>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pl-2">
                            {pipelineStages.map((stage) => (
                                <div key={stage} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`stage-${stage}`}
                                        checked={selectedStages.includes(stage)}
                                        onCheckedChange={(checked) => handleToggleStage(stage, checked as boolean)}
                                    />
                                    <Label htmlFor={`stage-${stage}`} className="font-medium cursor-pointer text-sm">
                                        {stage}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Fields Selection */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold">Columns to Export</Label>
                        <div className="flex bg-muted p-1 rounded-lg">
                            <button 
                                onClick={() => {
                                    setExportMode("all");
                                    if (downloadUrl) {
                                        window.URL.revokeObjectURL(downloadUrl);
                                        setDownloadUrl(null);
                                    }
                                }}
                                className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-colors ${exportMode === "all" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                All Columns
                            </button>
                            <button 
                                onClick={() => {
                                    setExportMode("custom");
                                    if (downloadUrl) {
                                        window.URL.revokeObjectURL(downloadUrl);
                                        setDownloadUrl(null);
                                    }
                                }}
                                className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition-colors ${exportMode === "custom" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                Custom Columns
                            </button>
                        </div>

                        {exportMode === "custom" && (
                            <div className="border rounded-lg overflow-hidden max-h-[250px] overflow-y-auto bg-card">
                                {isLoadingFields ? (
                                    <div className="flex items-center justify-center p-8">
                                        <Loader2 className="h-6 w-6 animate-spin text-brand" />
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {fieldGroups.map((group) => (
                                            <div key={group.name} className="flex flex-col">
                                                <button
                                                    onClick={() => setExpandedGroups(prev => ({ ...prev, [group.name]: !prev[group.name] }))}
                                                    className="flex items-center justify-between p-2.5 hover:bg-muted/50 transition-colors bg-muted/20 text-left"
                                                >
                                                    <span className="text-xs font-semibold">{group.name}</span>
                                                    {expandedGroups[group.name] ? (
                                                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </button>
                                                {expandedGroups[group.name] && (
                                                    <div className="p-3 grid grid-cols-2 gap-3 bg-card">
                                                        {group.fields.map((field: any) => (
                                                            <div key={field.key} className="flex items-start space-x-2">
                                                                <Checkbox
                                                                    id={`field-${field.key}`}
                                                                    checked={field.always || selectedFields.includes(field.key)}
                                                                    disabled={field.always}
                                                                    onCheckedChange={(checked) => {
                                                                        if (field.always) return;
                                                                        if (checked) {
                                                                            setSelectedFields(prev => [...prev, field.key]);
                                                                        } else {
                                                                            setSelectedFields(prev => prev.filter(k => k !== field.key));
                                                                        }
                                                                        if (downloadUrl) {
                                                                            window.URL.revokeObjectURL(downloadUrl);
                                                                            setDownloadUrl(null);
                                                                        }
                                                                    }}
                                                                />
                                                                <Label 
                                                                    htmlFor={`field-${field.key}`} 
                                                                    className={`text-xs leading-snug ${field.always ? 'text-muted-foreground cursor-not-allowed' : 'font-medium cursor-pointer'}`}
                                                                >
                                                                    {field.header}
                                                                    {field.always && <span className="ml-1 text-[9px] text-brand uppercase tracking-wider block mt-0.5">(Required)</span>}
                                                                </Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Green Progress Indicator */}
                    {isExporting && (
                        <div className="flex items-center justify-center space-x-2 text-green-600 bg-green-50 p-2 rounded-md">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm font-medium">Preparing export data...</span>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex flex-col sm:flex-row items-center justify-end gap-2 sm:gap-0 mt-2">
                    <Button variant="outline" onClick={handleClose} disabled={isExporting} className="w-full sm:w-auto">
                        Cancel
                    </Button>

                    {!downloadUrl ? (
                        <Button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="w-full sm:w-auto sm:ml-2 min-w-[100px]"
                        >
                            Export
                        </Button>
                    ) : (
                        <Button
                            onClick={handleDownloadFile}
                            className="w-full sm:w-auto sm:ml-2 min-w-[100px] bg-green-600 hover:bg-green-700 text-white"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
