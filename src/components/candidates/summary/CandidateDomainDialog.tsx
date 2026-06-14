"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useCandidateDomains, useCreateCandidateDomain } from "@/hooks/useCandidateDomains";
import { CandidateDomain } from "@/services/candidateService";
import { Search, Plus, Loader2, Sparkles, FolderKanban, Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface CandidateDomainDialogProps {
  open: boolean;
  onClose: () => void;
  currentValues?: CandidateDomain[];
  onSave: (newValue: { ids: string[]; domains: CandidateDomain[] }) => void;
}

export function CandidateDomainDialog({
  open,
  onClose,
  currentValues = [],
  onSave,
}: CandidateDomainDialogProps) {
  // TanStack Query for domain master list (fetch active domains)
  const { data, isLoading, isError } = useCandidateDomains({ isActive: true, limit: 200 });
  const createDomainMutation = useCreateCandidateDomain();

  const domainList = data?.data || [];

  // Local state for search & selections
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomains, setSelectedDomains] = useState<CandidateDomain[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form state for creating a new domain
  const [newDomainName, setNewDomainName] = useState("");
  const [newDomainDesc, setNewDomainDesc] = useState("");

  // Sync selected domains with current values when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedDomains(currentValues);
      setSearchQuery("");
      setIsAddingNew(false);
      setNewDomainName("");
      setNewDomainDesc("");
    }
  }, [open, currentValues]);

  // Filter domains based on search
  const filteredDomains = domainList.filter((domain) =>
    domain.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleSelect = (domain: CandidateDomain) => {
    const isSelected = selectedDomains.some((d) => d._id === domain._id);
    if (isSelected) {
      setSelectedDomains(selectedDomains.filter((d) => d._id !== domain._id));
    } else {
      setSelectedDomains([...selectedDomains, domain]);
    }
  };

  const handleCreateDomainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomainName.trim()) return;

    try {
      const createdDomain = await createDomainMutation.mutateAsync({
        name: newDomainName.trim(),
        description: newDomainDesc.trim() || undefined,
        isActive: true,
      });

      if (createdDomain) {
        // Auto-select the newly created domain
        setSelectedDomains((prev) => {
          if (prev.some((d) => d._id === createdDomain._id)) return prev;
          return [...prev, createdDomain];
        });

        // Reset form
        setNewDomainName("");
        setNewDomainDesc("");
        setIsAddingNew(false);
      }
    } catch (err) {
      // Errors are already handled by the hook's toast.error
    }
  };

  const handleSave = () => {
    const ids = selectedDomains.map((d) => d._id);
    onSave({ ids, domains: selectedDomains });
    onClose();
  };

  const handleCancel = () => {
    setSelectedDomains(currentValues);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl overflow-hidden border-none shadow-2xl p-0">
        <DialogHeader className="p-6 pb-4 bg-muted/40 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand/10 text-brand rounded-lg">
              <FolderKanban className="w-5 h-5 text-brand" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
              Manage Candidate Domains
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Main search and select list */}
          {!isAddingNew ? (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                <Input
                  placeholder="Search domains..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 rounded-xl border border-border/80 focus-visible:ring-brand"
                />
              </div>

              {/* Selection Summary */}
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground/80 px-1">
                <span>
                  {selectedDomains.length} domain{selectedDomains.length !== 1 ? "s" : ""} selected
                </span>
                {selectedDomains.length > 0 && (
                  <Button
                    variant="link"
                    onClick={() => setSelectedDomains([])}
                    className="h-auto p-0 text-xs font-bold text-red-500 hover:text-red-600 hover:no-underline"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              {/* Scrollable checklist container */}
              <div className="border border-border/60 rounded-xl max-h-[200px] overflow-y-auto p-2 bg-muted/20 space-y-1.5 custom-scrollbar">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin text-brand" />
                    <span className="text-xs">Loading domains...</span>
                  </div>
                ) : isError ? (
                  <div className="text-center py-6 text-xs text-red-500 font-medium">
                    Failed to load domains from API.
                  </div>
                ) : filteredDomains.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <p className="text-xs text-muted-foreground mb-3 font-medium">
                      No domains found matching &quot;{searchQuery}&quot;
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg h-8 gap-1.5 border-dashed border-muted-foreground/40 text-xs font-bold"
                      onClick={() => {
                        setNewDomainName(searchQuery);
                        setIsAddingNew(true);
                      }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add &quot;{searchQuery}&quot; as new Domain
                    </Button>
                  </div>
                ) : (
                  filteredDomains.map((domain) => {
                    const isChecked = selectedDomains.some((d) => d._id === domain._id);
                    return (
                      <div
                        key={domain._id}
                        onClick={() => handleToggleSelect(domain)}
                        className={cn(
                          "flex items-start gap-3 p-2.5 rounded-lg border border-transparent transition-all cursor-pointer select-none",
                          isChecked
                            ? "bg-brand/5 border-brand/20 shadow-sm"
                            : "hover:bg-muted/50"
                        )}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => handleToggleSelect(domain)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-0.5"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold text-foreground leading-tight">
                            {domain.name}
                          </span>
                          {domain.description && (
                            <span className="text-[11px] text-muted-foreground mt-0.5 leading-normal truncate max-w-[380px]">
                              {domain.description}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Add New Trigger */}
              <div className="pt-2 border-t border-border/40">
                <Button
                  variant="outline"
                  onClick={() => setIsAddingNew(true)}
                  className="w-full rounded-xl gap-2 font-bold text-xs h-10 border-brand/20 bg-brand/5 text-brand hover:bg-brand/10 hover:text-brand"
                >
                  <Plus className="w-4 h-4" />
                  Create New Domain
                </Button>
              </div>
            </div>
          ) : (
            /* Inline creation form */
            <form onSubmit={handleCreateDomainSubmit} className="space-y-4">
              <div className="bg-brand/5 border border-brand/10 rounded-xl p-3 flex items-start gap-2 text-brand">
                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="text-[11px] font-semibold leading-normal">
                  The domain you create will be added to the master list, and automatically selected for this candidate.
                </span>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="domain-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Domain Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="domain-name"
                  placeholder="e.g. Healthcare, IT Services..."
                  value={newDomainName}
                  onChange={(e) => setNewDomainName(e.target.value)}
                  required
                  className="rounded-xl border border-border/80 focus-visible:ring-brand h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="domain-desc" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Description
                </Label>
                <Textarea
                  id="domain-desc"
                  placeholder="Provide a brief sector description..."
                  value={newDomainDesc}
                  onChange={(e) => setNewDomainDesc(e.target.value)}
                  className="rounded-xl border border-border/80 focus-visible:ring-brand min-h-[80px]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsAddingNew(false)}
                  className="flex-1 rounded-xl text-xs font-bold h-10"
                >
                  Back to List
                </Button>
                <Button
                  type="submit"
                  disabled={createDomainMutation.isPending || !newDomainName.trim()}
                  className="flex-1 rounded-xl bg-brand hover:bg-brand/90 text-brand-foreground text-xs font-bold h-10 gap-1.5"
                >
                  {createDomainMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Create Domain
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Footer actions for main state */}
        {!isAddingNew && (
          <DialogFooter className="p-6 bg-muted/30 border-t border-border/50 flex flex-row items-center justify-end gap-3">
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="rounded-xl text-xs font-bold h-10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="rounded-xl bg-foreground hover:bg-black text-white px-6 text-xs font-bold h-10 shadow-lg"
            >
              Save Changes
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
