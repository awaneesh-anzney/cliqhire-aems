"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getTeamMembers } from "@/services/teamMembersService";
import { createReferredUser, getReferredList } from "@/services/referredService";
import { Loader2, Search, Users, UserPlus, Check, X, ShieldCheck, Mail, Phone, Briefcase } from "lucide-react";
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

  const handleSaveReferredUser = async (data: { name: string; email: string; phone: string; position: string ;}) => {
    try {
      setIsCreating(true);
      await createReferredUser(data);
      toast.success('Referred user added successfully');
      await loadUsers();
      setIsReferredDialogOpen(false);
    } catch (error) {
      console.log('Error creating referred user:', error);
      toast.error(`${(error as any)?.message || 'Failed to add referred user'}`);
      throw error; // Re-throw to let the dialog know
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
    }
  }, [open, initialShowTeam, initialShowReferred]);

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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Select value={searchBy} onValueChange={(v: any) => setSearchBy(v)}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Search by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="role">Role</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search by ${searchBy}`}
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center p-1 bg-muted/50 rounded-lg border border-border/50">
              <button
                type="button"
                onClick={() => setShowTeam(!showTeam)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200",
                  showTeam 
                    ? "bg-background text-primary shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Users className={cn("h-3.5 w-3.5", showTeam ? "text-primary" : "text-muted-foreground")} />
                <span>Team</span>
                {showTeam && <Check className="h-3 w-3 ml-0.5" />}
              </button>
              <button
                type="button"
                onClick={() => setShowReferred(!showReferred)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200",
                  showReferred 
                    ? "bg-background text-primary shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <UserPlus className={cn("h-3.5 w-3.5", showReferred ? "text-primary" : "text-muted-foreground")} />
                <span>Referred</span>
                {showReferred && <Check className="h-3 w-3 ml-0.5" />}
              </button>
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted px-2 py-1 rounded-md">
              {filtered.length} {filtered.length === 1 ? 'user' : 'users'} found
            </div>
          </div>
        </div>

        <div className="mt-3">
          <div className="h-80 border rounded-md">
            {loading ? (
              <div className="h-full flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading users...
              </div>
            ) : (
              <ScrollArea className="h-80">
                <div className="p-2 space-y-2">
                  {filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                       <Users className="h-10 w-10 mb-2 opacity-10" />
                       <p className="text-sm font-medium">No users found</p>
                    </div>
                  )}
                  {filtered.map((u) => (
                    <button
                      key={u._id || u.id || `${u.email}-${u.name}`}
                      className="group w-full text-left p-3 rounded-xl border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all duration-200 relative overflow-hidden"
                      onClick={() => {
                        const fullName = `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.name || u.email || "";
                        onSelect({ ...u, name: fullName });
                        onClose();
                      }}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{u.name}</span>
                          {u.type === 'team' && (
                            <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
                          )}
                        </div>
                        {u.type === 'referred' ? (
                          <span className="text-[9px] font-black uppercase tracking-tighter bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/10">
                            Referred
                          </span>
                        ) : (
                          <span className="text-[9px] font-black uppercase tracking-tighter bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full border border-blue-500/10">
                            Internal
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                        {u.email && (
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                            <Mail className="h-3 w-3 opacity-50" />
                            {u.email}
                          </div>
                        )}
                        {u.phone && (
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                            <Phone className="h-3 w-3 opacity-50" />
                            {u.phone}
                          </div>
                        )}
                        {u.teamRole && (
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                            <Briefcase className="h-3 w-3 opacity-50" />
                            {u.teamRole}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-border mt-4">
          <ReferredByDialog
            open={isReferredDialogOpen}
            onOpenChange={setIsReferredDialogOpen}
            onSave={handleSaveReferredUser}
            loading={isCreating}
          >
            <Button variant="outline" type="button" className="rounded-xl border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-all font-bold">
              <UserPlus className="mr-2 h-4 w-4" />
              Add New Referred User
            </Button>
          </ReferredByDialog>
          <Button variant="ghost" onClick={onClose} className="font-bold text-muted-foreground hover:text-foreground">Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
