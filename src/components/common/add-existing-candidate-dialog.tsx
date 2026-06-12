"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
import {
  Loader2,
  User,
  Mail,
  X,
  Search,
  UserPlus,
  MapPin,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ArrowLeft,
  SearchIcon,
  Plus,
  Info,
} from "lucide-react";
import { candidateService, Candidate } from "@/services/candidateService";
import { addCandidateToPipeline } from "@/services/recruitmentPipelineService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface AddExistingCandidateDialogProps {
  jobId: string;
  jobTitle: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCandidatesAdded?: (candidateIds: string[], candidateData?: Candidate[]) => void;
  isPipeline?: boolean;
  pipelineId?: string;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function AddExistingCandidateDialog({
  jobId,
  jobTitle,
  trigger,
  onCandidatesAdded,
  open,
  onOpenChange,
  isPipeline = false,
  pipelineId
}: AddExistingCandidateDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = typeof open === "boolean" && typeof onOpenChange === "function";
  const currentOpen = isControlled ? (open as boolean) : internalOpen;

  const setOpen = (value: boolean) => {
    if (isControlled && onOpenChange) onOpenChange(value);
    else setInternalOpen(value);
  };

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<Candidate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [duplicateConfirmData, setDuplicateConfirmData] = useState<{
    message: string;
    duplicates: Array<{ id: string; name: string; reason?: string }>;
  } | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 50;

  const getCandidateDisplayName = (candidate: Candidate) => {
    return candidate.name || "Unknown Candidate";
  };

  const toggleCandidateSelection = (candidate: Candidate) => {
    setError(null);
    setDuplicateConfirmData(null);
    const isSelected = selectedCandidateIds.includes(candidate._id || "");
    if (isSelected) {
      setSelectedCandidateIds(prev => prev.filter(id => id !== candidate._id));
      setSelectedCandidates(prev => prev.filter(c => c._id !== candidate._id));
    } else {
      setSelectedCandidateIds(prev => [...prev, candidate._id || ""]);
      setSelectedCandidates(prev => [...prev, candidate]);
    }
  };

  const fetchCandidates = async (currentPage: number, search: string, replace: boolean = false) => {
    if (!currentOpen) return;
    setLoading(true);
    try {
      const response = await candidateService.getCandidates({
        page: currentPage,
        limit: LIMIT,
        search: search
      });
      const newCandidates = response.candidates;
      setCandidates(prev => {
        if (replace) return newCandidates;
        const existingIds = new Set(prev.map(c => c._id));
        return [...prev, ...newCandidates.filter(c => !existingIds.has(c._id))];
      });
      setHasMore(newCandidates.length === LIMIT);
    } catch (error) {
      toast.error("Failed to load talent pool.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setError(null);
    setDuplicateConfirmData(null);
    if (currentOpen) {
      setPage(1);
      setHasMore(true);
      // We don't clear candidates here anymore, let the next useEffect handle it
    } else {
      setSearchTerm("");
      setSelectedCandidateIds([]);
      setSelectedCandidates([]);
      setCandidates([]);
    }
  }, [currentOpen]);

  // Handle search term changes - reset to page 1
  useEffect(() => {
    if (currentOpen) {
      setPage(1);
      setCandidates([]); // Clear existing list to show only search results
      setError(null);
      setDuplicateConfirmData(null);
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (currentOpen) {
      fetchCandidates(page, debouncedSearchTerm, page === 1);
    }
  }, [page, debouncedSearchTerm, currentOpen]);

  const performSync = async (candidateIds: string[], candidateData: Candidate[], force: boolean = false) => {
    setError(null);
    setLoading(true);
    try {
      if (isPipeline && pipelineId) {
        const response = await addCandidateToPipeline(pipelineId, {
          candidateIds,
          force
        });
        if (response.success) {
          toast.success(response.message || `Attached candidate(s) successfully.`);
          onCandidatesAdded?.(candidateIds, candidateData);
          setOpen(false);
        } else {
          const msg = response.message || "Failed to attach candidates.";
          setError(msg);
          toast.error(msg);
        }
      } else {
        await Promise.all(candidateIds.map(id => candidateService.applyToJob(id, jobId)));
        toast.success(`Attached ${candidateIds.length} candidate(s) to ${jobTitle}`);
        onCandidatesAdded?.(candidateIds, candidateData);
        setOpen(false);
      }
    } catch (err: any) {
      console.error("Error adding candidates:", err);
      const responseData = err.response?.data;
      if (responseData && responseData.data?.requiresConfirmation) {
        setDuplicateConfirmData({
          message: responseData.message || "Duplicate candidates found in the pipeline.",
          duplicates: responseData.data.duplicates || []
        });
      } else {
        const msg = responseData?.message || err.message || "Process failed. Please try again.";
        setError(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddCandidates = async () => {
    if (selectedCandidateIds.length === 0) return;
    await performSync(selectedCandidateIds, selectedCandidates, false);
  };

  const handleForceSync = async () => {
    setDuplicateConfirmData(null);
    await performSync(selectedCandidateIds, selectedCandidates, true);
  };

  const handleRemoveDuplicatesAndSync = async () => {
    if (!duplicateConfirmData) return;
    const duplicateIds = new Set(duplicateConfirmData.duplicates.map(d => d.id));
    const newSelectedIds = selectedCandidateIds.filter(id => !duplicateIds.has(id));
    const newSelectedCandidates = selectedCandidates.filter(c => !duplicateIds.has(c._id || ""));

    setSelectedCandidateIds(newSelectedIds);
    setSelectedCandidates(newSelectedCandidates);
    setDuplicateConfirmData(null);

    if (newSelectedIds.length === 0) {
      toast.info("All selected candidates were duplicates and have been removed.");
      return;
    }

    await performSync(newSelectedIds, newSelectedCandidates, false);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 30 && hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  const enhancedTrigger = trigger && React.isValidElement(trigger)
    ? React.cloneElement(trigger as React.ReactElement<any>, {
      onClick: () => setOpen(true),
      type: "button",
    })
    : trigger;

  return (
    <>
      {enhancedTrigger}
      <Dialog open={currentOpen} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl h-[580px] flex flex-col">
          <div className="bg-foreground p-5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <UserPlus className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <DialogTitle className="text-xl font-black text-white tracking-tight">Attach Talent</DialogTitle>
                <DialogDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none flex items-center gap-1.5 pt-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> SYNCING WITH: <span className="text-primary-foreground/80">{jobTitle}</span>
                </DialogDescription>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-card/10 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[9px] font-black text-white uppercase tracking-tighter">Live Pool</span>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Search & Selection Side (Left) */}
            <div className="flex-1 flex flex-col p-5 border-r border-border bg-card">
              <div className="mb-4 space-y-3">
                <div className="space-y-1">
                  <div className="relative group">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-all" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search talent database..."
                      className="pl-9 h-10 border-border bg-muted/50 font-black focus:border-primary shadow-none rounded-xl transition-all text-sm w-full"
                    />
                  </div>
                </div>

                <div className="relative h-[250px] border border-border rounded-2xl overflow-hidden bg-muted/30">
                  <div className="p-3 bg-card border-b border-border flex items-center justify-between shrink-0">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Available Profiles</span>
                    {loading && <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />}
                  </div>
                  <div className="h-[200px] overflow-y-auto custom-scrollbar p-2 space-y-1" onScroll={handleScroll}>
                    {candidates.length > 0 ? (
                      candidates.map((candidate) => {
                        const isSelected = selectedCandidateIds.includes(candidate._id || "");
                        return (
                          <div
                            key={candidate._id}
                            onClick={() => toggleCandidateSelection(candidate)}
                            className={cn(
                              "flex items-center gap-3 p-2 rounded-xl cursor-pointer border transition-all group/item",
                              isSelected 
                                ? "bg-primary/5 border-primary/20" 
                                : "bg-card border-transparent hover:border-border hover:bg-muted"
                            )}
                          >
                            <div className={cn(
                              "h-8 w-8 rounded-lg flex items-center justify-center transition-colors shrink-0",
                              isSelected ? "bg-primary text-white" : "bg-indigo-50 text-indigo-500"
                            )}>
                              {isSelected ? <CheckCircle2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-[11px] font-black text-foreground truncate">{candidate.name}</span>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black rounded uppercase tracking-tighter truncate">
                                  {candidate.currentJobTitle || "Title Pending"}
                                </span>
                                <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black rounded uppercase tracking-tighter truncate flex items-center gap-1">
                                  <Briefcase className="w-2.5 h-2.5" />
                                  {candidate.experience || "Exp. Pending"}
                                </span>
                                <span className="text-[9px] text-muted-foreground font-medium truncate">
                                  {candidate.email}
                                </span>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="h-5 w-5 bg-primary/10 rounded-full flex items-center justify-center">
                                <Plus className="w-3 h-3 text-primary rotate-45" />
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      !loading && (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center gap-2">
                          <Search className="w-5 h-5 text-muted-foreground" />
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            {searchTerm ? "No talent found" : "Type to search..."}
                          </p>
                        </div>
                      )
                    )}
                    {hasMore && !loading && candidates.length > 0 && (
                      <div className="p-2 text-center">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Scroll for more</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-border">
                <div className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                  <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-[9px] font-black text-blue-600 leading-tight tracking-tight uppercase">
                    Candidates will be synced to the job pipeline immediately after selection.
                  </p>
                </div>
              </div>
            </div>

            {/* Selected Queue Side (Right) */}
            <div className="w-[300px] bg-muted/50 p-6 flex flex-col shrink-0 border-l border-border overflow-y-auto custom-scrollbar">
              {duplicateConfirmData ? (
                <div className="flex-1 flex flex-col justify-between h-full min-h-[400px]">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-amber-600 font-black text-xs uppercase tracking-wider">
                      <Sparkles className="w-4 h-4" /> Duplicate Warning
                    </div>
                    <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2">
                      <p className="text-[10px] font-bold text-amber-800 leading-normal">
                        {duplicateConfirmData.message}
                      </p>
                      <div className="max-h-[150px] overflow-y-auto custom-scrollbar space-y-1 pr-1">
                        {duplicateConfirmData.duplicates.map((dup, i) => (
                          <div key={dup.id || i} className="text-[9px] font-black text-amber-700 bg-white/60 px-2 py-1 rounded border border-amber-100 flex items-center justify-between">
                            <span className="truncate">{dup.name}</span>
                            <span className="text-[8px] font-medium text-amber-500 shrink-0">Already Added</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <p className="text-[9px] font-bold text-muted-foreground leading-normal uppercase">
                      Would you like to skip duplicate profiles and sync the rest, or automatically remove duplicates from your selection and sync?
                    </p>
                  </div>

                  <div className="space-y-2 pt-4">
                    <Button
                      onClick={handleForceSync}
                      disabled={loading}
                      className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-black rounded-xl text-[10px] uppercase tracking-wider shadow-md"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Force Sync Remaining"}
                    </Button>
                    <Button
                      onClick={handleRemoveDuplicatesAndSync}
                      disabled={loading}
                      variant="outline"
                      className="w-full h-10 border-border hover:bg-muted text-foreground font-black rounded-xl text-[10px] uppercase tracking-wider"
                    >
                      Remove Duplicates & Sync
                    </Button>
                    <Button
                      onClick={() => setDuplicateConfirmData(null)}
                      disabled={loading}
                      variant="ghost"
                      className="w-full h-10 text-muted-foreground hover:text-foreground font-black text-[10px] uppercase tracking-wider"
                    >
                      Go Back
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4 shrink-0">
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Selected Talent
                    </h3>
                    <div className="px-2 py-0.5 bg-foreground text-white text-[9px] font-black rounded-md">
                      {selectedCandidateIds.length}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2 pb-4">
                    {selectedCandidates.length > 0 ? (
                      <div className="space-y-2">
                        {selectedCandidates.map((candidate) => (
                          <div key={candidate._id} className="p-3 bg-card rounded-xl border border-border shadow-sm relative group animate-in slide-in-from-right-4 duration-300">
                            <button
                              onClick={() => toggleCandidateSelection(candidate)}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg z-10"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-black text-foreground tracking-tight">{candidate.name}</span>
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary truncate">
                                  <Mail className="w-3 h-3" />
                                  {candidate.email}
                                </div>
                                <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground">
                                  <MapPin className="w-3 h-3" /> {candidate.location || "Global"}
                                </div>
                                <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground">
                                  <Briefcase className="w-3 h-3" /> {candidate.experience || "Experience Pending"}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-border rounded-3xl opacity-50">
                        <User className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Selected Queue Empty</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-auto shrink-0">
                    {error && (
                      <div className="p-3 mb-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-[10px] font-bold text-red-600 leading-tight animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <X className="w-3.5 h-3.5 shrink-0 mt-0.5 cursor-pointer hover:text-red-800 transition-colors" onClick={() => setError(null)} />
                        <span className="flex-1">{error}</span>
                      </div>
                    )}
                    <Button
                      onClick={handleAddCandidates}
                      disabled={selectedCandidateIds.length === 0 || loading}
                      className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black shadow-lg shadow-primary/20 rounded-xl transition-all active:scale-[0.98] group text-xs uppercase tracking-wider"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                        <div className="flex items-center justify-center gap-2">
                          {isPipeline ? "Process Now" : "Sync Talent"}
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </>
  );
}
