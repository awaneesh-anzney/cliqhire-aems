"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getTeamMembers } from "@/services/teamMembersService";
import { createReferredUser, getReferredList } from "@/services/referredService";
import { 
  Loader2, 
  Search, 
  Users, 
  UserPlus, 
  Check, 
  X, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Briefcase,
  User as UserIcon,
  Sparkles
} from "lucide-react";
import { ReferredByDialog } from "@/components/Referred/referredBy-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type User = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  teamRole?: string;
  type?: 'team' | 'referred';
  phone?: string;
  position?: string;
};

interface UserSelectDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (user: User) => void;
  title?: string;
  initialShowTeam?: boolean;
  initialShowReferred?: boolean;
}

function getInitials(name?: string): string {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function UserSelectDialog({ 
  open, 
  onClose, 
  onSelect, 
  title = "Select User",
  initialShowTeam = true,
  initialShowReferred = true
}: UserSelectDialogProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [searchBy, setSearchBy] = useState<"name" | "email" | "role">("name");
  const [showTeam, setShowTeam] = useState(initialShowTeam);
  const [showReferred, setShowReferred] = useState(initialShowReferred);
  const [isReferredDialogOpen, setIsReferredDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleSaveReferredUser = async (data: { name: string; phone: string; email?: string; position?: string; countryCode?: string }) => {
    try {
      setIsCreating(true);
      await createReferredUser(data);
      toast.success('Referred user added successfully');
      await loadUsers();
      setIsReferredDialogOpen(false);
    } catch (error) {
      console.log('Error creating referred user:', error);
      toast.error(`${(error as any)?.message || 'Failed to add referred user'}`);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      const [teamRes, referredRes] = await Promise.all([
        getTeamMembers(),
        getReferredList()
      ]);

      const teamMembers = (teamRes.teamMembers || []).map((user: any) => ({
        ...user,
        type: 'team' as const,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || user.email || 'Unknown'
      }));

      const referredUsers = (referredRes || []).map((user: any) => ({
        ...user,
        type: 'referred' as const,
        name: user.name || user.email || 'Unknown',
        email: user.email || '',
        teamRole: user.position || 'Referred Contact'
      }));

      setUsers([...teamMembers, ...referredUsers]);
    } catch (e) {
      console.error('Error loading users:', e);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadUsers();
      setShowTeam(initialShowTeam);
      setShowReferred(initialShowReferred);
      setSearch("");
    }
  }, [open, initialShowTeam, initialShowReferred]);

  const teamCount = useMemo(() => users.filter(u => u.type === 'team').length, [users]);
  const referredCount = useMemo(() => users.filter(u => u.type === 'referred').length, [users]);

  const filtered = useMemo(() => {
    if (!users) return [];

    let result = users;

    // Filter by type (team/referred)
    result = result.filter(user => {
      if (showTeam && user.type === 'team') return true;
      if (showReferred && user.type === 'referred') return true;
      return false;
    });

    // Filter by search
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(user => {
        if (searchBy === 'name' && user.name?.toLowerCase().includes(searchLower)) return true;
        if (searchBy === 'email' && user.email?.toLowerCase().includes(searchLower)) return true;
        if (searchBy === 'role' && user.teamRole?.toLowerCase().includes(searchLower)) return true;
        return false;
      });
    }

    return result;
  }, [users, search, searchBy, showTeam, showReferred]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-background shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-foreground">{title}</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Select a team member or referral partner from directory
                </DialogDescription>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/80">
              {filtered.length} {filtered.length === 1 ? 'user' : 'users'}
            </span>
          </div>
        </DialogHeader>

        {/* Filter & Search Bar */}
        <div className="p-5 pb-3 space-y-3 bg-muted/20 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Select value={searchBy} onValueChange={(v: any) => setSearchBy(v)}>
              <SelectTrigger className="w-32 h-10 rounded-xl bg-background border-border/80 font-semibold text-xs shrink-0">
                <SelectValue placeholder="Search by" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/80 shadow-lg">
                <SelectItem value="name" className="text-xs font-semibold">Name</SelectItem>
                <SelectItem value="email" className="text-xs font-semibold">Email</SelectItem>
                <SelectItem value="role" className="text-xs font-semibold">Role</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
              <Input
                placeholder={`Search user by ${searchBy}...`}
                className="pl-9 pr-8 h-10 rounded-xl bg-background border-border/80 text-xs sm:text-sm font-semibold"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          
          {/* Segmented Badges */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowTeam(!showTeam)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                showTeam 
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 shadow-xs" 
                  : "bg-background text-muted-foreground border-border/70 hover:text-foreground"
              )}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Internal Team</span>
              <span className="text-[10px] ml-0.5 px-1.5 py-0.2 rounded-full bg-blue-500/15">
                {teamCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowReferred(!showReferred)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                showReferred 
                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 shadow-xs" 
                  : "bg-background text-muted-foreground border-border/70 hover:text-foreground"
              )}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Referred Contacts</span>
              <span className="text-[10px] ml-0.5 px-1.5 py-0.2 rounded-full bg-purple-500/15">
                {referredCount}
              </span>
            </button>
          </div>
        </div>

        {/* User Items List */}
        <div className="p-4">
          <div className="h-[300px] rounded-xl border border-border/80 bg-background overflow-hidden">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-xs font-semibold">Loading directory...</span>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="p-2 space-y-1.5">
                  {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                       <Users className="h-10 w-10 mb-2 opacity-20" />
                       <p className="text-sm font-bold text-foreground">No users found</p>
                       <p className="text-xs text-muted-foreground mt-0.5">Try searching with a different keyword or toggle</p>
                    </div>
                  ) : (
                    filtered.map((u) => {
                      const fullName = `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.name || u.email || "";
                      const isTeam = u.type === 'team';

                      return (
                        <button
                          key={u._id || u.id || `${u.email}-${u.name}`}
                          type="button"
                          className="group w-full text-left p-2.5 rounded-xl border border-transparent hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-200 flex items-center justify-between gap-3"
                          onClick={() => {
                            onSelect({ ...u, name: fullName });
                            onClose();
                          }}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Avatar Initials */}
                            <div className={cn(
                              "w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition-transform group-hover:scale-105",
                              isTeam 
                                ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20" 
                                : "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                            )}>
                              {getInitials(fullName)}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors truncate">
                                  {fullName}
                                </span>
                                {isTeam ? (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 uppercase tracking-tight">
                                    Internal
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 uppercase tracking-tight">
                                    Referral
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground truncate font-medium">
                                {u.email && (
                                  <span className="flex items-center gap-1 truncate">
                                    <Mail className="h-3 w-3 opacity-60 shrink-0" />
                                    <span className="truncate">{u.email}</span>
                                  </span>
                                )}
                                {u.teamRole && (
                                  <span className="hidden sm:flex items-center gap-1 truncate">
                                    <Briefcase className="h-3 w-3 opacity-60 shrink-0" />
                                    <span className="truncate">{u.teamRole}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                              Select
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-muted/40 dark:bg-muted/20 border-t border-border/70 flex items-center justify-between gap-3">
          <ReferredByDialog
            open={isReferredDialogOpen}
            onOpenChange={setIsReferredDialogOpen}
            onSave={handleSaveReferredUser}
            loading={isCreating}
          >
            <Button 
              variant="outline" 
              type="button" 
              className="rounded-xl border-dashed border-2 border-primary/30 hover:border-primary hover:bg-primary/5 text-primary text-xs font-bold h-9 px-3"
            >
              <UserPlus className="mr-1.5 h-3.5 w-3.5" />
              Add New Referral
            </Button>
          </ReferredByDialog>

          <Button 
            variant="ghost" 
            onClick={onClose} 
            className="font-bold text-muted-foreground hover:text-foreground text-xs h-9 rounded-xl px-4"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
