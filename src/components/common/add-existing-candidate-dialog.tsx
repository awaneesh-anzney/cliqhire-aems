"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  UserPlus,
  Search,
  X,
  MapPin,
  Briefcase,
  Check,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  Users,
  Mail,
  Phone,
  Sparkles,
} from "lucide-react";
import { candidateService, Candidate } from "@/services/candidateService";
import { addCandidateToPipeline } from "@/services/recruitmentPipelineService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

export function AddExistingCandidateDialog({
  jobId,
  jobTitle,
  trigger,
  onCandidatesAdded,
  open,
  onOpenChange,
  isPipeline = false,
  pipelineId,
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
  const [totalCount, setTotalCount] = useState<number>(0);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<Candidate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [duplicateConfirmData, setDuplicateConfirmData] = useState<{
    message: string;
    duplicates: Array<{ id: string; name: string; reason?: string }>;
  } | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 30;

  // 300ms Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchCandidates = useCallback(
    async (currentPage: number, search: string, replace: boolean = false) => {
      if (!currentOpen) return;
      setLoading(true);
      try {
        const response = await candidateService.getCandidates({
          page: currentPage,
          limit: LIMIT,
          search: search || undefined,
        });

        const newCandidates = response.candidates || [];
        setTotalCount(response.total || response.results || 0);

        setCandidates((prev) => {
          if (replace) return newCandidates;
          const existingIds = new Set(prev.map((c) => c._id));
          return [...prev, ...newCandidates.filter((c) => !existingIds.has(c._id))];
        });

        setHasMore(newCandidates.length === LIMIT);
      } catch (err) {
        console.error("Failed to load talent pool:", err);
        toast.error("Failed to load candidates from talent pool.");
      } finally {
        setLoading(false);
      }
    },
    [currentOpen]
  );

  // Dialog open/close lifecycle
  useEffect(() => {
    setError(null);
    setDuplicateConfirmData(null);
    if (currentOpen) {
      setPage(1);
      setHasMore(true);
      fetchCandidates(1, debouncedSearchTerm, true);
    } else {
      setSearchTerm("");
      setDebouncedSearchTerm("");
      setSelectedCandidateIds([]);
      setSelectedCandidates([]);
      setCandidates([]);
    }
  }, [currentOpen, fetchCandidates]);

  // Search filter changed: reload first page
  useEffect(() => {
    if (currentOpen) {
      setPage(1);
      setError(null);
      setDuplicateConfirmData(null);
      fetchCandidates(1, debouncedSearchTerm, true);
    }
  }, [debouncedSearchTerm, currentOpen, fetchCandidates]);

  // Page changed: load next page
  useEffect(() => {
    if (currentOpen && page > 1) {
      fetchCandidates(page, debouncedSearchTerm, false);
    }
  }, [page, debouncedSearchTerm, currentOpen, fetchCandidates]);

  const toggleCandidateSelection = (candidate: Candidate) => {
    setError(null);
    setDuplicateConfirmData(null);
    const id = candidate._id || "";
    if (!id) return;

    const isSelected = selectedCandidateIds.includes(id);
    if (isSelected) {
      setSelectedCandidateIds((prev) => prev.filter((item) => item !== id));
      setSelectedCandidates((prev) => prev.filter((c) => c._id !== id));
    } else {
      setSelectedCandidateIds((prev) => [...prev, id]);
      setSelectedCandidates((prev) => [...prev, candidate]);
    }
  };

  const handleSelectAllCurrentPage = () => {
    const unselected = candidates.filter((c) => c._id && !selectedCandidateIds.includes(c._id));
    if (unselected.length === 0) {
      // Deselect all on current list
      const currentIds = new Set(candidates.map((c) => c._id));
      setSelectedCandidateIds((prev) => prev.filter((id) => !currentIds.has(id)));
      setSelectedCandidates((prev) => prev.filter((c) => !currentIds.has(c._id)));
    } else {
      // Add unselected
      setSelectedCandidateIds((prev) => [...prev, ...unselected.map((c) => c._id!)]);
      setSelectedCandidates((prev) => [...prev, ...unselected]);
    }
  };

  const handleClearAllSelected = () => {
    setSelectedCandidateIds([]);
    setSelectedCandidates([]);
    setDuplicateConfirmData(null);
    setError(null);
  };

  const performSync = async (candidateIds: string[], candidateData: Candidate[], force: boolean = false) => {
    setError(null);
    setLoading(true);
    try {
      if (isPipeline && pipelineId) {
        const response = await addCandidateToPipeline(pipelineId, {
          candidateIds,
          force,
        });

        if (response.success) {
          toast.success(response.message || `Attached ${candidateIds.length} candidate(s) to pipeline.`);
          onCandidatesAdded?.(candidateIds, candidateData);
          setOpen(false);
        } else {
          const msg = response.message || "Failed to attach candidates to pipeline.";
          setError(msg);
          toast.error(msg);
        }
      } else {
        await Promise.all(candidateIds.map((id) => candidateService.applyToJob(id, jobId)));
        toast.success(`Attached ${candidateIds.length} candidate(s) to ${jobTitle}`);
        onCandidatesAdded?.(candidateIds, candidateData);
        setOpen(false);
      }
    } catch (err: any) {
      console.error("Error attaching candidates:", err);
      const responseData = err.response?.data;
      if (responseData && responseData.data?.requiresConfirmation) {
        setDuplicateConfirmData({
          message: responseData.message || "Duplicate candidates found in this pipeline.",
          duplicates: responseData.data.duplicates || [],
        });
      } else {
        const msg = responseData?.message || err.message || "Action failed. Please try again.";
        setError(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAttachSubmit = async () => {
    if (selectedCandidateIds.length === 0) return;
    await performSync(selectedCandidateIds, selectedCandidates, false);
  };

  const handleForceSync = async () => {
    setDuplicateConfirmData(null);
    await performSync(selectedCandidateIds, selectedCandidates, true);
  };

  const handleRemoveDuplicatesAndSync = async () => {
    if (!duplicateConfirmData) return;
    const duplicateIds = new Set(duplicateConfirmData.duplicates.map((d) => d.id));
    const newSelectedIds = selectedCandidateIds.filter((id) => !duplicateIds.has(id));
    const newSelectedCandidates = selectedCandidates.filter((c) => !duplicateIds.has(c._id || ""));

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
    if (scrollHeight - scrollTop <= clientHeight + 40 && hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  const enhancedTrigger =
    trigger && React.isValidElement(trigger)
      ? React.cloneElement(trigger as React.ReactElement<any>, {
          onClick: () => setOpen(true),
          type: "button",
        })
      : trigger;

  return (
    <>
      {enhancedTrigger}
      <Dialog open={currentOpen} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl w-full h-[620px] p-0 overflow-hidden border border-border bg-card shadow-2xl rounded-2xl flex flex-col">
          {/* Top Bar / Executive Header */}
          <DialogHeader className="px-6 py-4 border-b border-border bg-card flex flex-row items-center justify-between shrink-0 space-y-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center border border-brand/20 shrink-0 shadow-xs">
                <UserPlus className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <DialogTitle className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
                  <span>Attach Existing Candidates</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground truncate flex items-center gap-1.5 mt-0.5">
                  <span>Attaching to:</span>
                  <Badge variant="outline" className="text-[11px] font-semibold text-brand border-brand/20 bg-brand/5 max-w-[280px] truncate px-1.5 py-0">
                    {jobTitle}
                  </Badge>
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50 border border-border text-xs font-medium text-muted-foreground">
                <Users className="w-3.5 h-3.5 text-muted-foreground/70" />
                <span>Pool: <strong className="text-foreground">{totalCount}</strong></span>
              </div>
            </div>
          </DialogHeader>

          {/* Main Body: Split-Pane Architecture */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            {/* Left Pane: Talent Pool Browser */}
            <div className="flex-1 flex flex-col min-w-0 bg-card p-4 border-r border-border">
              {/* Search & Actions Bar */}
              <div className="flex items-center gap-2 mb-3 shrink-0">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search candidate by name, email, phone, role..."
                    className="pl-8.5 pr-8 h-8.5 text-xs bg-muted/20 border-border rounded-lg font-medium focus-visible:ring-brand"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {candidates.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllCurrentPage}
                    className="h-8.5 text-xs font-semibold rounded-lg border-border hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 px-2.5"
                  >
                    {candidates.every((c) => c._id && selectedCandidateIds.includes(c._id))
                      ? "Deselect Page"
                      : "Select Page"}
                  </Button>
                )}
              </div>

              {/* Candidate Profiles List Container */}
              <div
                className="flex-1 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar"
                onScroll={handleScroll}
              >
                {candidates.length > 0 ? (
                  candidates.map((candidate) => {
                    const isSelected = selectedCandidateIds.includes(candidate._id || "");
                    const nameInitials = candidate.name
                      ? candidate.name.split(" ").map((n) => n[0]).join("").slice(0, 2)
                      : "CD";

                    return (
                      <div
                        key={candidate._id}
                        onClick={() => toggleCandidateSelection(candidate)}
                        className={cn(
                          "flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer select-none group",
                          isSelected
                            ? "bg-brand/5 border-brand/40 shadow-2xs"
                            : "bg-card border-border/80 hover:bg-muted/40 hover:border-border"
                        )}
                      >
                        {/* Custom Checkbox Pill */}
                        <div
                          className={cn(
                            "h-5 w-5 rounded-md flex items-center justify-center transition-colors shrink-0",
                            isSelected
                              ? "bg-brand text-white shadow-2xs"
                              : "border border-muted-foreground/30 bg-card group-hover:border-brand/60"
                          )}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                        </div>

                        {/* Avatar */}
                        <Avatar className="h-8 w-8 rounded-lg border border-border shadow-2xs shrink-0">
                          <AvatarImage src={candidate.resume} />
                          <AvatarFallback className="text-[11px] font-bold bg-brand/10 text-brand">
                            {nameInitials}
                          </AvatarFallback>
                        </Avatar>

                        {/* Profile Info */}
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-foreground group-hover:text-brand transition-colors truncate">
                              {candidate.name || "Anonymous Candidate"}
                            </span>
                            {candidate.currentJobTitle && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-muted text-muted-foreground border border-border truncate">
                                {candidate.currentJobTitle}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5 flex-wrap">
                            {candidate.email && (
                              <span className="flex items-center gap-1 truncate max-w-[170px]">
                                <Mail className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                                {candidate.email}
                              </span>
                            )}
                            {candidate.experience && (
                              <span className="flex items-center gap-1 shrink-0">
                                <Briefcase className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                                {candidate.experience}
                              </span>
                            )}
                            {candidate.location && (
                              <span className="flex items-center gap-1 shrink-0">
                                <MapPin className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                                {candidate.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  !loading && (
                    <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center p-6 text-muted-foreground gap-2">
                      <div className="h-10 w-10 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground/60">
                        <Search className="w-5 h-5" />
                      </div>
                      <h4 className="text-xs font-bold text-foreground">No candidate profiles found</h4>
                      <p className="text-[11px] text-muted-foreground max-w-xs">
                        {searchTerm ? `No results match "${searchTerm}". Try a different keyword.` : "The candidate talent pool is currently empty."}
                      </p>
                    </div>
                  )
                )}

                {/* Bottom status / scroll loader */}
                {loading && (
                  <div className="p-3 flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-brand" />
                    <span>Loading talent pool...</span>
                  </div>
                )}
                {hasMore && !loading && candidates.length > 0 && (
                  <div className="p-2 text-center text-[10px] text-muted-foreground/60 font-medium">
                    Scroll down for more candidates
                  </div>
                )}
              </div>
            </div>

            {/* Right Pane: Selected Queue & Confirmation */}
            <div className="w-[310px] sm:w-[330px] flex flex-col border-l border-border bg-muted/15 p-4 shrink-0">
              {duplicateConfirmData ? (
                /* Duplicate Warning View */
                <div className="flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Duplicate Warning</span>
                    </div>

                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2 text-xs">
                      <p className="font-semibold text-amber-900 dark:text-amber-200 leading-snug">
                        {duplicateConfirmData.message}
                      </p>
                      <div className="max-h-[140px] overflow-y-auto custom-scrollbar space-y-1 pr-1">
                        {duplicateConfirmData.duplicates.map((dup, i) => (
                          <div
                            key={dup.id || i}
                            className="text-[11px] font-medium bg-card/80 px-2 py-1 rounded border border-amber-500/20 flex items-center justify-between"
                          >
                            <span className="truncate">{dup.name}</span>
                            <span className="text-[10px] text-amber-600 font-semibold shrink-0">In Pipeline</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Choose to automatically filter out existing duplicates or force attach all selected candidates.
                    </p>
                  </div>

                  <div className="space-y-2 pt-4 mt-auto">
                    <Button
                      onClick={handleRemoveDuplicatesAndSync}
                      disabled={loading}
                      size="sm"
                      className="w-full bg-brand hover:bg-brand/90 text-white font-bold rounded-lg text-xs shadow-xs"
                    >
                      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                      Filter Duplicates & Attach
                    </Button>
                    <Button
                      onClick={handleForceSync}
                      disabled={loading}
                      variant="outline"
                      size="sm"
                      className="w-full border-border hover:bg-muted font-bold rounded-lg text-xs"
                    >
                      Force Attach All
                    </Button>
                    <Button
                      onClick={() => setDuplicateConfirmData(null)}
                      disabled={loading}
                      variant="ghost"
                      size="sm"
                      className="w-full text-muted-foreground font-semibold text-xs"
                    >
                      Go Back
                    </Button>
                  </div>
                </div>
              ) : (
                /* Standard Queue View */
                <>
                  {/* Selected Queue Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-border/80 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand" />
                      <span className="text-xs font-bold text-foreground">Selected Queue</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Badge variant="secondary" className="px-1.5 py-0.2 rounded-md text-[11px] font-bold bg-brand/10 text-brand">
                        {selectedCandidateIds.length}
                      </Badge>
                      {selectedCandidateIds.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearAllSelected}
                          className="h-6 px-1.5 text-[10px] font-semibold text-destructive hover:text-destructive hover:bg-destructive/10 rounded"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Selected Profiles List */}
                  <div className="flex-1 overflow-y-auto space-y-1.5 py-3 pr-1 custom-scrollbar">
                    {selectedCandidates.length > 0 ? (
                      selectedCandidates.map((candidate) => (
                        <div
                          key={candidate._id}
                          className="p-2 bg-card rounded-xl border border-border shadow-2xs relative group flex items-center justify-between gap-2 animate-in fade-in duration-200"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Avatar className="h-6 w-6 rounded-md border border-border shrink-0">
                              <AvatarFallback className="text-[9px] font-extrabold bg-brand/10 text-brand">
                                {candidate.name ? candidate.name.slice(0, 2).toUpperCase() : "CD"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-foreground truncate">
                                {candidate.name}
                              </span>
                              <span className="text-[10px] text-muted-foreground truncate">
                                {candidate.currentJobTitle || candidate.experience || "Talent Candidate"}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCandidateSelection(candidate);
                            }}
                            className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                            title="Remove from queue"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-4 border border-dashed border-border/80 rounded-xl">
                        <Users className="w-7 h-7 text-muted-foreground/30 mb-2" />
                        <h5 className="text-xs font-bold text-foreground">Queue is empty</h5>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed max-w-[200px]">
                          Select candidates from the left panel to attach them to this requisition.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer Action */}
                  <div className="pt-3 border-t border-border/80 mt-auto shrink-0 space-y-2">
                    {error && (
                      <div className="p-2.5 bg-destructive/10 border border-destructive/20 rounded-lg text-xs font-medium text-destructive flex items-center justify-between gap-2">
                        <span className="truncate">{error}</span>
                        <button type="button" onClick={() => setError(null)} className="shrink-0 p-0.5 rounded hover:bg-destructive/20">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <Button
                      type="button"
                      onClick={handleAttachSubmit}
                      disabled={selectedCandidateIds.length === 0 || loading}
                      className="w-full h-9 bg-brand hover:bg-brand/90 text-white font-bold rounded-lg text-xs shadow-xs transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Attaching...</span>
                        </>
                      ) : (
                        <>
                          <span>Attach {selectedCandidateIds.length > 0 ? `(${selectedCandidateIds.length}) Candidates` : "Candidates"}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
