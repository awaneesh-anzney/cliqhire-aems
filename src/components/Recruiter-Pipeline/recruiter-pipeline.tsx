"use client";
 
 import React, { useState } from "react";
 import { Search, ChevronLeft, ChevronRight, Loader, FilterX } from "lucide-react";
 import { Input } from "@/components/ui/input";
 import { KPISection } from "./kpi-section";
 import { PipelineJobCard } from "./pipeline-job-card";
 import { type Job } from "./dummy-data";
 import { convertPipelineListDataToJob } from "./utils/convert";
 import { Button } from "../ui/button";
 import { useAuth } from "@/contexts/AuthContext";
 import { getAllPipelineEntries } from "@/services/recruitmentPipelineService";
 import { useQuery } from "@tanstack/react-query";
 import { useEffect } from "react";
 import { usePermissions } from "@/contexts/PermissionContext";
 import { cn } from "@/lib/utils";
 
 export function RecruiterPipeline() {
   const { user } = useAuth();
   const { hasPermission } = usePermissions();
   const isAdmin = user?.role === 'ADMIN';
 
   const canViewPipeline = isAdmin || hasPermission('pipeline', 'view');
 
   const [searchTerm, setSearchTerm] = useState("");
   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
   const [currentPage, setCurrentPage] = useState(1);
   const [pageSize] = useState(10);
 
   useEffect(() => {
     const timer = setTimeout(() => {
       setDebouncedSearchTerm(searchTerm);
       setCurrentPage(1);
     }, 500);
     return () => clearTimeout(timer);
   }, [searchTerm]);
 
   const { data: listResponse, isLoading: listLoading, refetch } = useQuery({
     queryKey: ["pipelineEntries", user?._id, currentPage, pageSize, debouncedSearchTerm],
     queryFn: async () => await getAllPipelineEntries(currentPage, pageSize, debouncedSearchTerm),
     enabled: !!user,
   });
 
   const calculateKPIData = () => {
     const rawPipelines = listResponse?.data?.pipelines || [];
     const allJobsList: Job[] = rawPipelines.map((p: any) => convertPipelineListDataToJob(p, false));
 
     const totalJobs = listResponse?.data?.pagination?.totalPipelines || allJobsList.length;
     const activeJobs = allJobsList.filter(job => job.jobId?.stage && job.jobId.stage.toLowerCase() !== "closed").length;
     const inactiveJobs = allJobsList.filter(job => job.jobId?.stage && job.jobId.stage.toLowerCase() === "closed").length;
 
     let appliedCandidates = 0;
     let hiredCandidates = 0;
 
     if (rawPipelines.length > 0) {
       appliedCandidates = rawPipelines.reduce((total: number, pipeline: any) => total + (pipeline.totalCandidates || 0), 0);
       hiredCandidates = rawPipelines.reduce((total: number, pipeline: any) => total + (pipeline.completedCandidates || 0), 0);
     }
 
     return {
       totalJobs,
       activeJobs,
       inactiveJobs,
       appliedCandidates,
       hiredCandidates,
       disqualifiedCandidates: 0
     };
   };
 
   const renderJobs = (listResponse?.data?.pipelines || []).map((p: any) => convertPipelineListDataToJob(p, false));
   const totalItems = listResponse?.data?.pagination?.totalPipelines || 0;
   const totalPages = listResponse?.data?.pagination?.totalPages || 1;
   const currentPageRes = listResponse?.data?.pagination?.currentPage || 1;
   const hasNextPage = listResponse?.data?.pagination?.hasNextPage;
   const hasPrevPage = listResponse?.data?.pagination?.hasPrevPage;
 
   if (!canViewPipeline) {
     return (
       <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
         <div className="p-4 rounded-full bg-red-50 text-red-500">
           <FilterX className="w-8 h-8" />
         </div>
         <div className="text-center font-black text-foreground tracking-tight">Access Restricted</div>
         <div className="text-center text-muted-foreground text-sm font-bold uppercase tracking-widest">Pipeline visibility requires authorized permissions.</div>
       </div>
     );
   }
 
   return (
     <div className="flex flex-col h-full w-full overflow-hidden bg-card">
       {/* KPI Section - Reduced horizontal padding */}
       <div className="flex-shrink-0 bg-muted/50 p-2 border-b border-border">
         <KPISection data={calculateKPIData()} />
       </div>
 
       {/* Search Bar Container - Removed max-w, expanded to full width */}
       <div className="flex-shrink-0 p-2 bg-card border-b border-border">
         <div className="relative group w-full">
           <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
             <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-brand transition-colors" />
           </div>
           <Input
             placeholder="Search jobs, clients, or pipeline notes..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="h-10 pl-10 pr-4 bg-muted/50 border-border rounded-xl text-[13px] font-bold text-foreground placeholder:text-muted-foreground placeholder:font-medium focus:bg-card focus:ring-4 focus:ring-brand/5 focus:border-brand/20 transition-all shadow-sm"
           />
           {listLoading && (
             <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
               <Loader className="h-4 w-4 text-brand animate-spin" />
             </div>
           )}
         </div>
       </div>
 
       {/* Pipeline Content Area - Removed max-w, expanded to full width */}
       <div className="flex-1 overflow-y-auto custom-scrollbar p-2 bg-muted/10">
         {listLoading && renderJobs.length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center gap-3">
              <div className="p-4 rounded-2xl bg-card shadow-xl border border-border flex items-center gap-3 animate-bounce">
                 <Loader className="h-5 w-5 text-brand animate-spin" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Loading Pipeline Data...</span>
              </div>
           </div>
         ) : renderJobs.length > 0 ? (
           <div className="flex flex-col gap-2 w-full">
             {renderJobs.map((job: Job) => (
               <PipelineJobCard
                 key={job.id}
                 job={job}
               />
             ))}
           </div>
         ) : (
           <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
             <div className="p-6 rounded-full bg-card shadow-lg border border-border">
                <Search className="size-10 text-muted-foreground" />
             </div>
             <div className="space-y-1">
                <p className="text-foreground font-black tracking-tight text-lg">No Results Found</p>
                <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest max-w-[280px]">
                   Adjust your search or filters to see more pipeline jobs.
                </p>
             </div>
           </div>
         )}
       </div>
 
       {/* Pagination Footer - Removed max-w, reduced padding */}
       <div className="flex-shrink-0 bg-card border-t border-border p-2">
         {totalPages > 1 ? (
           <div className="flex items-center justify-between w-full px-2">
             <div className="flex items-center gap-2">
                <div className="px-3 py-1 rounded-lg bg-muted border border-border shadow-sm">
                   <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mr-1.5">Page</span>
                   <span className="text-sm font-black text-foreground">{currentPageRes}</span>
                   <span className="text-sm font-bold text-muted-foreground mx-1">/</span>
                   <span className="text-sm font-bold text-muted-foreground">{totalPages}</span>
                </div>
                <div className="h-4 w-[1px] bg-muted mx-2" />
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                   {totalItems} total records
                </span>
             </div>
             
             <div className="flex items-center gap-2">
               <Button
                 variant="outline"
                 size="sm"
                 onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                 disabled={!hasPrevPage}
                 className="h-8 px-4 rounded-xl border-border font-bold text-xs uppercase tracking-widest hover:bg-brand hover:text-white hover:border-brand transition-all disabled:opacity-40 shadow-sm"
               >
                 <ChevronLeft className="h-4 w-4 mr-1.5" />
                 Prev
               </Button>
               <Button
                 variant="outline"
                 size="sm"
                 onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                 disabled={!hasNextPage}
                 className="h-9 px-4 rounded-xl border-border font-bold text-xs uppercase tracking-widest hover:bg-brand hover:text-white hover:border-brand transition-all disabled:opacity-40 shadow-sm"
               >
                 Next
                 <ChevronRight className="h-4 w-4 ml-1.5" />
               </Button>
             </div>
           </div>
         ) : (
           <div className="text-center">
             <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                Showing all <span className="text-foreground mx-1">{totalItems}</span> pipeline entries
             </span>
           </div>
         )}
       </div>
     </div>
   );
 }
