"use client";

import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, X, Users } from "lucide-react";
import { getTeamMembers } from "@/services/teamMembersService";
import type { TeamMember } from "@/types/teamMember";

interface DynamicMemberSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (memberIds: string[]) => void;
  title: string;
  positionName: string;    // e.g. "hiringManager" — shows ALL active users, no role filter
  maxUsers: number | null; // null = unlimited
  initialSelections?: string[];
  isLoading?: boolean;
}

/**
 * Member selection dialog that works with the dynamic job positions API.
 * Does NOT filter by role — shows all active team members and lets the admin
 * assign anyone to any position. maxUsers constraint is enforced in UI.
 */
export function DynamicMemberSelectionDialog({
  open,
  onClose,
  onSelect,
  title,
  positionName,
  maxUsers,
  initialSelections = [],
  isLoading: externalLoading = false,
}: DynamicMemberSelectionDialogProps) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setSelectedIds(initialSelections);
      setSearch("");
    }
  }, [open]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["team-members"],
    queryFn: () => getTeamMembers(),
  });

  const allMembers: TeamMember[] = data?.teamMembers || [];

  const filteredMembers = useMemo(() => {
    // Show all active team members (no role filter — position is defined by backend config)
    const active = allMembers.filter(
      (m) => m.status === "Active" || m.isActive === "Active"
    );
    if (!search.trim()) return active;
    const term = search.toLowerCase();
    return active.filter((m) => {
      const fullName = `${m.firstName || ""} ${m.lastName || ""}`.toLowerCase();
      return (
        fullName.includes(term) ||
        (m.email || "").toLowerCase().includes(term) ||
        (m.teamRole || m.role || "").toLowerCase().includes(term)
      );
    });
  }, [allMembers, search]);

  const isMultiple = maxUsers === null || maxUsers > 1;

  const handleToggle = (memberId: string) => {
    if (isMultiple) {
      if (selectedIds.includes(memberId)) {
        setSelectedIds((prev) => prev.filter((id) => id !== memberId));
      } else {
        // Enforce maxUsers
        if (maxUsers !== null && selectedIds.length >= maxUsers) {
          return;
        }
        setSelectedIds((prev) => [...prev, memberId]);
      }
    } else {
      setSelectedIds([memberId]);
    }
  };

  const handleSave = () => {
    onSelect(selectedIds);
    onClose();
  };

  const atMax = maxUsers !== null && selectedIds.length >= maxUsers;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {title}
            {maxUsers !== null && (
              <Badge variant="outline" className="text-xs font-normal">
                max {maxUsers}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email or role…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Selected badges */}
          {selectedIds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedIds.map((id) => {
                const member = allMembers.find((m) => m._id === id);
                if (!member) return null;
                return (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="flex items-center gap-1 text-xs"
                  >
                    {member.firstName} {member.lastName}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleToggle(id)}
                    />
                  </Badge>
                );
              })}
            </div>
          )}

          {atMax && (
            <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-md">
              Maximum {maxUsers} user(s) allowed for this position.
            </p>
          )}

          {/* Member list */}
          {isLoading && (
            <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading members…
            </div>
          )}
          {isError && (
            <div className="text-sm text-red-500 py-4">
              Failed to load team members. Please try again.
            </div>
          )}
          {!isLoading && !isError && (
            <ScrollArea className="h-[300px] border rounded-md">
              <div className="divide-y">
                {filteredMembers.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No active members found{search ? ` for "${search}"` : ""}
                  </div>
                ) : (
                  filteredMembers.map((member) => {
                    const isSelected = selectedIds.includes(member._id);
                    const isDisabled = atMax && !isSelected;
                    return (
                      <div
                        key={member._id}
                        className={`p-3 flex items-center gap-3 transition-colors ${
                          isDisabled
                            ? "opacity-40 cursor-not-allowed"
                            : "cursor-pointer hover:bg-muted/50"
                        } ${isSelected ? "bg-muted" : ""}`}
                        onClick={() => !isDisabled && handleToggle(member._id)}
                      >
                        <Checkbox
                          checked={isSelected}
                          disabled={isDisabled}
                          onCheckedChange={() => !isDisabled && handleToggle(member._id)}
                          id={`member-${member._id}`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                          {(member.teamRole || member.role) && (
                            <p className="text-xs text-muted-foreground truncate">
                              {member.teamRole || member.role}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={selectedIds.length === 0 || externalLoading}
          >
            {externalLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            {isMultiple
              ? `Assign (${selectedIds.length})`
              : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
