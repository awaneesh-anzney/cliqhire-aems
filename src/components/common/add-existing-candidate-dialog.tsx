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

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 400);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 50;

  const getCandidateDisplayName = (candidate: Candidate) => {
    return candidate.name || "Unknown Candidate";
  };

  const toggleCandidateSelection = (candidate: Candidate) => {
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
    if (currentOpen) {
      setPage(1);
      setHasMore(true);
      setCandidates([]);
      fetchCandidates(1, "", true);
    } else {
      setSearchTerm("");
      setSelectedCandidateIds([]);
      setSelectedCandidates([]);
    }
  }, [currentOpen]);

  useEffect(() => {
    if (currentOpen && page === 1) fetchCandidates(1, debouncedSearchTerm, true);
    else if (currentOpen) fetchCandidates(page, debouncedSearchTerm, false);
  }, [page, debouncedSearchTerm, currentOpen]);

  const handleAddCandidates = async () => {
    if (selectedCandidateIds.length === 0) return;
    setLoading(true);
    try {
      if (isPipeline && pipelineId) {
        await Promise.all(selectedCandidateIds.map(id => addCandidateToPipeline(pipelineId, id)));
      } else {
        await Promise.all(selectedCandidateIds.map(id => candidateService.applyToJob(id, jobId)));
      }
      toast.success(`Attached ${selectedCandidateIds.length} candidate(s) to ${jobTitle}`);
      onCandidatesAdded?.(selectedCandidateIds, selectedCandidates);
      setOpen(false);
    } catch (error) {
      toast.error("Process failed. Please try again.");
    } finally {
      setLoading(false);
    }
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
          <div className="bg-slate-900 p-5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <UserPlus className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <DialogTitle className="text-xl font-black text-white tracking-tight">Attach Talent</DialogTitle>
                <DialogDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none flex items-center gap-1.5 pt-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> SYNCING WITH: <span className="text-primary-foreground/80">{jobTitle}</span>
                </DialogDescription>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[9px] font-black text-white uppercase tracking-tighter">Live Pool</span>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Search & Selection Side (Left) */}
            <div className="flex-1 flex flex-col p-5 border-r border-slate-100 bg-white">
              <div className="mb-4 space-y-3">
                <div className="space-y-1">
                  <div className="relative group">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-all" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search talent database..."
                      className="pl-9 h-10 border-slate-100 bg-slate-50/50 font-black focus:border-primary shadow-none rounded-xl transition-all text-sm w-full"
                    />
                  </div>
                </div>

                <div className="relative h-[250px] border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/30">
                  <div className="p-3 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Available Profiles</span>
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
                                : "bg-white border-transparent hover:border-slate-100 hover:bg-slate-50"
                            )}
                          >
                            <div className={cn(
                              "h-8 w-8 rounded-lg flex items-center justify-center transition-colors shrink-0",
                              isSelected ? "bg-primary text-white" : "bg-indigo-50 text-indigo-500"
                            )}>
                              {isSelected ? <CheckCircle2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-[11px] font-black text-slate-800 truncate">{candidate.name}</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black rounded uppercase tracking-tighter truncate">
                                  {candidate.currentJobTitle || "Experience Pending"}
                                </span>
                                <span className="text-[9px] text-slate-500 font-medium truncate flex-1">
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
                          <Search className="w-5 h-5 text-slate-200" />
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {searchTerm ? "No talent found" : "Type to search..."}
                          </p>
                        </div>
                      )
                    )}
                    {hasMore && !loading && candidates.length > 0 && (
                      <div className="p-2 text-center">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Scroll for more</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100">
                <div className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                  <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-[9px] font-black text-blue-600 leading-tight tracking-tight uppercase">
                    Candidates will be synced to the job pipeline immediately after selection.
                  </p>
                </div>
              </div>
            </div>

            {/* Selected Queue Side (Right) */}
            <div className="w-[300px] bg-slate-50/50 p-6 flex flex-col shrink-0 border-l border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Selected Talent
                </h3>
                <div className="px-2 py-0.5 bg-slate-900 text-white text-[9px] font-black rounded-md">
                  {selectedCandidateIds.length}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2 pb-4">
                {selectedCandidates.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCandidates.map((candidate) => (
                      <div key={candidate._id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm relative group animate-in slide-in-from-right-4 duration-300">
                        <button
                          onClick={() => toggleCandidateSelection(candidate)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg z-10"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-black text-slate-900 tracking-tight">{candidate.name}</span>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary truncate">
                              <Mail className="w-3 h-3" />
                              {candidate.email}
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                              <MapPin className="w-3 h-3" /> {candidate.location || "Global"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-3xl opacity-50">
                    <User className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Selected Queue Empty</p>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-auto">
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
