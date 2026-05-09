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
        <p className="text-muted-foreground font-bold animate-pulse uppercase tracking-widest text-[10px]">Loading Primary Contacts...</p>
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
    <div className="bg-muted/50 rounded-2xl p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Card: Client Identity */}
        <div className="w-full lg:w-[35%] shrink-0">
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden group hover:shadow-md transition-all">
            <div className="flex items-center justify-between p-5 border-b border-border bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand/10 rounded-lg group-hover:bg-brand group-hover:text-white transition-all duration-300">
                  <Globe className="w-4 h-4 text-brand group-hover:text-white" />
                </div>
                <h2 className="text-xs font-black text-foreground uppercase tracking-widest">Client Identity</h2>
              </div>
              {canModify && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg hover:bg-muted"
                  onClick={() => setIsContactEditOpen(true)}
                >
                  <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              )}
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Phone</span>
                  <p className="text-sm font-bold text-foreground">
                    {clientInfo.phoneNumber ? formatPhoneNumber(clientInfo.phoneNumber, clientData?.countryCode) : "Not Provided"}
                  </p>
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Website</span>
                  {clientInfo.website ? (
                    <a href={clientInfo.website} target="_blank" className="text-sm font-bold text-brand hover:underline flex items-center gap-1">
                      {clientInfo.website} <Globe className="w-3 h-3" />
                    </a>
                  ) : <p className="text-sm font-bold text-muted-foreground italic">Not Provided</p>}
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Primary Email(s)</span>
                  <div className="flex flex-wrap gap-2">
                    {clientInfo.emails.length > 0 ? clientInfo.emails.map((email: string, idx: number) => (
                      <a key={idx} href={`mailto:${email}`} className="text-sm font-bold text-foreground hover:text-brand transition-colors">
                        {email}{idx < clientInfo.emails.length - 1 ? "," : ""}
                      </a>
                    )) : <p className="text-sm font-bold text-muted-foreground italic">Not Provided</p>}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">LinkedIn Profile</span>
                  {clientInfo.linkedInProfile ? (
                    <a href={clientInfo.linkedInProfile} target="_blank" className="text-sm font-bold text-brand hover:underline flex items-center gap-1">
                      Official Page <Linkedin className="w-3 h-3" />
                    </a>
                  ) : <p className="text-sm font-bold text-muted-foreground italic">Not Provided</p>}
                </div>
              </div>

              <div className="pt-6 border-t border-border flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Info className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-[10px] text-muted-foreground font-bold leading-relaxed">
                  These details represent the general contact channels for {clientData?.name || "the client"}.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Stakeholders / Primary Contacts */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
                Primary Stakeholders
                <span className="text-[10px] font-black bg-brand/10 text-brand px-2.5 py-1 rounded-full border border-brand/10 shadow-sm">
                  {primaryContacts.length}
                </span>
              </h2>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Strategic Decision Makers & Points of Contact</p>
            </div>
            {canModify && (
              <Button 
                onClick={() => { setEditContactIndex(null); setAddEditModalOpen(true); }}
                className="bg-brand text-white font-black h-11 px-8 rounded-xl shadow-lg shadow-brand/10 hover:shadow-brand/20 active:scale-95 transition-all duration-300"
              >
                <Plus className="w-4 h-4 mr-2" /> New Contact
              </Button>
            )}
          </div>

          {primaryContacts.length === 0 ? (
            <div className="bg-card rounded-3xl border-2 border-dashed border-border p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-black text-foreground">No Stakeholders Assigned</h3>
              <p className="text-muted-foreground text-sm font-semibold max-w-sm mx-auto mt-1 mb-6">
                Assign primary contacts to track relationship ownership and streamline communication.
              </p>
              {canModify && (
                <Button 
                  onClick={() => setAddEditModalOpen(true)}
                  variant="outline"
                  className="font-bold border-border hover:bg-muted"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add First Contact
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {primaryContacts.map((contact, index) => (
                <div key={contact._id || index} className="group bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-lg hover:border-brand/20 transition-all relative overflow-hidden">
                  {/* Status Indicator */}
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-muted group-hover:bg-brand transition-all duration-300" />
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-brand/5 group-hover:text-brand transition-all duration-500 shadow-inner">
                        <User className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-black text-foreground leading-tight tracking-tight">
                            {contact.firstName} {contact.lastName}
                          </h4>
                          {contact.gender && (
                            <span className="text-[8px] font-black bg-muted text-muted-foreground px-2 py-0.5 rounded-full uppercase tracking-tighter border border-border/50">
                              {contact.gender}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-black text-brand uppercase tracking-[0.15em] flex items-center gap-1.5 mt-1 opacity-80">
                          <Briefcase className="w-3 h-3" /> {contact.designation || contact.position || "Role Not Set"}
                        </p>
                      </div>
                    </div>
                    
                    {canModify && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-muted"
                          onClick={() => { setEditContactIndex(index); setAddEditModalOpen(true); }}
                        >
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
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
                    <div className="flex items-center gap-3 text-xs font-bold text-foreground">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="truncate">{contact.email || "No email provided"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-foreground">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{contact.phone ? formatPhoneNumber(contact.phone, contact.countryCode) : "No phone provided"}</span>
                    </div>
                    {contact.location && (
                      <div className="flex items-center gap-3 text-xs font-bold text-foreground">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
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
                <DialogTitle className="text-xl font-black text-foreground tracking-tight">Revoke Access?</DialogTitle>
                <DialogDescription className="text-sm font-semibold text-muted-foreground">
                  This will permanently remove this stakeholder from your records.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-3 mt-6">
                <Button variant="ghost" onClick={() => setDeleteContactId(null)} className="font-bold text-muted-foreground hover:text-foreground">
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
