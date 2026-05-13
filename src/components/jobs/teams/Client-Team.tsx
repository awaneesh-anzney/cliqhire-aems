import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, UserPlus, Users, Building2, Briefcase, Mail, Phone, Linkedin, Loader2, AlertCircle } from "lucide-react";
import { getJobById, getPrimaryContactsByJobId, updateJobPrimaryContacts } from "@/services/jobService";
import { getPrimaryContacts } from "@/services/clientService";
import { AddContactModal } from "@/components/clients/modals/add-contact-modal";
import { Label } from "@/components/ui/label";
import { ClientPrimaryContactsDialog } from "./ClientPrimaryContactsDialog";
import { JobData } from "../types";

interface ClientTeamProps {
  jobId: string;
  jobData: JobData;
  canModify?: boolean;
}

export function ClientTeam({ jobId, jobData, canModify }: ClientTeamProps) {
  const [allClientContacts, setAllClientContacts] = useState<any[]>([]); // All client contacts
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]); // Job's selected contacts
  const [jobContacts, setJobContacts] = useState<any[]>([]); // Job's primary contacts from API
  const [showPrimaryContactsDialog, setShowPrimaryContactsDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newContacts, setNewContacts] = useState<any[]>([]); // For new contacts added in dialog
  const [clientId, setClientId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  

  // Use the same options as in ContactsContent
  const countryCodes: any[] = [];
  const positionOptions = [
    { value: "CEO", label: "CEO" },
  { value: "HR Head", label: "HR Head" },
  { value: "CHRO", label: "CHRO" },
  { value: "HR", label: "HR" },
  { value: "Manager", label: "Manager" },
  { value: "HR Manager", label: "HR Manager" },
  { value: "Director", label: "Director" },
  { value: "Executive", label: "Executive" },
  { value: "General Manager", label: "General Manager" },
  ];

  // Add getCountryCodeLabel helper (copy from ContactsContent)
  const getCountryCodeLabel = (code: string) => {
    const country = countryCodes.find((option) => option.code === code);
    return country ? country.label : code;
  };

  // Add new contact to local state (for demo, append to primaryContacts)
  const handleAddContact = (contact: any) => {
    // Add new contact
    setNewContacts((prev) => [
      ...prev,
      {
        ...contact,
        _id: Math.random().toString(36).substr(2, 9), // temp id
        name: `${contact.firstName || ""} ${contact.lastName || ""}`.trim(),
      },
    ]);
  };


  // Fetch client contacts and job's selected contacts
  const fetchClientAndJobContacts = async () => {
    if (!jobId || !jobData?.client?._id) return;
    
    setError(null);
    setLoading(true);
    try {
      setClientId(jobData.client._id);
      
      // Fetch both in parallel
      const [allContactsArr, pcRes] = await Promise.all([
        getPrimaryContacts(jobData.client._id),
        getPrimaryContactsByJobId(jobId)
      ]);
      
      setAllClientContacts(allContactsArr || []);
      const jobContactsArr = pcRes?.data?.primaryContacts || [];
      setJobContacts(jobContactsArr);
      setSelectedContactIds(jobContactsArr.map((c: any) => c._id));
      setNewContacts([]);
    } catch (err: any) {
      console.error("Error fetching contacts:", err);
      setError(err.message || "Failed to load primary contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientAndJobContacts();
  }, [jobId, jobData?.client?._id]);

  const handleOpenManageContacts = () => {
    fetchClientAndJobContacts(); // Refresh data on open
    setShowPrimaryContactsDialog(true);
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm transition-all hover:shadow-xl hover:border-brand/20 overflow-hidden flex flex-col h-full min-h-[550px]">
      <div className="flex items-center justify-between p-6 border-b border-border bg-muted/50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand/10 rounded-xl">
            <Building2 className="w-5 h-5 text-brand" />
          </div>
          <div>
            <h2 className="text-sm font-black text-foreground uppercase tracking-widest">Client Team</h2>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter mt-0.5">Stakeholders & Hiring Managers</p>
          </div>
        </div>
        {canModify && (
          <Button
            variant="default"
            size="sm"
            className="bg-brand text-white font-black h-10 px-6 rounded-xl shadow-lg shadow-brand/10 hover:shadow-brand/20 active:scale-95 transition-all duration-300"
            disabled={loading}
            onClick={handleOpenManageContacts}
          >
            <Plus className="w-4 h-4 mr-2" />
            Manage
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-auto p-6">
        {error && (
          <div className="flex items-center gap-3 p-4 text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-2xl mb-6 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
        
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-8 h-8 text-brand animate-spin" />
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest animate-pulse">Retrieving Stakeholders...</p>
          </div>
        )}

        {(() => {
          if (loading) return null;
          
          const selected = selectedContactIds
            .map(id =>
              allClientContacts.find(c => c._id === id) ||
              jobContacts.find(c => c._id === id)
            )
            .filter(Boolean);

          if (selected.length === 0 && !error) {
            return (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                  <UserPlus className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-base font-black text-foreground">No Stakeholders Assigned</h3>
                <p className="text-xs text-muted-foreground font-semibold max-w-[240px] mt-2 mb-8 uppercase tracking-wider">
                  Link decision makers from the client organization to this job requirement.
                </p>
                {canModify && (
                  <Button 
                    variant="outline" 
                    onClick={handleOpenManageContacts}
                    className="border-border text-foreground font-bold hover:bg-muted px-8 rounded-xl"
                  >
                    Add Hiring Manager
                  </Button>
                )}
              </div>
            );
          }

          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" />
                  Linked Stakeholders ({selected.length})
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {selected.map((contact: any, index) => (
                  <div 
                    key={contact._id} 
                    className="group p-5 rounded-2xl border border-border bg-card shadow-sm hover:shadow-xl hover:border-brand/20 transition-all duration-300 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Brand line on hover */}
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-muted group-hover:bg-brand transition-all duration-300" />

                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-brand/5 group-hover:text-brand transition-all duration-500 shadow-inner shrink-0">
                          <Users className="w-6 h-6" />
                        </div>
                        <div className="space-y-3 min-w-0">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-black text-foreground group-hover:text-brand transition-colors truncate">
                                {contact.firstName || contact.lastName
                                  ? `${contact.firstName || ""} ${contact.lastName || ""}`.trim()
                                  : contact.name || "Unnamed Contact"}
                              </h4>
                              {contact.gender && (
                                <span className="text-[8px] font-black bg-muted text-muted-foreground px-2 py-0.5 rounded-full uppercase tracking-tighter border border-border/50">
                                  {contact.gender}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] font-black text-brand uppercase tracking-[0.15em] flex items-center gap-1.5 mt-1 opacity-80">
                              <Briefcase className="w-3 h-3" /> 
                              {contact.position || contact.designation || "Stakeholder"}
                            </p>
                          </div>
  
                          <div className="flex flex-wrap gap-x-6 gap-y-2">
                            <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
                              <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                              <a href={`mailto:${contact.email}`} className="hover:text-brand hover:underline truncate">
                                {contact.email || "—"}
                              </a>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
                              <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="whitespace-nowrap">
                                {contact.phone ? (
                                  <>
                                    <span className="opacity-50 font-medium">{contact.countryCode || ""}</span> {contact.phone}
                                  </>
                                ) : "No phone"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
  
                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 h-full pt-1 shrink-0">
                        {contact.linkedin && (
                          <a
                            href={contact.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-brand/5 text-brand rounded-xl hover:bg-brand hover:text-white transition-all duration-300 shadow-sm"
                            title="View LinkedIn Profile"
                          >
                            <Linkedin className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
      <ClientPrimaryContactsDialog
        open={showPrimaryContactsDialog}
        onOpenChange={setShowPrimaryContactsDialog}
        primaryContacts={allClientContacts}
        initialSelectedContactIds={selectedContactIds}
        onSave={async (updatedContacts, selectedIds, dialogNewContacts = []) => {
          setLoading(true);
          setError(null);
          try {
            const existingIdsSet = new Set(allClientContacts.map((c: any) => c._id));
            const selectedExistingContactIds = selectedIds.filter(id => existingIdsSet.has(id));
            const newContactsToSave = (dialogNewContacts || [])
              .filter((c: any) => !existingIdsSet.has(c._id))
              .map((c: any) => {
                const { _id, ...rest } = c;
                return { ...rest, client_id: clientId };
              });
            await updateJobPrimaryContacts(
              jobId,
              selectedExistingContactIds,
              newContactsToSave,
              clientId
            );
            await fetchClientAndJobContacts(); // Refresh after save
            setShowPrimaryContactsDialog(false);
          } catch (err: any) {
            setError(err.message || "Failed to update primary contacts");
          } finally {
            setLoading(false);
          }
        }}
        countryCodes={countryCodes}
        positionOptions={positionOptions}
        AddContactModal={AddContactModal}
      />
    </div>
  );
}
