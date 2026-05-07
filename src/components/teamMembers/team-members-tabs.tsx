"use client";
 
 import React, { useState } from "react";
 import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
 import { formatPhoneNumber } from "@/lib/countryCodes";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { MoreVertical, Trash2, Users, Mail, Phone, MapPin, Briefcase, Shield, Loader, User2 } from "lucide-react";
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
 } from "@/components/ui/dropdown-menu";
 import {
   Table,
   TableBody,
   TableCell,
   TableHeader,
   TableHead,
   TableRow,
 } from "@/components/ui/table";
 import { TeamMemberStatusBadge } from "@/components/teamMembers/team-status-badge";
 import { DeleteTeamMemberDialog } from "@/components/teamMembers/delete-team-member-dialog";
 import { getTeamMembers, deleteTeamMember } from "@/services/teamMembersService";
 import { roleService } from "@/services/roleService";
 import { TeamMember, TeamMemberStatus } from "@/types/teamMember";
 import { cn } from "@/lib/utils";
 import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
 
 interface TeamMembersTabsProps {
   onTeamMemberClick?: (teamMemberId: string) => void;
   highlightId?: string;
 }
 
 const headerArr = [
   "Name",
   "Contact",
   "Location",
   "Experience",
   "Role",
   "Status",
   "Actions",
 ];
 
 const getTeamRoleColorClass = (role: string): string => {
   const normalizedRole = role?.toLowerCase() || "";
   switch (normalizedRole) {
     case "admin":
     case "administrator":
       return "bg-blue-50 text-blue-700 border-blue-100";
     case "hiring manager":
     case "hiring_manager":
       return "bg-sky-50 text-sky-700 border-sky-100";
     case "team lead":
     case "team_lead":
       return "bg-emerald-50 text-emerald-700 border-emerald-100";
     case "recruiter":
       return "bg-teal-50 text-teal-700 border-teal-100";
     case "head hunter":
       return "bg-purple-50 text-purple-700 border-purple-100";
     case "sales":
       return "bg-amber-50 text-amber-700 border-amber-100";
     default:
       return "bg-slate-50 text-slate-600 border-slate-100";
   }
 };
 
 const formatTeamRoleDisplay = (role: string): string => {
   if (!role) return "Not Assigned";
   return role.replace(/_/g, " ");
 };
 
 export function TeamMembersTabs({ onTeamMemberClick, highlightId }: TeamMembersTabsProps) {
   const [activeTab, setActiveTab] = useState("all");
   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
   const [teamMemberToDelete, setTeamMemberToDelete] = useState<TeamMember | null>(null);
 
   const queryClient = useQueryClient();
   const { data, isLoading } = useQuery({
     queryKey: ["teamMembers"],
     queryFn: () => getTeamMembers(),
     refetchOnWindowFocus: false,
     staleTime: 30_000,
   });
   const dataTeamMembers: TeamMember[] = data?.teamMembers ?? [];
 
   const { data: rolesRes } = useQuery({
     queryKey: ["roles"],
     queryFn: () => roleService.getRoles(),
   });
   const roles = rolesRes?.data ?? [];
 
   const deleteMutation = useMutation({
     mutationFn: (id: string) => deleteTeamMember(id),
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
       setDeleteDialogOpen(false);
       setTeamMemberToDelete(null);
     },
   });
 
   const handleStatusChange = async (teamMemberId: string, newStatus: TeamMemberStatus) => {
     queryClient.setQueryData(["teamMembers"], (oldData: any) => {
       if (!oldData?.teamMembers) return oldData;
       return {
         ...oldData,
         teamMembers: oldData.teamMembers.map((tm: TeamMember) =>
           tm._id === teamMemberId ? { ...tm, status: newStatus } : tm
         ),
       };
     });
   };
 
   const handleDeleteTeamMember = (teamMember: TeamMember) => {
     setTeamMemberToDelete(teamMember);
     setDeleteDialogOpen(true);
   };
 
   const confirmDeleteTeamMember = async () => {
     if (!teamMemberToDelete) return;
     deleteMutation.mutate(teamMemberToDelete._id);
   };
 
   const filteredTeamMembers = activeTab === "all" ? dataTeamMembers : dataTeamMembers.filter(member => {
       const selectedRole = roles.find(r => (r._id || r.id) === activeTab);
       if (!selectedRole) return true;
       if (member.roleId === selectedRole._id || member.roleId === selectedRole.id) return true;
       return (member.teamRole || "").toLowerCase() === selectedRole.name.toLowerCase();
   });
 
   const getCountByRole = (roleItem: any) => {
     return dataTeamMembers.filter(member => {
       if (member.roleId === roleItem._id || member.roleId === roleItem.id) return true;
       const roleName = roleItem.name.toLowerCase();
       return (member.teamRole || "").toLowerCase() === roleName;
     }).length;
   };
 
   const renderTableBody = () => {
     if (isLoading) {
       return (
         <TableRow>
           <TableCell colSpan={headerArr.length} className="h-64 text-center">
             <Loader className="size-6 animate-spin text-brand mx-auto mb-2" />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Team...</span>
           </TableCell>
         </TableRow>
       );
     }
 
     if (filteredTeamMembers.length === 0) {
       return (
         <TableRow>
           <TableCell colSpan={headerArr.length} className="h-64 text-center">
             <Users className="size-8 text-slate-200 mx-auto mb-3" />
             <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No members found</p>
           </TableCell>
         </TableRow>
       );
     }
 
     return filteredTeamMembers.map((member) => (
       <TableRow
         key={member._id}
         className={cn(
           "group border-b border-slate-50 transition-all duration-300",
           "hover:bg-brand/[0.04] hover:shadow-inner hover:translate-x-1",
           highlightId === member._id ? "bg-brand/[0.02]" : ""
         )}
       >
         {/* Name */}
         <TableCell className="px-3 py-2.5">
           <Tooltip>
             <TooltipTrigger asChild>
               <div 
                 className="cursor-pointer group/title max-w-[150px] truncate"
                 onClick={() => onTeamMemberClick?.(member._id)}
               >
                 <span className="text-[13px] font-bold text-slate-900 group-hover/title:text-brand transition-all block truncate">
                   {member.firstName} {member.lastName}
                 </span>
               </div>
             </TooltipTrigger>
             <TooltipContent className="rounded-xl bg-brand text-white font-bold text-[11px] border-none shadow-2xl">
               {member.firstName} {member.lastName}
             </TooltipContent>
           </Tooltip>
         </TableCell>
 
         {/* Contact */}
         <TableCell className="px-3 py-2.5">
            <div className="flex flex-col gap-0.5 max-w-[160px]">
               <Tooltip>
                 <TooltipTrigger asChild>
                   <div className="flex items-center gap-1.5 overflow-hidden cursor-help">
                      <Mail className="w-2.5 h-2.5 text-slate-300 shrink-0" />
                      <span className="text-[10px] font-medium text-slate-600 truncate">{member.email}</span>
                   </div>
                 </TooltipTrigger>
                 <TooltipContent className="rounded-xl bg-brand text-white font-bold text-[10px] border-none shadow-2xl">
                   {member.email}
                 </TooltipContent>
               </Tooltip>
               <div className="flex items-center gap-1.5 overflow-hidden">
                  <Phone className="w-2.5 h-2.5 text-slate-300 shrink-0" />
                  <span className="text-[10px] font-medium text-slate-600 truncate">{formatPhoneNumber(member.phone, member.countryCode)}</span>
               </div>
            </div>
         </TableCell>
 
         {/* Location */}
         <TableCell className="px-3 py-2.5">
           <Tooltip>
             <TooltipTrigger asChild>
               <div className="flex items-center gap-1.5 max-w-[100px] truncate cursor-help">
                  <MapPin className="w-3 h-3 text-slate-300 shrink-0" />
                  <span className="text-[11px] font-medium text-slate-600 truncate">{member.location || "Office"}</span>
               </div>
             </TooltipTrigger>
             <TooltipContent className="rounded-xl bg-brand text-white font-bold text-[10px] border-none shadow-2xl">
               {member.location || "Remote/Office"}
             </TooltipContent>
           </Tooltip>
         </TableCell>
 
         {/* Experience */}
         <TableCell className="px-3 py-2.5">
            <div className="flex items-center gap-1.5">
               <Briefcase className="w-3 h-3 text-slate-300 shrink-0" />
               <span className="text-[11px] font-bold text-slate-700">{member.experience || "N/A"}</span>
            </div>
         </TableCell>
 
         {/* Role */}
         <TableCell className="px-3 py-2.5">
           <div className="scale-90 origin-left">
             <span className={cn(
               "inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest border shadow-sm",
               getTeamRoleColorClass(member.teamRole || "")
             )}>
               {formatTeamRoleDisplay(member.teamRole || "")}
             </span>
           </div>
         </TableCell>
 
         {/* Status */}
         <TableCell className="px-3 py-2.5">
           <div className="scale-90 origin-left">
             <TeamMemberStatusBadge
               id={member._id}
               status={member.status}
               onStatusChange={handleStatusChange}
             />
           </div>
         </TableCell>
 
         {/* Actions */}
         <TableCell className="px-3 py-2.5 text-right">
           <DropdownMenu modal={false}>
             <DropdownMenuTrigger asChild>
               <Button variant="ghost" className="h-7 w-7 p-0 rounded-lg hover:bg-brand/5 group">
                 <MoreVertical className="h-3.5 w-3.5 text-slate-400 group-hover:text-brand" />
               </Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent align="end" className="rounded-xl border-slate-100 shadow-xl">
               <DropdownMenuItem
                 onClick={(e) => { e.stopPropagation(); handleDeleteTeamMember(member); }}
                 className="text-red-600 font-bold text-xs flex items-center gap-2 p-2 cursor-pointer hover:bg-red-50"
               >
                 <Trash2 className="h-3.5 w-3.5" />
                 Delete Member
               </DropdownMenuItem>
             </DropdownMenuContent>
           </DropdownMenu>
         </TableCell>
       </TableRow>
     ));
   };
 
   return (
     <div className="flex flex-col h-full bg-white animate-in slide-in-from-bottom-2 duration-700">
       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col min-h-0">
         <div className="px-4 py-2 border-b border-slate-50 bg-slate-50/30">
            <TabsList className="bg-transparent gap-2 h-auto p-0 flex-wrap justify-start">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-brand data-[state=active]:text-white data-[state=active]:shadow-md text-slate-500 font-bold text-[11px] uppercase tracking-wider rounded-xl px-4 py-2 transition-all hover:bg-brand/5 border border-transparent data-[state=active]:border-brand"
              >
                All Members ({dataTeamMembers.length})
              </TabsTrigger>
              {roles.map(role => (
                 <TabsTrigger
                   key={role._id || role.id}
                   value={role._id || role.id}
                   className="data-[state=active]:bg-brand data-[state=active]:text-white data-[state=active]:shadow-md text-slate-500 font-bold text-[11px] uppercase tracking-wider rounded-xl px-4 py-2 transition-all hover:bg-brand/5 border border-transparent data-[state=active]:border-brand"
                 >
                   {role.name} ({getCountByRole(role)})
                 </TabsTrigger>
              ))}
            </TabsList>
         </div>
 
         <div className="flex-1 overflow-auto custom-scrollbar relative">
           <Table className="w-full border-separate border-spacing-0 table-auto">
             <TableHeader className="sticky top-0 z-40 bg-slate-50/95 backdrop-blur-md">
               <TableRow>
                 {headerArr.map((header) => (
                   <TableHead key={header} className="px-3 py-3 border-b border-slate-100 text-[9px] font-black uppercase tracking-wider text-slate-400">
                     {header}
                   </TableHead>
                 ))}
               </TableRow>
             </TableHeader>
             <TableBody>
               {renderTableBody()}
             </TableBody>
           </Table>
         </div>
       </Tabs>
 
       <DeleteTeamMemberDialog
         open={deleteDialogOpen}
         onOpenChange={setDeleteDialogOpen}
         teamMemberName={teamMemberToDelete?.firstName + " " + teamMemberToDelete?.lastName || ""}
         onConfirm={confirmDeleteTeamMember}
         isLoading={deleteMutation.isPending}
       />
     </div>
   );
 }
