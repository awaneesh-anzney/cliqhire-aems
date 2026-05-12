"use client";
 
 import { useState, useMemo } from "react";
 import { Avatar, AvatarFallback } from "@/components/ui/avatar";
 import { useClientHistory } from "@/hooks/use-clientHistory";
 import { Button } from "@/components/ui/button";
 import { 
   History, 
   Plus, 
   Pencil, 
   Trash2, 
   Clock, 
   ChevronRight, 
   ArrowRight,
   Calendar,
   ChevronLeft,
   Loader2,
   AlertCircle
 } from "lucide-react";
 import { cn } from "@/lib/utils";
 import { HistoryRecord } from "@/services/client-HistoryService";
 
 interface HistoryContentProps {
   clientId: string;
 }
 
 export function HistoryContent({ clientId }: HistoryContentProps) {
   const [page, setPage] = useState(1);
   const limit = 10;
 
   const { history, pagination, isLoading, error } = useClientHistory(clientId, page, limit);
 
   const formatDate = (dateString: string) => {
     try {
       const d = new Date(dateString);
       return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
     } catch {
       return dateString;
     }
   };
 
   const getActionIcon = (action: string) => {
     const a = action.toLowerCase();
     if (a.includes('create') || a.includes('add')) return <Plus className="w-3.5 h-3.5" />;
     if (a.includes('update') || a.includes('edit') || a.includes('patch')) return <Pencil className="w-3.5 h-3.5" />;
     if (a.includes('delete') || a.includes('remove')) return <Trash2 className="w-3.5 h-3.5" />;
     return <History className="w-3.5 h-3.5" />;
   };
 
   const getActionColor = (action: string) => {
     const a = action.toLowerCase();
     if (a.includes('create') || a.includes('add')) return "bg-green-500 shadow-green-100";
     if (a.includes('update') || a.includes('edit') || a.includes('patch')) return "bg-brand shadow-brand/20";
     if (a.includes('delete') || a.includes('remove')) return "bg-red-500 shadow-red-100";
     return "bg-slate-500 shadow-slate-100";
   };
 
   const groupedHistory = useMemo(() => {
     const groups: { [key: string]: HistoryRecord[] } = {};
     history.forEach(record => {
       const date = new Date(record.created_at).toLocaleDateString('en-US', { 
         weekday: 'long', 
         year: 'numeric', 
         month: 'long', 
         day: 'numeric' 
       });
       if (!groups[date]) groups[date] = [];
       groups[date].push(record);
     });
     return groups;
   }, [history]);
 
   if (isLoading) {
     return (
       <div className="flex flex-col items-center justify-center p-24 space-y-4">
         <Loader2 className="w-10 h-10 text-brand animate-spin" />
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Synchronizing Activity Data...</p>
       </div>
     );
   }
 
   if (error) {
     return (
       <div className="p-12 text-center bg-red-50/50 rounded-3xl border border-red-100 max-w-2xl mx-auto mt-8">
         <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
         <h3 className="text-lg font-black text-slate-900 mb-2 tracking-tight">Audit Log Retrieval Failed</h3>
         <p className="text-sm text-slate-500 font-semibold mb-6">We encountered an error while fetching the activity history. Please try again.</p>
         <Button onClick={() => window.location.reload()} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 font-bold px-8">
           Retry Connection
         </Button>
       </div>
     );
   }
 
   return (
     <div className="bg-slate-50/30 rounded-3xl p-8 space-y-10 animate-in fade-in duration-500 min-h-[600px] flex flex-col">
       {/* Header Section */}
       <div className="flex items-center justify-between px-2">
         <div className="space-y-1">
           <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             Client Activity Audit
             <span className="text-[10px] font-black bg-brand/10 text-brand px-3 py-1 rounded-full border border-brand/10 shadow-sm">
               {pagination.total} Records
             </span>
           </h2>
           <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Chronological timeline of all system actions</p>
         </div>
         
         <div className="flex items-center gap-2">
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-lg text-slate-400 hover:text-brand"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-[10px] font-black px-3 text-slate-500 uppercase">Page {page} of {pagination.totalPages}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-lg text-slate-400 hover:text-brand"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
         </div>
       </div>
 
       <div className="flex-1 relative">
         {history.length === 0 ? (
           <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-20 text-center flex flex-col items-center">
             <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
               <History className="w-10 h-10 text-slate-200" />
             </div>
             <h3 className="text-xl font-black text-slate-800">Clean Slate</h3>
             <p className="text-slate-400 text-sm font-semibold max-w-sm mx-auto mt-2 mb-8">
               No activity has been recorded for this client yet. Once changes are made, they will appear here.
             </p>
           </div>
         ) : (
           <div className="space-y-12">
             {Object.entries(groupedHistory).map(([date, records]) => (
               <div key={date} className="relative">
                 {/* Date Header */}
                 <div className="flex items-center gap-4 mb-8 sticky top-0 bg-transparent z-10 py-1">
                   <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                     <Calendar className="w-4 h-4 text-brand" />
                   </div>
                   <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.15em]">{date}</h3>
                   <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
                 </div>
 
                 {/* Timeline Items */}
                 <div className="space-y-8 pl-6 relative">
                   {/* Vertical Timeline Line */}
                   <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-slate-200 via-slate-200 to-transparent ml-[-12px]" />
                   
                   {records.map((record, index) => {
                     const performer = Array.isArray(record.performedBy) ? record.performedBy[0] : record.performedBy;
                     const userName = performer?.name || "System Autotask";
                     const userInitials = userName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
 
                     return (
                       <div key={record._id || index} className="relative group animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${index * 50}ms` }}>
                         {/* Dot on Timeline */}
                         <div className={cn(
                           "absolute left-[-22px] top-4 w-5 h-5 rounded-full border-4 border-slate-50 flex items-center justify-center shadow-lg transition-transform group-hover:scale-125 z-20 text-white",
                           getActionColor(record.action)
                         )}>
                           {getActionIcon(record.action)}
                         </div>
 
                         <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-brand/20 transition-all duration-300">
                           <div className="flex items-start justify-between mb-4">
                             <div className="flex items-center gap-4">
                               <Avatar className="h-10 w-10 border-2 border-white ring-2 ring-slate-50 shadow-sm">
                                 <AvatarFallback className="bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-tighter">{userInitials}</AvatarFallback>
                               </Avatar>
                               <div>
                                 <div className="flex items-center gap-2">
                                   <span className="text-sm font-black text-slate-900 leading-none">{userName}</span>
                                   <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                     {record.entity_type}
                                   </span>
                                 </div>
                                 <p className="text-[11px] text-slate-400 font-bold mt-1.5 flex items-center gap-1.5">
                                   <span className="text-brand lowercase font-black tracking-tight">{record.action}</span> 
                                   <span className="text-slate-200">•</span>
                                   <Clock className="w-3 h-3 text-slate-300" /> {formatDate(record.created_at)}
                                 </p>
                               </div>
                             </div>
                           </div>
 
                           {record.changes?.after && Object.keys(record.changes.after).length > 0 && (
                             <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                               {Object.keys(record.changes.after).map((key) => {
                                 if (key.startsWith('_') || key === 'updatedAt' || key === 'createdAt' || key === 'id') return null;
                                 const beforeVal = record.changes?.before?.[key];
                                 const afterVal = record.changes?.after?.[key];
 
                                 if (JSON.stringify(beforeVal) === JSON.stringify(afterVal)) return null;
 
                                 const formatValue = (val: any) => {
                                   if (val === null || val === undefined || val === '') return 'N/A';
                                   if (typeof val === 'object') return JSON.stringify(val);
                                   return String(val);
                                 };
 
                                 return (
                                   <div key={key} className="flex flex-col bg-slate-50/50 rounded-xl p-3 border border-slate-100/50 hover:bg-white hover:shadow-md transition-all group/item">
                                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] mb-2">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                     <div className="flex items-center gap-2 overflow-hidden">
                                       {beforeVal !== undefined && (
                                         <>
                                           <span className="text-xs text-slate-400 font-bold line-through opacity-50 truncate" title={formatValue(beforeVal)}>
                                             {formatValue(beforeVal)}
                                           </span>
                                           <ArrowRight className="w-3 h-3 text-slate-300 shrink-0 group-hover/item:text-brand transition-colors" />
                                         </>
                                       )}
                                       <span className="text-xs text-slate-700 font-black truncate" title={formatValue(afterVal)}>
                                         {formatValue(afterVal)}
                                       </span>
                                     </div>
                                   </div>
                                 );
                               })}
                             </div>
                           )}
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </div>
             ))}
           </div>
         )}
       </div>
 
       {/* Footer Pagination */}
       {pagination.totalPages > 1 && (
         <div className="flex items-center justify-between pt-10 mt-6 border-t border-slate-100">
           <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
             <span>Viewing {history.length} of {pagination.total} interactions</span>
           </div>
           <div className="flex items-center gap-3">
             <Button
               variant="outline"
               size="sm"
               className="rounded-xl font-bold h-10 px-6 border-slate-200 hover:bg-slate-50 disabled:opacity-30"
               onClick={() => {
                 setPage(p => Math.max(1, p - 1));
                 window.scrollTo({ top: 0, behavior: 'smooth' });
               }}
               disabled={page <= 1}
             >
               <ChevronLeft className="w-4 h-4 mr-2" /> Previous
             </Button>
             <Button
               variant="outline"
               size="sm"
               className="rounded-xl font-bold h-10 px-6 border-slate-200 hover:bg-slate-50 disabled:opacity-30"
               onClick={() => {
                 setPage(p => Math.min(pagination.totalPages, p + 1));
                 window.scrollTo({ top: 0, behavior: 'smooth' });
               }}
               disabled={page >= pagination.totalPages}
             >
               Next <ChevronRight className="w-4 h-4 ml-2" />
             </Button>
           </div>
         </div>
       )}
     </div>
   );
 }