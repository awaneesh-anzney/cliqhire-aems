"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, Shield, User as UserIcon, Calendar, Check, AlertTriangle, Zap, Globe } from "lucide-react";

import { getTeamMemberById, updateTeamMemberStatus } from "@/services/teamMembersService";
import { roleService, Role } from "@/services/roleService";
import { PERMISSION_MODULES } from "@/lib/sidebarModules";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { TeamMemberStatusBadge } from "@/components/teamMembers/team-status-badge";

type ActionKey = "view" | "create" | "edit" | "delete";
const ACTIONS: ActionKey[] = ["view", "create", "edit", "delete"];

export default function TeamMemberDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const teamMemberId = params.id as string;

  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [fullRole, setFullRole] = useState<Role | null>(null);
  const [loadingRoleDetails, setLoadingRoleDetails] = useState(false);

  // Queries
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["teamMember", teamMemberId],
    queryFn: () => getTeamMemberById(teamMemberId),
    enabled: !!teamMemberId,
  });

  const { data: rolesRes, isLoading: isLoadingRoles } = useQuery({
    queryKey: ["roles"],
    queryFn: () => roleService.getRoles(),
  });
  const roles = rolesRes?.data ?? [];

  // Mutations
  const assignRoleMutation = useMutation({
    mutationFn: (roleId: string) => roleService.assignRoleToUser(roleId, teamMemberId),
    onSuccess: (data) => {
      toast.success(data.message || "Role assigned successfully");
      queryClient.invalidateQueries({ queryKey: ["teamMember", teamMemberId] });
      queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Failed to assign role");
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: any }) => updateTeamMemberStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamMember", teamMemberId] });
      queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
    },
  });

  // Effects
  useEffect(() => {
    if (user && roles.length > 0) {
      if (user.roleId) {
        setSelectedRoleId(user.roleId);
      } else if (user.teamRole || user.role) {
        const matchedRole = roles.find(r => r.name === user.teamRole || r.name === user.role);
        if (matchedRole && typeof matchedRole._id === 'string') {
          setSelectedRoleId(matchedRole._id);
        }
      }
    }
  }, [user, roles]);

  useEffect(() => {
    if (selectedRoleId) {
      setLoadingRoleDetails(true);
      roleService.getRoleById(selectedRoleId)
        .then(res => {
          if (res.success && res.data) {
            setFullRole(res.data);
          }
          setLoadingRoleDetails(false);
        })
        .catch(() => setLoadingRoleDetails(false));
    } else {
      setFullRole(null);
    }
  }, [selectedRoleId]);

  const handleSaveRole = () => {
    if (!selectedRoleId) {
      toast.error("Please select a role first");
      return;
    }
    assignRoleMutation.mutate(selectedRoleId);
  };

  const handleStatusChange = async (id: string, newStatus: any) => {
    statusMutation.mutate({ id, status: newStatus });
  };

  if (isLoadingUser) {
    return (
      <div className="p-6 space-y-6 max-w-5xl mx-auto w-full">
        <div className="h-10 w-32 bg-slate-200 animate-pulse rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <div className="h-[300px] w-full bg-slate-200 animate-pulse rounded-xl" />
          </div>
          <div className="md:col-span-2 space-y-6">
            <div className="h-[200px] w-full bg-slate-200 animate-pulse rounded-xl" />
            <div className="h-[400px] w-full bg-slate-200 animate-pulse rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-center text-slate-500 py-24 flex flex-col items-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-semibold text-slate-800">Team Member Not Found</h2>
        <p className="mt-2 text-sm max-w-md mx-auto">The user you are looking for might have been removed or does not exist.</p>
        <Button onClick={() => router.push("/teammembers")} className="mt-6">Back to Team Members</Button>
      </div>
    );
  }

  const selectedRole = fullRole ?? roles.find((r) => r._id === selectedRoleId);
  const totalPerms = selectedRole ? Object.values(selectedRole.permissions ?? {}).reduce((sum, mp) => sum + Object.values(mp).filter(Boolean).length, 0) : 0;
  
  const enabledMods = selectedRole ? PERMISSION_MODULES.filter((m) => {
    const mp = selectedRole.permissions?.[m.moduleKey];
    return mp && Object.values(mp).some(Boolean);
  }) : [];

  return (
    <div className="min-h-screen bg-slate-50/60 pb-12">
      {/* Top Header */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push("/teammembers")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="h-8 w-8 rounded-lg bg-brand/10 flex items-center justify-center">
              <UserIcon className="h-4 w-4 text-brand" />
            </div>
            <h1 className="text-base font-semibold text-slate-800">Profile Details</h1>
          </div>
          <TeamMemberStatusBadge
             id={user._id}
             status={user.status}
             onStatusChange={handleStatusChange}
           />
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Personal Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 text-center border-b border-slate-100 bg-slate-50/50">
              <div className="mx-auto h-24 w-24 rounded-full bg-brand/10 text-brand flex items-center justify-center text-3xl font-bold shadow-inner mb-4">
                {user.firstName?.[0]?.toUpperCase()}{user.lastName?.[0]?.toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-slate-800">{user.firstName} {user.lastName}</h2>
              <p className="text-sm text-slate-500 mt-1 font-medium">{user.teamRole ? user.teamRole.replace(/_/g, ' ') : "No Role Assigned"}</p>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-slate-400 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Email</p>
                  <p className="text-sm font-medium text-slate-800 truncate" title={user.email}>{user.email || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-slate-400 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Phone</p>
                  <p className="text-sm font-medium text-slate-800">{user.phone || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Location</p>
                  <p className="text-sm font-medium text-slate-800">{user.location || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="h-4 w-4 text-slate-400 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Experience</p>
                  <p className="text-sm font-medium text-slate-800">{user.experience || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-slate-400 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Created At</p>
                  <p className="text-sm font-medium text-slate-800">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Roles & Permissions */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
              <Shield className="h-5 w-5 text-brand" />
              <h3 className="font-semibold text-slate-800">User Role & Permissions</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4 max-w-sm mb-8">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block">
                  Assign Team Role
                </label>
                <div className="flex items-center gap-3">
                  <Select value={selectedRoleId} onValueChange={setSelectedRoleId} disabled={isLoadingRoles || assignRoleMutation.isPending}>
                    <SelectTrigger className="h-10 flex-1">
                      <SelectValue placeholder={isLoadingRoles ? "Loading roles..." : "Select Role"} />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role._id || role.id} value={(role._id || role.id) as string}>
                           <div className="flex items-center gap-2">
                            {role.isSystem ? <Globe className="h-3 w-3 text-slate-400" /> : <Shield className="h-3 w-3 text-brand" />}
                            <span>{role.name}</span>
                            {role.isSystem && <span className="text-[10px] text-slate-400 ml-1">(System)</span>}
                           </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleSaveRole} 
                    disabled={!selectedRoleId || assignRoleMutation.isPending || user.roleId === selectedRoleId} 
                    className="h-10 bg-brand hover:bg-brand/90 text-white"
                  >
                    {assignRoleMutation.isPending ? "Saving..." : "Save Role"}
                  </Button>
                </div>
                {user.roleId === selectedRoleId && selectedRoleId && (
                 <p className="text-xs text-emerald-600 flex items-center gap-1 mt-2">
                   <Check className="h-3 w-3" /> This role is currently assigned
                 </p>
                )}
              </div>

              {/* Role Preview Card */}
              {loadingRoleDetails ? (
                <div className="text-center py-10">
                  <div className="h-4 w-32 bg-slate-200 animate-pulse rounded mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Fetching permission details...</p>
                </div>
              ) : selectedRole ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-200 bg-white flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm text-slate-800">Role Capabilities Preview</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Showing effective permissions for {selectedRole.name}</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand/10 text-brand text-xs font-semibold">
                      <Zap className="h-3.5 w-3.5" />
                      {totalPerms} Active Permissions
                    </div>
                  </div>

                  {enabledMods.length > 0 ? (
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {enabledMods.map(mod => {
                        const mp = selectedRole.permissions?.[mod.moduleKey];
                        const actions = ACTIONS.filter((a) => mp?.[a]);
                        return (
                          <div key={mod.moduleKey} className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm hover:border-brand/30 transition-colors">
                            <p className="text-xs font-bold text-slate-700 mb-2 truncate" title={mod.name}>{mod.name}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {actions.map(a => (
                                <span key={a} className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border bg-slate-50 text-slate-600 border-slate-200">
                                  {a}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="px-6 py-10 text-center flex flex-col items-center justify-center">
                      <Shield className="h-8 w-8 text-slate-300 mb-3" />
                      <p className="text-sm font-medium text-slate-600">No capabilities configured</p>
                      <p className="text-xs text-slate-400 mt-1">This role grants no access to system modules.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                   <p className="text-sm text-slate-500">Select a role above to preview capabilities</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
