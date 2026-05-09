"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MultiSelector,
  MultiSelectorTrigger,
  MultiSelectorInput,
  MultiSelectorContent,
  MultiSelectorList,
  MultiSelectorItem,
} from "@/components/ui/multi-select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, User, MapPin, Briefcase, Mail, Phone, X } from "lucide-react";
import { candidateService, Candidate } from "@/services/candidateService";
import { toast } from "sonner";

interface AddCandidateDialogProps {
  jobId: string;
  jobTitle: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCandidatesAdded?: (candidateIds: string[], candidateData?: Candidate[]) => void;
}

export function AddCandidateDialog({ jobId, jobTitle, trigger, onCandidatesAdded, open, onOpenChange }: AddCandidateDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = typeof open === "boolean" && typeof onOpenChange === "function";
  const currentOpen = isControlled ? (open as boolean) : internalOpen;
  const setOpen = (value: boolean) => {
    if (isControlled && onOpenChange) {
      onOpenChange(value);
    } else {
      setInternalOpen(value);
    }
  };
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Helper functions - defined first to avoid reference errors
  const getCandidateDisplayName = (candidate: Candidate) => {
    const name = candidate.name || "Unknown Candidate";
    const jobTitle = candidate.currentJobTitle ? ` - ${candidate.currentJobTitle}` : "";
    return `${name}${jobTitle}`;
  };
  
  // Create a mapping from candidate display name to candidate ID
  const getCandidateIdFromDisplayName = (displayName: string) => {
    const candidate = candidates.find(candidate => getCandidateDisplayName(candidate) === displayName);
    return candidate?._id;
  };
  
  // Create a mapping from candidate ID to candidate display name
  const getDisplayNameFromCandidateId = (candidateId: string) => {
    const candidate = candidates.find(candidate => candidate._id === candidateId);
    return candidate ? getCandidateDisplayName(candidate) : '';
  };
  
  // Convert selected candidate IDs to display names for the MultiSelector
  const selectedCandidateDisplayNames = selectedCandidateIds.map(id => getDisplayNameFromCandidateId(id)).filter(Boolean);
  
  // Handle selection changes from MultiSelector (display names)
  const handleSelectionChange = (displayNames: string[]) => {
    const candidateIds = displayNames.map(name => getCandidateIdFromDisplayName(name)).filter(Boolean) as string[];
    setSelectedCandidateIds(candidateIds);
  };

  // Fetch candidates when dialog opens
  useEffect(() => {
    if (currentOpen) {
      fetchCandidates();
    }
  }, [currentOpen]);

  // Reset search term when dialog closes
  useEffect(() => {
    if (!currentOpen) {
      setSearchTerm("");
      setSelectedCandidateIds([]);
    }
  }, [currentOpen]);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const response = await candidateService.getCandidates({ limit: 100 });
      setCandidates(response.candidates);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      toast.error("Failed to fetch candidates. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCandidates = async () => {
    if (selectedCandidateIds.length === 0) {
      toast.error("Please select at least one candidate");
      return;
    }

    try {
      // Apply each selected candidate to the job
      await Promise.all(selectedCandidateIds.map((candidateId) => 
        candidateService.applyToJob(candidateId, jobId)
      ));
      
      // Get the selected candidate data
      const selectedCandidates = candidates.filter(candidate => 
        selectedCandidateIds.includes(candidate._id || "")
      );
      
      toast.success(`Successfully added ${selectedCandidateIds.length} candidate(s) to ${jobTitle}`);
      
      // Call the callback to update the Candidates tab with candidate data
      if (onCandidatesAdded) {
        onCandidatesAdded(selectedCandidateIds, selectedCandidates);
      }
      
      // Reset and close dialog
      setSelectedCandidateIds([]);
      setOpen(false);
    } catch (error) {
      console.error("Error adding candidates to job:", error);
      toast.error("Failed to add candidates to job. Please try again.");
    }
  };

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.currentJobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCandidateEmail = (candidate: Candidate) => {
    return candidate.email || "Email not specified";
  };

  // Ensure trigger reliably opens the dialog even if Trigger-asChild props don't attach
  const enhancedTrigger = trigger && React.isValidElement(trigger)
    ? React.cloneElement(trigger as React.ReactElement<any>, {
        onClick: (e: any) => {
          setOpen(true);
          const orig = (trigger as any).props?.onClick;
          if (typeof orig === "function") orig(e);
        },
        onMouseDown: (e: any) => {
          // Some environments attach handlers on mouse down; open here too
          setOpen(true);
          const orig = (trigger as any).props?.onMouseDown;
          if (typeof orig === "function") orig(e);
        },
        type: (trigger as any).props?.type || "button",
      })
    : trigger;

  return (
    <>
      {enhancedTrigger}
      <Dialog open={currentOpen} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Add Candidate
            </DialogTitle>
            <DialogDescription>
              Select one or more candidates to add to <strong>{jobTitle}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[70vh] h-[500px] ">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading candidates...</span>
              </div>
            ) : (
              <>
                <div className="">
                  <label className="text-sm font-medium">Search and select candidates</label>
                  <MultiSelector
                    values={selectedCandidateDisplayNames}
                    onValuesChange={handleSelectionChange}
                    className="w-full"
                  >
                    <MultiSelectorTrigger className="min-h-10">
                      <MultiSelectorInput
                        placeholder="Search candidates..."
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                      />
                    </MultiSelectorTrigger>
                    <MultiSelectorContent>
                      <MultiSelectorList>
                        {filteredCandidates.length > 0 ? (
                          filteredCandidates.map((candidate) => (
                            <MultiSelectorItem
                              key={candidate._id}
                              value={getCandidateDisplayName(candidate)}
                              className="flex items-center gap-2"
                            >
                              <div className="flex flex-col items-start">
                                <span className="font-medium">
                                  {getCandidateDisplayName(candidate)}
                                </span>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Mail className="h-3 w-3" />
                                  {getCandidateEmail(candidate)}
                                </div>
                              </div>
                            </MultiSelectorItem>
                          ))
                        ) : (
                          <div className="p-4 text-center text-muted-foreground">
                            {searchTerm
                              ? "No candidates found matching your search"
                              : "No candidates available"}
                          </div>
                        )}
                      </MultiSelectorList>
                    </MultiSelectorContent>
                  </MultiSelector>
                </div>

                {/* Detailed view of selected candidates */}
                {selectedCandidateIds.length > 0 && (
                  <div className="mt-4 border-t pt-4">
                    <h3 className="text-sm font-semibold mb-3">Selected Candidate Details</h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {selectedCandidateIds.map((candidateId) => {
                        const candidate = candidates.find((c) => c._id === candidateId);
                        if (!candidate) return null;
                        
                        return (
                          <div key={candidateId} className="p-4 rounded-lg border bg-muted/50">
                            <div className="flex justify-between items-start">
                              <div className="flex-1 grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-muted-foreground min-w-[80px]">
                                      Name:
                                    </span>
                                    <span className="text-sm font-medium">
                                      {candidate.name || "Unnamed Candidate"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-muted-foreground min-w-[80px]">
                                      Current Position:
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      {candidate.currentJobTitle || "—"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-muted-foreground min-w-[80px]">
                                      Email:
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      {candidate.email || "—"}
                                    </span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-muted-foreground min-w-[80px]">
                                      Location:
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      {candidate.location || "—"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-muted-foreground min-w-[80px]">
                                      Phone:
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      {candidate.phone || "—"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-muted-foreground min-w-[80px]">
                                      Experience:
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      {candidate.experience ? `${candidate.experience}` : "—"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <Button
                                onClick={() =>
                                  setSelectedCandidateIds((ids) =>
                                    ids.filter((id) => id !== candidate._id),
                                  )
                                }
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-700 ml-2"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddCandidates}
              disabled={selectedCandidateIds.length === 0 || loading}
            >
              Add{" "}
              {selectedCandidateIds.length > 0
                ? `${selectedCandidateIds.length} Candidate${selectedCandidateIds.length > 1 ? "s" : ""}`
                : "Candidates"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
