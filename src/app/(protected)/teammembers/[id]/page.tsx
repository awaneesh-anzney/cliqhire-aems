"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, Shield, User as UserIcon, Calendar, Check, AlertTriangle, Zap, Globe, Edit2, Save, X, Loader2 } from "lucide-react";
import { formatPhoneNumber } from "@/lib/countryCodes";

import { getTeamMemberById, updateTeamMemberStatus, updateTeamMember } from "@/services/teamMembersService";
import { roleService, Role } from "@/services/roleService";
import { PERMISSION_MODULES } from "@/lib/sidebarModules";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { TeamMemberStatusBadge } from "@/components/teamMembers/team-status-badge";
import PhoneInput from "@/components/phone/Phoneinput";
import { LocationSuggestion } from "@/components/location/LocationSuggestion";

type ActionKey = "view" | "create" | "edit" | "delete";
const ACTIONS: ActionKey[] = ["view", "create", "edit", "delete"];

export default function TeamMemberDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const teamMemberId = params?.id as string;

  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [fullRole, setFullRole] = useState<Role | null>(null);
  const [loadingRoleDetails, setLoadingRoleDetails] = useState(false);
  
  // Edit variables
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", email: "", phone: "", countryCode: "SA", location: "", experience: "" });

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

  const editMutation = useMutation({
    mutationFn: (data: any) => updateTeamMember({ _id: teamMemberId, ...data }),
    onSuccess: () => {
      toast.success("Profile updated successfully");
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["teamMember", teamMemberId] });
      queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? error.message ?? "Failed to update profile");
    },
  });

  // Effects
  useEffect(() => {
    if (user && roles.length > 0 && !selectedRoleId) {
      if (user.roleId) {
        setSelectedRoleId(user.roleId);
      } else if (user.teamRole || user.role) {
        const targetName = (user.teamRole || user.role || "").toLowerCase().replace(/_/g, ' ');
        const matchedRole = roles.find(r => 
          r.name.toLowerCase() === targetName || 
          r.name.toLowerCase().replace(/_/g, ' ') === targetName ||
          (r.id && r.id === user.roleId)
        );
        
        if (matchedRole && (matchedRole._id || matchedRole.id)) {
          setSelectedRoleId((matchedRole._id || matchedRole.id) as string);
        }
      }
    }
  }, [user, roles, selectedRoleId]);

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

  const handleEditToggle = () => {
    if (!isEditing && user) {
      setEditForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        countryCode: user.countryCode || "SA",
        location: user.location || "",
        experience: user.experience || "",
      });
    }
    setIsEditing(!isEditing);
  };

  const handleEditSubmit = () => {
    if (!editForm.firstName.trim() || !editForm.lastName.trim() || !editForm.email.trim()) {
      toast.error("First Name, Last Name and Email are required");
      return;
    }
    editMutation.mutate(editForm);
  };

  if (isLoadingUser) {
    return (
      <div className="p-3 space-y-3 w-full mx-auto">

        <div className="h-10 w-32 bg-slate-200 animate-pulse rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-1 space-y-3">
            <div className="h-[300px] w-full bg-slate-200 animate-pulse rounded-xl" />
          </div>
          <div className="md:col-span-3 space-y-3">
            <div className="h-[200px] w-full bg-slate-200 animate-pulse rounded-xl" />
            <div className="h-[400px] w-full bg-slate-200 animate-pulse rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-3 text-center text-slate-500 py-32` flex flex-col items-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-semibold text-slate-800">Team Member Not Found</h2>
        <p className="mt-2 text-sm max-w-md mx-auto">The user you are looking for might have been removed or does not exist.</p>
        <Button onClick={() => router.push("/teammembers")} className="mt-2">Back to Team Members</Button>
      </div>
    );
  }

  const selectedRole = fullRole && (fullRole._id === selectedRoleId || fullRole.id === selectedRoleId) ? fullRole : null;
  const isStatsLoading = loadingRoleDetails || (!!selectedRoleId && !selectedRole);

  const totalPerms = selectedRole ? Object.values(selectedRole.permissions ?? {}).reduce((sum, mp) => sum + Object.values(mp).filter(Boolean).length, 0) : 0;
  
  const enabledMods = selectedRole ? PERMISSION_MODULES.filter((m) => {
    const mp = selectedRole.permissions?.[m.moduleKey];
    return mp && Object.values(mp).some(Boolean);
  }) : [];

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      {/* Dynamic Header */}
      <div className="bg-white border-b sticky top-0 z-30 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-full hover:bg-slate-100 transition-colors" 
            onClick={() => router.push("/teammembers")}
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-slate-900 leading-none">
              {isEditing ? "Editing Profile" : `${user.firstName} ${user.lastName}`}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium text-slate-500">Team Member Profile</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span className="text-xs text-brand font-semibold underline underline-offset-2">{user.email}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <TeamMemberStatusBadge
             id={user._id}
             status={user.status}
             onStatusChange={handleStatusChange}
           />
           {!isEditing ? (
             <Button 
               variant="outline" 
               className="h-9 px-4 text-sm font-medium gap-2 border-slate-200 hover:border-brand hover:text-brand transition-all shadow-sm"
               onClick={handleEditToggle}
             >
               <Edit2 className="h-4 w-4" />
               Edit Profile
             </Button>
           ) : (
             <div className="flex items-center gap-2">
               <Button 
                 variant="ghost" 
                 className="h-9 px-4 text-sm font-medium text-slate-600"
                 onClick={handleEditToggle}
               >
                 Cancel
               </Button>
               <Button 
                 className="h-9 px-4 text-sm font-medium bg-brand hover:bg-brand/90 text-white shadow-sm flex items-center gap-2"
                 onClick={handleEditSubmit}
                 disabled={editMutation.isPending}
               >
                 {editMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                 Save Changes
               </Button>
             </div>
           )}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full mx-auto p-4 md:p-6 lg:p-8">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Panel: Identity & Quick Info */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden pb-4">
              {/* Profile Avatar Section */}
              <div className="p-8 text-center bg-gradient-to-b from-slate-50 to-white">
                <div className="relative inline-block group">
                  <div className="h-32 w-32 rounded-full bg-brand/5 border-2 border-white shadow-xl flex items-center justify-center text-4xl font-black text-brand ring-4 ring-slate-50">
                    {user.firstName?.[0]?.toUpperCase()}{user.lastName?.[0]?.toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-emerald-500 border-4 border-white shadow-lg flex items-center justify-center">
                    <Check className="h-3.5 w-3.5 text-white" />
                  </div>
                </div>
                
                {!isEditing ? (
                  <div className="mt-5">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">{user.firstName} {user.lastName}</h2>
                    <p className="text-sm font-semibold text-brand mt-1 uppercase tracking-wider">
                      {user.teamRole ? user.teamRole.replace(/_/g, ' ') : "Unassigned Role"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 mt-6">
                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1">First Name</label>
                      <Input 
                        value={editForm.firstName} 
                        onChange={e => setEditForm({...editForm, firstName: e.target.value})} 
                        className="h-10 text-sm focus-visible:ring-brand/30" 
                        placeholder="First Name" 
                      />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1">Last Name</label>
                      <Input 
                        value={editForm.lastName} 
                        onChange={e => setEditForm({...editForm, lastName: e.target.value})} 
                        className="h-10 text-sm focus-visible:ring-brand/30" 
                        placeholder="Last Name" 
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Details List */}
              <div className="px-6 py-2 space-y-1">
                 <div className="group p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <Mail className="h-3 w-3" /> Email Address
                    </p>
                    {!isEditing ? (
                      <p className="text-sm font-medium text-slate-800 truncate" title={user.email}>{user.email || "Not Provided"}</p>
                    ) : (
                      <Input value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="h-9 text-sm px-3 w-full bg-slate-50 border-none focus-visible:ring-brand/20" type="email" />
                    )}
                 </div>

                 <div className="group p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <Phone className="h-3 w-3" /> Phone Number
                    </p>
                    {!isEditing ? (
                      <p className="text-sm font-medium text-slate-800">{formatPhoneNumber(user.phone, user.countryCode) || "Not Provided"}</p>
                    ) : (
                      <PhoneInput
                        countryCode={editForm.countryCode}
                        onCountryCodeChange={(code) => setEditForm({ ...editForm, countryCode: code })}
                        phoneNumber={editForm.phone}
                        onPhoneNumberChange={(val) => setEditForm({ ...editForm, phone: val })}
                      />
                    )}
                 </div>

                 <div className="group p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <MapPin className="h-3 w-3" /> Work Location
                    </p>
                    {!isEditing ? (
                      <p className="text-sm font-medium text-slate-800">{user.location || "Office / Remote"}</p>
                    ) : (
                      <LocationSuggestion
                        value={editForm.location}
                        onChange={(val) => setEditForm({ ...editForm, location: val })}
                        placeholder="Search city..."
                      />
                    )}
                 </div>

                 <div className="group p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <Briefcase className="h-3 w-3" /> Total Experience
                    </p>
                    {!isEditing ? (
                      <p className="text-sm font-medium text-slate-800">{user.experience || "N/A"}</p>
                    ) : (
                      <Input value={editForm.experience} onChange={e => setEditForm({...editForm, experience: e.target.value})} className="h-9 text-sm px-3 w-full bg-slate-50 border-none focus-visible:ring-brand/20" />
                    )}
                 </div>
              </div>

              <div className="mx-6 mt-4 pt-4 border-t border-slate-100">
                 <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium tracking-tight">Onboarded On</span>
                    <span className="text-xs text-slate-600 font-bold">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</span>
                 </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Role Management & Matrix */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            
            {/* Quick Stats / Breadth */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-brand/5 flex items-center justify-center text-brand">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Role</p>
                  <p className="text-sm font-bold text-slate-800">{user.teamRole?.replace(/_/g, ' ') || "None"}</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Permissions</p>
                    <div className="flex items-baseline gap-1">
                      {isStatsLoading ? (
                        <div className="h-6 w-8 bg-slate-100 animate-pulse rounded" />
                      ) : (
                        <>
                          <p className="text-xl font-black text-slate-900">{totalPerms}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Actions</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Modules Access</p>
                    <div className="flex items-baseline gap-1">
                      {isStatsLoading ? (
                        <div className="h-6 w-8 bg-slate-100 animate-pulse rounded" />
                      ) : (
                        <>
                          <p className="text-xl font-black text-slate-900">{enabledMods.length}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Modules</p>
                        </>
                      )}
                    </div>
                </div>
              </div>
            </div>

            {/* Role Config Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
              <div className="px-6 py-5 border-b border-slate-100 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-md">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">Authority & Permissions</h3>
                    <p className="text-xs text-slate-500 font-medium">Manage user role and view effective capabilities.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-100 self-start md:self-center">
                  <Select value={selectedRoleId} onValueChange={setSelectedRoleId} disabled={isLoadingRoles || assignRoleMutation.isPending}>
                    <SelectTrigger className="h-10 w-60 bg-white border-slate-200 focus:ring-brand/10 transition-all font-medium">
                      <SelectValue placeholder={isLoadingRoles ? "Loading roles..." : "Select New Role"} />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role._id || role.id} value={(role._id || role.id) as string}>
                           <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${role.isSystem ? 'bg-slate-300' : 'bg-brand'}`} />
                            <span className="text-sm">{role.name}</span>
                            {role.isSystem && <span className="text-[9px] font-black text-slate-400 uppercase ml-1">System</span>}
                           </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleSaveRole} 
                    disabled={!selectedRoleId || assignRoleMutation.isPending || user.roleId === selectedRoleId} 
                    className="h-10 px-4 bg-slate-900 hover:bg-black text-white rounded-lg transition-transform active:scale-95 shadow-sm font-bold text-xs uppercase tracking-widest"
                  >
                    {assignRoleMutation.isPending ? "Assigning..." : "Assign Role"}
                  </Button>
                </div>
              </div>

              {/* Matrix Layout */}
              <div className="flex-1 p-8">
                {loadingRoleDetails ? (
                  <div className="h-full flex flex-col items-center justify-center py-24">
                    <Loader2 className="h-10 w-10 text-brand animate-spin" />
                    <p className="text-sm font-bold text-slate-800 mt-5">Fetching Role DNA...</p>
                    <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Validating permission matrix</p>
                  </div>
                ) : selectedRole ? (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Effective Access Matrix</h4>
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                        <span className="text-xs font-bold text-brand uppercase tracking-wider">{selectedRole.name}</span>
                      </div>
                      <div className="text-xs font-black text-slate-400 uppercase tracking-widest">AEMS Internal Sec</div>
                    </div>

                    {enabledMods.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {enabledMods.map(mod => {
                          const mp = selectedRole.permissions?.[mod.moduleKey];
                          const actions = ACTIONS.filter((a) => mp?.[a]);
                          return (
                            <div key={mod.moduleKey} className="group bg-slate-50/50 rounded-2xl p-5 border border-slate-100 hover:border-brand/40 hover:bg-white hover:shadow-xl hover:shadow-brand/5 transition-all duration-300">
                               <div className="flex items-center justify-between mb-4">
                                  <p className="text-sm font-bold text-slate-800 tracking-tight group-hover:text-brand transition-colors">{mod.name}</p>
                                  <div className="h-7 w-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black group-hover:bg-brand group-hover:text-white transition-all">
                                    {actions.length}
                                  </div>
                               </div>
                               <div className="flex flex-wrap gap-1.5">
                                  {ACTIONS.map(a => (
                                    <div 
                                      key={a} 
                                      className={`
                                        text-[9px] uppercase font-black px-2 py-1 rounded-full border transition-all
                                        ${mp?.[a] 
                                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm' 
                                          : 'bg-slate-50 text-slate-300 border-slate-100 opacity-60'}
                                      `}
                                    >
                                      {a}
                                    </div>
                                  ))}
                               </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="h-full py-20 text-center flex flex-col items-center justify-center">
                        <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-5">
                           <Shield className="h-10 w-10 text-slate-300" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900">Zero Capabilities Detected</h4>
                        <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2">This role grants no access to system modules. Users assigned this role will have base dashboard visibility only.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full py-24 flex flex-col items-center justify-center text-center">
                    <div className="relative">
                       <Zap className="h-20 w-20 text-slate-100 animate-pulse" />
                       <Shield className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-slate-200" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mt-6">Interface Ready</h3>
                    <p className="text-sm text-slate-500 mt-2">Select a role from the top controls to simulate and assign effective permissions.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
