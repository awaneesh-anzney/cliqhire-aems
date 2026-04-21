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

  const selectedCandidateDisplayNames = useMemo(() => {
    return selectedCandidateIds.map(id => {
      const c = selectedCandidates.find(cand => cand._id === id) || candidates.find(cand => cand._id === id);
      return c ? getCandidateDisplayName(c) : '';
    }).filter(Boolean);
  }, [selectedCandidateIds, selectedCandidates, candidates]);

  const handleSelectionChange = (displayNames: string[]) => {
    const newSelectedIds: string[] = [];
    const newSelectedObjects: Candidate[] = [...selectedCandidates];

    displayNames.forEach(name => {
      const candidate = candidates.find(c => getCandidateDisplayName(c) === name)
        || selectedCandidates.find(c => getCandidateDisplayName(c) === name);
      if (candidate?._id) {
        newSelectedIds.push(candidate._id);
        if (!newSelectedObjects.find(o => o._id === candidate._id)) {
          newSelectedObjects.push(candidate);
        }
      }
    });

    setSelectedCandidateIds(newSelectedIds);
    setSelectedCandidates(newSelectedObjects.filter(o => newSelectedIds.includes(o._id || "")));
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
        <DialogContent className="max-w-5xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl h-[650px] flex flex-col">
          <div className="bg-primary/5 p-6 border-b border-primary/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-inner">
                <UserPlus className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Attach Talent</DialogTitle>
                <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none flex items-center gap-1.5 pt-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> SYNCING WITH: <span className="text-primary">{jobTitle}</span>
                </DialogDescription>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Talent Pool Active</span>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Search & Selection Side (Left) */}
            <div className="flex-1 flex flex-col p-8 border-r border-slate-100 bg-white">
              <div className="mb-6 space-y-4">
                <div className="space-y-1">
                  <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Search Database</Label>
                  <div className="relative group">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-all" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Find by name, role or email..."
                      className="pl-11 h-12 border-slate-200 font-bold focus:border-primary shadow-sm rounded-xl transition-all"
                    />
                  </div>
                </div>

                <div className="relative h-[250px] group border border-slate-100 rounded-2xl overflow-hidden focus-within:border-primary/30 transition-all">
                  <MultiSelector
                    values={selectedCandidateDisplayNames}
                    onValuesChange={handleSelectionChange}
                    className="w-full h-full flex flex-col"
                    shouldFilter={false}
                    onSearch={setSearchTerm}
                  >
                    <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Available Profiles</span>
                      {loading && <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />}
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar" onScroll={handleScroll}>
                      {candidates.length > 0 ? (
                        <div className="p-2 space-y-1">
                          {candidates.map((candidate) => (
                            <MultiSelectorItem
                              key={candidate._id}
                              value={getCandidateDisplayName(candidate)}
                              className="flex items-start gap-3 p-3 rounded-xl hover:bg-primary/5 cursor-pointer border border-transparent transition-all hover:border-primary/10 group/item"
                            >
                              <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover/item:bg-primary/20 group-hover/item:text-primary transition-colors shrink-0">
                                <User className="w-5 h-5" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm font-black text-slate-800 line-clamp-1">{candidate.name}</span>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                                  <Briefcase className="w-3 h-3 text-primary/60" /> {candidate.currentJobTitle || "Experience Pending"}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                                  <Mail className="w-3 h-3 text-primary/60" /> {candidate.email || "No Email"}
                                </div>
                              </div>
                            </MultiSelectorItem>
                          ))}
                          {hasMore && !loading && (
                            <div className="p-4 text-center">
                              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest cursor-pointer hover:text-primary transition-colors" onClick={() => setPage(p => p + 1)}>Scroll for more</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        !loading && (
                          <div className="h-full flex flex-col items-center justify-center p-8 text-center gap-3">
                            <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center">
                              <Search className="w-6 h-6 text-slate-200" />
                            </div>
                            <p className="text-xs font-bold text-slate-400">
                              {searchTerm ? "No specific matches found." : "Waiting for your search..."}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </MultiSelector>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-slate-100 italic">
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-[10px] font-bold text-slate-500 leading-relaxed tracking-tight group-hover:text-slate-700 transition-colors uppercase">
                    Candidates will be notified of the attachment to this job and will appear in the pipeline immediately after selection.
                  </p>
                </div>
              </div>
            </div>

            {/* Selected Queue Side (Right) */}
            <div className="w-[350px] bg-slate-50 p-8 flex flex-col shrink-0 border-l border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> Ready to Attach
                </h3>
                <div className="px-2 py-0.5 bg-primary text-white text-[10px] font-black rounded-lg shadow-sm">
                  {selectedCandidateIds.length}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2 pb-4">
                {selectedCandidates.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCandidates.map((candidate) => (
                      <div key={candidate._id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm relative group animate-in slide-in-from-right-4 duration-300">
                        <button
                          onClick={() => handleSelectionChange(selectedCandidateDisplayNames.filter(n => n !== getCandidateDisplayName(candidate)))}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-slate-800 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 shadow-lg"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-900 tracking-tight mb-1">{candidate.name}</span>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                              <Briefcase className="w-3 h-3" /> {candidate.currentJobTitle || "N/A"}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                              <MapPin className="w-3 h-3" /> {candidate.location || "Remote/Global"}
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

              <div className="pt-6 mt-auto">
                <Button
                  onClick={handleAddCandidates}
                  disabled={selectedCandidateIds.length === 0 || loading}
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black shadow-xl shadow-primary/20 rounded-2xl transition-all active:scale-[0.98] group"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <div className="flex items-center justify-center gap-2">
                      {isPipeline ? "Process to Pipeline" : "Sync to Job"}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
