"use client";
 
 import React, { useState, useMemo } from "react";
 import { Button } from "@/components/ui/button";
 import { 
   Plus, 
   X, 
   Pencil, 
   Check, 
   Users, 
   Search, 
   UserPlus, 
   Mail, 
   Phone, 
   Briefcase, 
   Linkedin,
   ArrowRight
 } from "lucide-react";
 import { Dialog, DialogContent } from "@/components/ui/dialog";
 import { Badge } from "@/components/ui/badge";
 import { Input } from "@/components/ui/input";
 import { cn } from "@/lib/utils";
 import { ScrollArea } from "@/components/ui/scroll-area";
 
 interface ClientPrimaryContactsDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   primaryContacts: any[];
   onSave: (updatedContacts: any[], selectedContactIds: string[], newContacts?: any[]) => void;
   countryCodes: { code: string; label: string }[];
   positionOptions: { value: string; label: string }[];
   AddContactModal: React.ComponentType<any>;
   initialSelectedContactIds?: string[];
   initialNewContacts?: any[];
 }
 
 export function ClientPrimaryContactsDialog({
   open,
   onOpenChange,
   primaryContacts,
   onSave,
   countryCodes,
   positionOptions,
   AddContactModal,
   initialSelectedContactIds = [],
   initialNewContacts = [],
 }: ClientPrimaryContactsDialogProps) {
   const [dialogSelectedContactIds, setDialogSelectedContactIds] = useState<string[]>(initialSelectedContactIds);
   const [dialogNewContacts, setDialogNewContacts] = useState<any[]>(initialNewContacts);
   const [searchQuery, setSearchQuery] = useState("");
   const [editContact, setEditContact] = useState<any | null>(null);
   const [addContactOpen, setAddContactOpen] = useState(false);
 
   const wasOpen = React.useRef(false);
   React.useEffect(() => {
     if (open && !wasOpen.current) {
       setDialogSelectedContactIds(initialSelectedContactIds || []);
       setDialogNewContacts(initialNewContacts || []);
       setEditContact(null);
     }
     wasOpen.current = open;
   }, [open, initialSelectedContactIds, initialNewContacts]);
 
   const filteredContacts = useMemo(() => {
     const query = searchQuery.toLowerCase();
     return primaryContacts.filter(c => 
       (c.name || `${c.firstName} ${c.lastName}`).toLowerCase().includes(query) ||
       (c.email || '').toLowerCase().includes(query) ||
       (c.position || c.designation || '').toLowerCase().includes(query)
     );
   }, [primaryContacts, searchQuery]);
 
   const handleToggleContact = (id: string) => {
     setDialogSelectedContactIds(prev => 
       prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
     );
   };
 
   const isNewContact = (contact: any) => dialogNewContacts.some((nc) => nc._id === contact._id);
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 overflow-hidden bg-slate-50 border-none rounded-[2rem] shadow-2xl">
         {/* Header */}
         <div className="bg-white px-8 pt-8 pb-6 border-b border-slate-100 shrink-0">
           <div className="flex items-center justify-between mb-6">
             <div className="space-y-1">
               <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                 Manage Stakeholders
                 <span className="text-[10px] font-black bg-brand/10 text-brand px-3 py-1 rounded-full border border-brand/10">
                   {dialogSelectedContactIds.length} Selected
                 </span>
               </h2>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Select or add hiring managers for this job</p>
             </div>
             <Button 
               variant="ghost" 
               size="icon" 
               onClick={() => onOpenChange(false)} 
               className="rounded-full hover:bg-slate-100 transition-colors"
             >
               <X className="w-5 h-5 text-slate-400" />
             </Button>
           </div>
 
           <div className="relative group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand transition-colors" />
             <Input 
               placeholder="Search by name, email or position..." 
               className="pl-12 h-12 bg-slate-50 border-slate-200 rounded-2xl focus-visible:ring-brand focus-visible:border-brand font-medium text-sm transition-all"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
           </div>
         </div>
 
         {/* Content Area */}
         <div className="flex-1 overflow-hidden flex flex-col">
           <ScrollArea className="flex-1 px-8 py-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* New Contacts First */}
               {dialogNewContacts.map((contact) => (
                 <div 
                   key={contact._id}
                   onClick={() => handleToggleContact(contact._id)}
                   className={cn(
                     "group relative p-5 rounded-3xl border-2 transition-all cursor-pointer bg-white",
                     dialogSelectedContactIds.includes(contact._id) 
                       ? "border-brand shadow-lg shadow-brand/5 ring-1 ring-brand/20" 
                       : "border-transparent shadow-sm hover:border-slate-200"
                   )}
                 >
                   <div className="flex items-start justify-between gap-4">
                     <div className="flex items-start gap-4 min-w-0">
                       <div className={cn(
                         "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-inner shrink-0",
                         dialogSelectedContactIds.includes(contact._id) ? "bg-brand text-white" : "bg-slate-100 text-slate-400"
                       )}>
                         {dialogSelectedContactIds.includes(contact._id) ? <Check className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
                       </div>
                       <div className="min-w-0">
                         <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-slate-900 truncate">{contact.name}</h4>
                            <span className="text-[8px] font-black bg-green-50 text-green-600 px-2 py-0.5 rounded-full uppercase tracking-tighter border border-green-100">NEW</span>
                         </div>
                         <p className="text-[10px] font-black text-brand uppercase tracking-widest mt-1 opacity-80 truncate">
                           {contact.position || contact.designation || "Stakeholder"}
                         </p>
                       </div>
                     </div>
                     <Button
                       variant="ghost"
                       size="icon"
                       className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-400"
                       onClick={(e) => {
                         e.stopPropagation();
                         setEditContact(contact);
                         setAddContactOpen(true);
                       }}
                     >
                       <Pencil className="w-3.5 h-3.5" />
                     </Button>
                   </div>
                 </div>
               ))}
 
               {/* Existing Contacts */}
               {filteredContacts.map((contact) => {
                 if (dialogNewContacts.some(nc => nc._id === contact._id)) return null;
                 const isSelected = dialogSelectedContactIds.includes(contact._id);
                 return (
                   <div 
                     key={contact._id}
                     onClick={() => handleToggleContact(contact._id)}
                     className={cn(
                       "group relative p-5 rounded-3xl border-2 transition-all cursor-pointer bg-white",
                       isSelected 
                         ? "border-brand shadow-lg shadow-brand/5 ring-1 ring-brand/20" 
                         : "border-transparent shadow-sm hover:border-slate-200"
                     )}
                   >
                     <div className="flex items-start gap-4">
                       <div className={cn(
                         "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-inner shrink-0",
                         isSelected ? "bg-brand text-white shadow-brand/20" : "bg-slate-50 text-slate-300 group-hover:bg-slate-100"
                       )}>
                         {isSelected ? <Check className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                       </div>
                       <div className="min-w-0 space-y-1">
                         <h4 className="text-sm font-black text-slate-900 truncate">{contact.name || `${contact.firstName} ${contact.lastName}`}</h4>
                         <p className="text-[10px] font-black text-brand uppercase tracking-widest opacity-80 truncate">
                           {contact.position || contact.designation || "Stakeholder"}
                         </p>
                         <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400 pt-1">
                            <span className="truncate">{contact.email}</span>
                         </div>
                       </div>
                     </div>
                   </div>
                 );
               })}
             </div>
 
             {filteredContacts.length === 0 && searchQuery && (
               <div className="py-20 text-center flex flex-col items-center animate-in fade-in zoom-in duration-300">
                 <div className="w-20 h-20 bg-slate-100 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-inner">
                   <Search className="w-8 h-8 text-slate-300" />
                 </div>
                 <h3 className="text-lg font-black text-slate-800 tracking-tight">No results found</h3>
                 <p className="text-sm text-slate-400 font-semibold max-w-xs mx-auto mt-2">
                   We couldn't find any contacts matching "<span className="text-slate-900">{searchQuery}</span>"
                 </p>
               </div>
             )}
           </ScrollArea>
         </div>
 
         {/* Footer */}
         <div className="bg-white px-8 py-6 border-t border-slate-100 flex items-center justify-between shrink-0">
           <Button
             variant="outline"
             onClick={() => setAddContactOpen(true)}
             className="rounded-2xl border-2 border-slate-200 text-slate-600 font-black h-12 px-6 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
           >
             <Plus className="w-4 h-4 mr-2" />
             Add New Contact
           </Button>
 
           <div className="flex items-center gap-3">
             <Button
               variant="ghost"
               onClick={() => onOpenChange(false)}
               className="rounded-2xl text-slate-400 font-bold hover:text-slate-600 px-6 h-12"
             >
               Cancel
             </Button>
             <Button
               onClick={() => {
                 const ids = new Set(primaryContacts.map((c) => c._id));
                 const updatedContacts = [
                   ...primaryContacts,
                   ...dialogNewContacts.filter((nc) => !ids.has(nc._id)),
                 ];
                 onSave(updatedContacts, dialogSelectedContactIds, dialogNewContacts);
                 setEditContact(null);
                 onOpenChange(false);
               }}
               className="bg-brand text-white font-black h-12 px-10 rounded-2xl shadow-xl shadow-brand/20 active:scale-95 transition-all"
             >
               Confirm Selection <ArrowRight className="w-4 h-4 ml-2" />
             </Button>
           </div>
         </div>
       </DialogContent>
 
       <AddContactModal
         open={addContactOpen}
         onOpenChange={(open: boolean) => {
           setAddContactOpen(open);
           if (!open) setEditContact(null);
         }}
         onAdd={(contact: any) => {
           if (editContact) {
             setDialogNewContacts((prev) =>
               prev.map((c) =>
                 c._id === editContact._id
                   ? {
                       ...c,
                       ...contact,
                       name: `${contact.firstName || ""} ${contact.lastName || ""}`.trim(),
                     }
                   : c,
               ),
             );
             setEditContact(null);
           } else {
             const newId = Math.random().toString(36).substr(2, 9);
             setDialogNewContacts((prev) => [
               ...prev,
               {
                 ...contact,
                 _id: newId,
                 name: `${contact.firstName || ""} ${contact.lastName || ""}`.trim(),
               },
             ]);
             setDialogSelectedContactIds((ids) => [...ids, newId]);
           }
         }}
         countryCodes={countryCodes}
         positionOptions={positionOptions}
         initialValues={editContact || undefined}
       />
     </Dialog>
   );
 }