"use client";

import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Mail, Phone, Linkedin, MapPin, User, Briefcase, Globe, Info, Loader2, Users, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { AddContactModal } from "../modals/add-contact-modal";
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
import { useToggleContactSource } from "@/hooks/useClient";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ContactsContentProps {
  clientId: string;
  clientData?: any;
  canModify?: boolean;
}

export function ContactsContent({ clientId, clientData, canModify }: ContactsContentProps) {
  const { data: primaryContacts = [], isLoading, isError, error: fetchError } = usePrimaryContacts(clientId);
  const { addContact, updateContact, deleteContact } = useContactMutations(clientId);
  const toggleContactSourceMutation = useToggleContactSource();

  const isSubsidiary = !!clientData?.parentClientId;
  const primaryContactSource = clientData?.primaryContactSource || "own";
  const effectiveCanModify = canModify && primaryContactSource !== "parent";

  const [isContactEditOpen, setIsContactEditOpen] = useState(false);
  const [deleteContactId, setDeleteContactId] = useState<string | null>(null);
  const [editContactIndex, setEditContactIndex] = useState<number | null>(null);
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);

  const [clientInfo, setClientInfo] = useState({
    phoneNumber: clientData?.phoneNumber || "",
    countryCode: clientData?.countryCode || "+966",
    website: clientData?.website || "",
    emails: clientData?.emails || [],
    linkedInProfile: clientData?.linkedInProfile || "",
  });

  useEffect(() => {
    if (clientData) {
      setClientInfo({
        phoneNumber: clientData.phoneNumber || "",
        countryCode: clientData.countryCode || "+966",
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
      <div className="flex flex-col items-center justify-center p-16 space-y-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Loading Contacts...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-destructive/10 rounded-xl border border-destructive/20 max-w-lg mx-auto">
        <div className="text-destructive font-semibold text-sm mb-3">
          Error: {(fetchError as any)?.message || "Failed to fetch contacts"}
        </div>
        <Button onClick={() => window.location.reload()} variant="outline" size="sm">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Subsidiary Warning / Source Toggle */}
      {isSubsidiary && (
        <div className="p-3.5 rounded-xl bg-card border border-border/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Subsidiary Contact Settings</h4>
              <p className="text-xs text-muted-foreground">
                Parent: <span className="font-semibold text-foreground">{clientData.parentCompany?.name || "Parent Company"}</span>.
                {primaryContactSource === "parent"
                  ? " Sharing parent's contacts."
                  : " Managing dedicated contacts."}
              </p>
            </div>
          </div>
          {canModify && (
            <Button
              variant="outline"
              size="sm"
              disabled={toggleContactSourceMutation.isPending}
              onClick={() => {
                const newSource = primaryContactSource === "parent" ? "own" : "parent";
                toggleContactSourceMutation.mutate({ clientId, primaryContactSource: newSource });
              }}
              className="text-xs font-semibold h-8 shrink-0"
            >
              {toggleContactSourceMutation.isPending
                ? "Updating..."
                : primaryContactSource === "parent"
                  ? "Manage Own Contacts"
                  : "Share Parent Contacts"}
            </Button>
          )}
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: General Client Contact Channels */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-card rounded-xl border border-border/70 shadow-2xs overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Official Channels
                </h3>
              </div>
              {canModify && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => setIsContactEditOpen(true)}
                >
                  <Pencil className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              )}
            </div>

            <div className="p-4 space-y-3.5 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Main Phone</span>
                <p className="font-semibold text-foreground">
                  {clientInfo.phoneNumber
                    ? clientInfo.countryCode && clientInfo.phoneNumber
                      ? `${clientInfo.countryCode}-${clientInfo.phoneNumber}`
                      : clientInfo.phoneNumber
                    : "Not provided"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Website</span>
                <div>
                  {clientInfo.website ? (
                    <a
                      href={clientInfo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-primary hover:underline inline-flex items-center gap-1 truncate max-w-full"
                    >
                      <span className="truncate">{clientInfo.website}</span>
                      <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
                    </a>
                  ) : (
                    <p className="text-muted-foreground/60 italic font-normal">Not provided</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Official Email(s)</span>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {clientInfo.emails.length > 0 ? (
                    clientInfo.emails.map((email: string, idx: number) => (
                      <a
                        key={idx}
                        href={`mailto:${email}`}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/60 hover:bg-muted text-foreground font-medium text-[11px] transition-colors"
                      >
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span>{email}</span>
                      </a>
                    ))
                  ) : (
                    <p className="text-muted-foreground/60 italic font-normal">Not provided</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">LinkedIn</span>
                <div>
                  {clientInfo.linkedInProfile ? (
                    <a
                      href={clientInfo.linkedInProfile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <span>Company Profile</span>
                      <Linkedin className="w-3 h-3 text-sky-600" />
                    </a>
                  ) : (
                    <p className="text-muted-foreground/60 italic font-normal">Not provided</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Primary Stakeholders List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">Stakeholders & Contacts</h3>
              <Badge variant="outline" className="h-5 px-1.5 text-xs font-bold bg-primary/10 text-primary border-primary/20">
                {primaryContacts.length}
              </Badge>
            </div>

            {effectiveCanModify && (
              <Button
                onClick={() => {
                  setEditContactIndex(null);
                  setAddEditModalOpen(true);
                }}
                size="sm"
                className="h-8 px-3 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> New Contact
              </Button>
            )}
          </div>

          {primaryContacts.length === 0 ? (
            <div className="bg-card rounded-xl border border-dashed border-border/80 p-10 text-center flex flex-col items-center">
              <div className="h-10 w-10 bg-muted rounded-xl flex items-center justify-center mb-3 text-muted-foreground">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-foreground">No Stakeholders Added</h4>
              <p className="text-xs text-muted-foreground max-w-xs mt-1 mb-4">
                Add primary contacts, hiring managers, or procurement leads for this client.
              </p>
              {effectiveCanModify && (
                <Button
                  onClick={() => setAddEditModalOpen(true)}
                  variant="outline"
                  size="sm"
                  className="text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add First Contact
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {primaryContacts.map((contact, index) => {
                const initials = `${contact.firstName?.[0] || ""}${contact.lastName?.[0] || ""}`.toUpperCase() || "C";
                const phoneStr = contact.phone
                  ? contact.countryCode && contact.phone
                    ? `${contact.countryCode}-${contact.phone}`
                    : contact.phone
                  : null;

                return (
                  <div
                    key={contact._id || index}
                    className="bg-card rounded-xl border border-border/70 p-4 shadow-2xs hover:border-primary/40 transition-colors flex flex-col justify-between space-y-3"
                  >
                    <div>
                      {/* Card Top: Avatar & Name & Actions */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/80 to-primary text-white font-bold text-xs shrink-0">
                            <AvatarFallback className="rounded-xl">{initials}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-foreground truncate">
                              {contact.firstName} {contact.lastName}
                            </h4>
                            <p className="text-xs font-semibold text-primary/80 truncate">
                              {contact.designation || contact.position || "Stakeholder"}
                            </p>
                          </div>
                        </div>

                        {effectiveCanModify && (
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
                              onClick={() => {
                                setEditContactIndex(index);
                                setAddEditModalOpen(true);
                              }}
                              title="Edit Contact"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteContactId(contact._id || null)}
                              title="Delete Contact"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Card Middle: Details */}
                      <div className="space-y-1.5 pt-3 text-xs text-muted-foreground">
                        {contact.email && (
                          <div className="flex items-center gap-2 truncate">
                            <Mail className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                            <a href={`mailto:${contact.email}`} className="truncate hover:text-primary transition-colors">
                              {contact.email}
                            </a>
                          </div>
                        )}

                        {phoneStr && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                            <a href={`tel:${phoneStr}`} className="hover:text-primary transition-colors">
                              {phoneStr}
                            </a>
                          </div>
                        )}

                        {contact.location && (
                          <div className="flex items-center gap-2 truncate">
                            <MapPin className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                            <span className="truncate">{contact.location}</span>
                          </div>
                        )}

                        {contact.linkedin && (
                          <div className="flex items-center gap-2">
                            <Linkedin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                            <a
                              href={contact.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline inline-flex items-center gap-1"
                            >
                              LinkedIn Profile
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {contact.gender && (
                      <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="capitalize">{contact.gender}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Contact Modal */}
      {canModify && (
        <AddContactModal
          open={addEditModalOpen}
          onOpenChange={(open) => {
            setAddEditModalOpen(open);
            if (!open) setEditContactIndex(null);
          }}
          onAdd={handleAddOrEditContact}
          initialValues={initialContactValues}
          isEdit={editContactIndex !== null}
          positionOptions={[]}
        />
      )}

      {/* Edit Main Company Contact Details Modal */}
      {canModify && (
        <EditContactDetailsModal
          open={isContactEditOpen}
          onClose={() => setIsContactEditOpen(false)}
          clientId={clientId}
          initialValues={clientInfo}
          onSave={async (values) => {
            setClientInfo(values);
            setIsContactEditOpen(false);
            toast.success("Client contact identity updated");
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteContactId} onOpenChange={(open) => !open && setDeleteContactId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Stakeholder Contact</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this contact person? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteContactId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
