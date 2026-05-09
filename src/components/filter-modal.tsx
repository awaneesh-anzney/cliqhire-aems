"use client";
 
 import { useState, useEffect, useMemo } from "react";
 import { Button } from "@/components/ui/button";
 import {
   Sheet,
   SheetContent,
   SheetHeader,
   SheetTitle,
   SheetFooter,
 } from "@/components/ui/sheet";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Checkbox } from "@/components/ui/checkbox";
 import { 
   Filter, 
   X, 
   RotateCcw, 
   Search, 
   ChevronDown, 
   Building2, 
   MapPin, 
   User, 
   Briefcase, 
   CheckCircle2,
   LayoutGrid
 } from "lucide-react";
 import { cn } from "@/lib/utils";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import { Separator } from "@/components/ui/separator";
 
 // --- Types ---
 
 export type FilterModule = "clients" | "jobs" | "candidates";
 
 export interface FilterValue {
   [key: string]: any;
 }
 
 interface FilterField {
   id: string;
   label: string;
   type: "text" | "checkbox-group" | "select" | "search";
   icon?: any;
   options?: { label: string; value: string }[];
   placeholder?: string;
 }
 
 interface ModuleConfig {
   title: string;
   subtitle: string;
   fields: FilterField[];
 }
 
 // --- Configs ---
 
 const MODULE_CONFIGS: Record<FilterModule, ModuleConfig> = {
   clients: {
     title: "Client Filters",
     subtitle: "Refine client records",
     fields: [
       { id: "name", label: "Client Name", type: "text", icon: Search, placeholder: "Search company..." },
       { id: "industry", label: "Industry", type: "text", icon: Building2, placeholder: "e.g. Technology" },
       { id: "location", label: "Location", type: "text", icon: MapPin, placeholder: "City or country..." },
       { 
         id: "stage", 
         label: "Client Stage", 
         type: "checkbox-group", 
         options: [
           { label: "Lead", value: "Lead" },
           { label: "Engaged", value: "Engaged" },
           { label: "Signed", value: "Signed" }
         ] 
       },
       { 
         id: "team", 
         label: "Market Segment", 
         type: "checkbox-group", 
         options: [
           { label: "Enterprise", value: "Enterprise" },
           { label: "SMB", value: "SMB" },
           { label: "Mid-Market", value: "Mid-Market" }
         ] 
       },
     ]
   },
   jobs: {
     title: "Job Filters",
     subtitle: "Find specific opportunities",
     fields: [
       { id: "name", label: "Position Title", type: "text", icon: Briefcase, placeholder: "Search job title..." },
       { id: "owner", label: "Job Owner", type: "text", icon: User, placeholder: "Search recruiter..." },
       { id: "location", label: "Work Location", type: "text", icon: MapPin, placeholder: "e.g. Remote" },
       { 
         id: "stage", 
         label: "Job Stage", 
         type: "checkbox-group", 
         options: [
           { label: "Open", value: "Open" },
           { label: "Active", value: "Active" },
           { label: "On Hold", value: "On Hold" },
           { label: "Hired", value: "Hired" },
           { label: "Closed", value: "Closed" }
         ] 
       },
     ]
   },
   candidates: {
     title: "Candidate Filters",
     subtitle: "Source top talent",
     fields: [
       { id: "name", label: "Candidate Name", type: "text", icon: User, placeholder: "Search name..." },
       { id: "location", label: "Current City", type: "text", icon: MapPin, placeholder: "e.g. London" },
       { 
         id: "stage", 
         label: "Pipeline Stage", 
         type: "checkbox-group", 
         options: [
           { label: "Sourcing", value: "Sourcing" },
           { label: "Interviewing", value: "Interviewing" },
           { label: "Offered", value: "Offered" },
           { label: "Placed", value: "Placed" }
         ] 
       },
     ]
   }
 };
 
 interface FilterModalProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   onApplyFilters: (filters: FilterValue) => void;
   module: FilterModule;
   initialFilters?: FilterValue;
 }
 
 export function FilterModal({ 
   open, 
   onOpenChange, 
   onApplyFilters, 
   module,
   initialFilters 
 }: FilterModalProps) {
   const config = MODULE_CONFIGS[module];
   const [tempFilters, setTempFilters] = useState<FilterValue>({});
   const [expandedSections, setExpandedSections] = useState<string[]>(config.fields.map(f => f.id));
 
   useEffect(() => {
     if (open) {
       setTempFilters(initialFilters || {});
     }
   }, [open, initialFilters]);
 
   const handleValueChange = (id: string, value: any) => {
     setTempFilters(prev => ({ ...prev, [id]: value }));
   };
 
   const handleCheckboxChange = (id: string, optionValue: string, checked: boolean) => {
     const current = Array.isArray(tempFilters[id]) ? tempFilters[id] : [];
     const next = checked 
       ? [...current, optionValue] 
       : current.filter((v: string) => v !== optionValue);
     handleValueChange(id, next);
   };
 
   const toggleSection = (id: string) => {
     setExpandedSections(prev => 
       prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
     );
   };
 
   const activeFilterCount = useMemo(() => {
     return Object.values(tempFilters).filter(v => 
       v !== "" && v !== null && (Array.isArray(v) ? v.length > 0 : true)
     ).length;
   }, [tempFilters]);
 
   const handleReset = () => {
     setTempFilters({});
   };
 
   const handleApply = () => {
     onApplyFilters(tempFilters);
     onOpenChange(false);
   };
 
   return (
     <Sheet open={open} onOpenChange={onOpenChange}>
       <SheetContent side="right" className="w-full sm:max-w-md p-0 bg-card border-l border-border shadow-2xl flex flex-col overflow-hidden">
         {/* Premium Header */}
         <SheetHeader className="px-6 py-8 border-b border-border bg-card shrink-0 relative">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center text-brand shadow-sm">
               <Filter className="w-6 h-6" />
             </div>
             <div>
               <SheetTitle className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
                 {config.title}
                 {activeFilterCount > 0 && (
                   <span className="bg-brand text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-in zoom-in">
                     {activeFilterCount}
                   </span>
                 )}
               </SheetTitle>
               <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">
                 {config.subtitle}
               </p>
             </div>
           </div>
           <button 
             onClick={() => onOpenChange(false)}
             className="absolute top-8 right-6 p-2 rounded-xl hover:bg-muted transition-all text-muted-foreground hover:text-foreground"
           >
             <X className="w-5 h-5" />
           </button>
         </SheetHeader>
 
         {/* Main Filter Area (Amazon/Flipkart Style) */}
         <ScrollArea className="flex-1">
           <div className="p-6 space-y-8 pb-32">
             {config.fields.map((field) => (
               <div key={field.id} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                 <button 
                   onClick={() => toggleSection(field.id)}
                   className="flex items-center justify-between w-full group"
                 >
                   <div className="flex items-center gap-3">
                     <div className={cn(
                       "p-2 rounded-xl transition-all duration-300",
                       tempFilters[field.id] ? "bg-brand/10 text-brand" : "bg-muted text-muted-foreground group-hover:bg-muted"
                     )}>
                       {field.icon ? <field.icon className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
                     </div>
                     <span className="text-[11px] font-black text-foreground uppercase tracking-wider">{field.label}</span>
                   </div>
                   <ChevronDown className={cn(
                     "w-4 h-4 text-muted-foreground transition-transform duration-300",
                     expandedSections.includes(field.id) ? "rotate-180" : ""
                   )} />
                 </button>
 
                 {expandedSections.includes(field.id) && (
                   <div className="pl-11 space-y-4 animate-in slide-in-from-top-2 duration-300">
                     {field.type === "text" && (
                       <div className="relative">
                         <Input 
                           value={tempFilters[field.id] || ""}
                           onChange={(e) => handleValueChange(field.id, e.target.value)}
                           placeholder={field.placeholder}
                           className="bg-muted/50 border-border rounded-xl focus-visible:ring-brand h-11 text-sm font-medium"
                         />
                         {tempFilters[field.id] && (
                           <button 
                             onClick={() => handleValueChange(field.id, "")}
                             className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                           >
                             <X className="w-3.5 h-3.5" />
                           </button>
                         )}
                       </div>
                     )}
 
                     {field.type === "checkbox-group" && (
                       <div className="grid grid-cols-1 gap-3">
                         {field.options?.map((option) => (
                           <label 
                             key={option.value} 
                             className="flex items-center gap-3 group cursor-pointer"
                           >
                             <Checkbox 
                               checked={(tempFilters[field.id] || []).includes(option.value)}
                               onCheckedChange={(checked) => handleCheckboxChange(field.id, option.value, !!checked)}
                               className="rounded-md border-border data-[state=checked]:bg-brand data-[state=checked]:border-brand"
                             />
                             <span className={cn(
                               "text-sm font-medium transition-colors",
                               (tempFilters[field.id] || []).includes(option.value) ? "text-foreground font-bold" : "text-muted-foreground group-hover:text-foreground"
                             )}>
                               {option.label}
                             </span>
                           </label>
                         ))}
                       </div>
                     )}
                   </div>
                 )}
                 <Separator className="bg-muted" />
               </div>
             ))}
           </div>
         </ScrollArea>
 
         {/* Actions (E-commerce Style) */}
         <div className="p-6 border-t border-border bg-card/80 backdrop-blur-md shrink-0">
           <div className="flex gap-3">
             <Button
               variant="outline"
               onClick={handleReset}
               className="flex-1 h-12 rounded-2xl border-2 border-border font-black text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-95"
             >
               <RotateCcw className="w-4 h-4 mr-2" />
               Reset
             </Button>
             <Button
               onClick={handleApply}
               className="flex-[2] h-12 rounded-2xl bg-brand text-white font-black shadow-xl shadow-brand/20 hover:shadow-brand/30 active:scale-[0.98] transition-all"
             >
               Show Results <ArrowRight className="w-4 h-4 ml-2" />
             </Button>
           </div>
         </div>
       </SheetContent>
     </Sheet>
   );
 }
 
 function ArrowRight(props: any) {
   return (
     <svg
       {...props}
       xmlns="http://www.w3.org/2000/svg"
       width="24"
       height="24"
       viewBox="0 0 24 24"
       fill="none"
       stroke="currentColor"
       strokeWidth="2"
       strokeLinecap="round"
       strokeLinejoin="round"
     >
       <path d="M5 12h14" />
       <path d="m12 5 7 7-7 7" />
     </svg>
   );
 }
