"use client";

import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Mail, Phone, Linkedin, MapPin, User, Briefcase, Globe, Info, Loader2, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { AddContactModal } from "../modals/add-contact-modal";
import { formatPhoneNumber } from "@/lib/countryCodes";
import EditContactDetailsModal from "./EditContactDetailsModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { usePrimaryContacts, useContactMutations } from "@/hooks/useContacts";
import { cn } from "@/lib/utils";

interface ContactsContentProps {
  clientId: string;
  clientData?: any;
  canModify?: boolean;
}

export function ContactsContent({ clientId, clientData, canModify }: ContactsContentProps) {
  const { data: primaryContacts = [], isLoading, isError, error: fetchError } = usePrimaryContacts(clientId);
  const { addContact, updateContact, deleteContact, isAdding, isUpdating, isDeleting } = useContactMutations(clientId);

  const [isContactEditOpen, setIsContactEditOpen] = useState(false);
  const [deleteContactId, setDeleteContactId] = useState<string | null>(null);
  const [editContactIndex, setEditContactIndex] = useState<number | null>(null);
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);

  // Client info states (for the left card)
  // We'll use local state for these as they might be updated via a separate modal
  const [clientInfo, setClientInfo] = useState({
    phoneNumber: clientData?.phoneNumber || "",
    website: clientData?.website || "",
    emails: clientData?.emails || [],
    linkedInProfile: clientData?.linkedInProfile || "",
  });

  useEffect(() => {
    if (clientData) {
      setClientInfo({
        phoneNumber: clientData.phoneNumber || "",
        website: clientData.website || "",
        emails: clientData.emails || [],
        linkedInProfile: clientData.linkedInProfile || "",
      });
    }
  }, [clientData]);

  const handleAddOrEditContact = async (contact: any) => {
    try {
      if (editContactIndex !== null) {
        const contactToEdit = primaryContacts[editContactIndex];
        if (contactToEdit?._id) {
          await updateContact({ contactId: contactToEdit._id, data: contact });
        }
      } else {
        await addContact(contact);
      }
      setAddEditModalOpen(false);
      setEditContactIndex(null);
    } catch (err) {
      // Error handled by mutation
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteContactId) {
      try {
        await deleteContact(deleteContactId);
        setDeleteContactId(null);
      } catch (err) {
        // Error handled by mutation
      }
    }
  };

  const initialContactValues = editContactIndex !== null ? primaryContacts[editContactIndex] : undefined;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-[10px]">Loading Primary Contacts...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-100">
        <div className="text-red-500 font-bold mb-4">Error: {(fetchError as any)?.message || "Failed to fetch contacts"}</div>
        <Button onClick={() => window.location.reload()} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 font-bold">Retry Connection</Button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/50 rounded-2xl p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Card: Client Identity */}
        <div className="w-full lg:w-[35%] shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand/10 rounded-lg group-hover:bg-brand group-hover:text-white transition-colors">
                  <Globe className="w-4 h-4 text-brand group-hover:text-white" />
                </div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Client Hub</h2>
              </div>
              {canModify && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100"
                  onClick={() => setIsContactEditOpen(true)}
                >
                  <Pencil className="h-3.5 w-3.5 text-slate-400" />
                </Button>
              )}
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Phone</span>
                  <p className="text-sm font-bold text-slate-700">
                    {clientInfo.phoneNumber ? formatPhoneNumber(clientInfo.phoneNumber, clientData?.countryCode) : "Not Provided"}
                  </p>
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Website</span>
                  {clientInfo.website ? (
                    <a href={clientInfo.website} target="_blank" className="text-sm font-bold text-brand hover:underline flex items-center gap-1">
                      {clientInfo.website} <Globe className="w-3 h-3" />
                    </a>
                  ) : <p className="text-sm font-bold text-slate-300 italic">Not Provided</p>}
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Primary Email(s)</span>
                  <div className="flex flex-wrap gap-2">
                    {clientInfo.emails.length > 0 ? clientInfo.emails.map((email: string, idx: number) => (
                      <a key={idx} href={`mailto:${email}`} className="text-sm font-bold text-slate-700 hover:text-brand transition-colors">
                        {email}{idx < clientInfo.emails.length - 1 ? "," : ""}
                      </a>
                    )) : <p className="text-sm font-bold text-slate-300 italic">Not Provided</p>}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">LinkedIn Profile</span>
                  {clientInfo.linkedInProfile ? (
                    <a href={clientInfo.linkedInProfile} target="_blank" className="text-sm font-bold text-brand hover:underline flex items-center gap-1">
                      Official Page <Linkedin className="w-3 h-3" />
                    </a>
                  ) : <p className="text-sm font-bold text-slate-300 italic">Not Provided</p>}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50 flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                  <Info className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                  These details represent the general contact channels for {clientData?.name || "the client"}.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Stakeholders / Primary Contacts */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between px-2">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Primary Stakeholders
                <span className="text-xs font-black bg-brand/10 text-brand px-2 py-0.5 rounded-full">
                  {primaryContacts.length}
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-semibold">Manage key decision makers and points of contact.</p>
            </div>
            {canModify && (
              <Button 
                onClick={() => { setEditContactIndex(null); setAddEditModalOpen(true); }}
                className="bg-slate-900 hover:bg-black text-white font-black h-10 px-6 shadow-xl shadow-slate-200 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 mr-2" /> New Contact
              </Button>
            )}
          </div>

          {primaryContacts.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-black text-slate-800">No Stakeholders Assigned</h3>
              <p className="text-slate-500 text-sm font-semibold max-w-sm mx-auto mt-1 mb-6">
                Assign primary contacts to track relationship ownership and streamline communication.
              </p>
              {canModify && (
                <Button 
                  onClick={() => setAddEditModalOpen(true)}
                  variant="outline"
                  className="font-bold border-slate-200 hover:bg-slate-50"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add First Contact
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {primaryContacts.map((contact, index) => (
                <div key={contact._id || index} className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:border-brand/20 transition-all relative overflow-hidden">
                  {/* Status Indicator */}
                  <div className="absolute top-0 left-0 w-1 h-full bg-slate-100 group-hover:bg-brand transition-colors" />
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand/5 group-hover:text-brand transition-all">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900 leading-tight">
                            {contact.firstName} {contact.lastName}
                          </h4>
                          {contact.gender && (
                            <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md uppercase">
                              {contact.gender}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-black text-brand uppercase tracking-widest flex items-center gap-1 mt-0.5">
                          <Briefcase className="w-3 h-3" /> {contact.designation || contact.position || "Role Not Set"}
                        </p>
                      </div>
                    </div>
                    
                    {canModify && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-slate-100"
                          onClick={() => { setEditContactIndex(index); setAddEditModalOpen(true); }}
                        >
                          <Pencil className="h-3.5 w-3.5 text-slate-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-red-50 hover:text-red-600"
                          onClick={() => setDeleteContactId(contact._id || null)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-slate-300" />
                      <span className="truncate">{contact.email || "No email provided"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-300" />
                      <span>{contact.phone ? formatPhoneNumber(contact.phone, contact.countryCode) : "No phone provided"}</span>
                    </div>
                    {contact.location && (
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-300" />
                        <span className="truncate">{contact.location}</span>
                      </div>
                    )}
                    {contact.linkedin && (
                      <a href={contact.linkedin} target="_blank" className="flex items-center gap-3 text-xs font-bold text-brand hover:underline">
                        <Linkedin className="w-3.5 h-3.5" />
                        <span className="truncate">LinkedIn Profile</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {canModify && (
        <>
          <AddContactModal
            open={addEditModalOpen}
            onOpenChange={(open) => {
              setAddEditModalOpen(open);
              if (!open) setEditContactIndex(null);
            }}
            onAdd={handleAddOrEditContact}
            initialValues={initialContactValues}
            isEdit={editContactIndex !== null}
            positionOptions={[]} // Pass empty as it fetches internally
          />

          <EditContactDetailsModal
            open={isContactEditOpen}
            onClose={() => setIsContactEditOpen(false)}
            clientId={clientId}
            initialValues={clientInfo}
            onSave={async (values) => {
              setClientInfo(values);
              setIsContactEditOpen(false);
              toast.success("Identity updated locally. Note: persist via client update API if needed.");
            }}
          />

          <Dialog open={deleteContactId !== null} onOpenChange={() => setDeleteContactId(null)}>
            <DialogContent className="rounded-3xl border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">Revoke Access?</DialogTitle>
                <DialogDescription className="text-sm font-semibold text-slate-500">
                  This will permanently remove this stakeholder from your records.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-3 mt-6">
                <Button variant="ghost" onClick={() => setDeleteContactId(null)} className="font-bold text-slate-400 hover:text-slate-600">
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="font-black px-8 bg-red-600 hover:bg-red-700 shadow-xl shadow-red-100"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                  Confirm Deletion
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
