"use client";
 import React from "react";
 import { useState } from "react";
 import { useQueryClient } from "@tanstack/react-query";
 import { useRouter, useSearchParams } from "next/navigation";
 import Dashboardheader from "@/components/dashboard-header";
 import { TeamMembersTabs } from "@/components/teamMembers/team-members-tabs";
 import { CreateTeamMemberModal } from "@/components/create-teamMembers-modal/create-teamMembers-modal";
 import { ExportDialog, ExportFilterParams } from "@/components/common/export-dialog";
 import { useExportUsers } from "@/hooks/useExportUsers";
 import { TooltipProvider } from "@/components/ui/tooltip";
 
 export default function TeamMembersPage() {
   const [open, setOpen] = useState(false);
   const [filterOpen, setFilterOpen] = useState(false);
   const [initialLoading, setInitialLoading] = useState(false);
   const router = useRouter();
   const queryClient = useQueryClient();
   const searchParams = useSearchParams();
   const [openExportDialog, setOpenExportDialog] = useState(false);
   const { mutateAsync: exportUsersMutation } = useExportUsers();
 
   // Get highlight ID from URL query parameter
   const highlightId = searchParams?.get('highlight') || undefined;
 
   const handleCreateSuccess = () => {
     // Invalidate team members list to refetch after create
     queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
   };
 
   const handleTeamMemberClick = (teamMemberId: string) => {
     router.push(`/teammembers/${teamMemberId}`);
   };
 
   return (
     <TooltipProvider delayDuration={200}>
       <div className="flex flex-col h-screen w-full overflow-hidden bg-muted/50 p-3 gap-3 animate-in fade-in duration-700">
         {/* Page Header */}
         <div className="flex-shrink-0 relative overflow-hidden bg-card rounded-[1.5rem] border border-border shadow-lg p-1.5">
           <div className="absolute top-0 right-0 w-48 h-full bg-brand/5 rounded-full blur-2xl pointer-events-none" />
           <Dashboardheader
             setOpen={setOpen}
             setFilterOpen={setFilterOpen}
             initialLoading={initialLoading}
             showFilterButton={false}
             rightContent={undefined}
             heading="Team Members"
             buttonText="Add Member"
             onExport={() => setOpenExportDialog(true)}
           />
         </div>
 
         {/* Content Area */}
         <div className="flex-1 min-h-0 bg-card rounded-[1.5rem] border border-border shadow-xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-1000 delay-150">
           <TeamMembersTabs
             onTeamMemberClick={handleTeamMemberClick}
             highlightId={highlightId}
           />
         </div>
 
         <CreateTeamMemberModal open={open} onOpenChange={setOpen} onSuccess={handleCreateSuccess} />
 
         <ExportDialog
           isOpen={openExportDialog}
           onClose={() => setOpenExportDialog(false)}
           title="Export Team"
           description="Download CSV team report."
           onExport={(params: ExportFilterParams | undefined) => exportUsersMutation(params)}
           filename="team_members"
         />
       </div>
     </TooltipProvider>
   );
 }
