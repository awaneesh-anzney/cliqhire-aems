import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, UserPlus, Users, Building2, Briefcase, Mail, Phone, Linkedin, Loader2, AlertCircle } from "lucide-react";
import { getPrimaryContactsByJobId, updateJobPrimaryContacts } from "@/services/jobService";
import { getPrimaryContacts } from "@/services/clientService";
import { AddContactModal } from "@/components/clients/modals/add-contact-modal";
import { ClientPrimaryContactsDialog } from "./ClientPrimaryContactsDialog";
import { JobData } from "../types";

interface ClientTeamProps {
  jobId: string;
  jobData: JobData;
  canModify?: boolean;
}

export function ClientTeam({ jobId, jobData, canModify }: ClientTeamProps) {
  const [allClientContacts, setAllClientContacts] = useState<any[]>([]);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [jobContacts, setJobContacts] = useState<any[]>([]);
  const [showPrimaryContactsDialog, setShowPrimaryContactsDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string>("");
  const [loading, setLoading] = useState(false);

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

  const fetchClientAndJobContacts = async () => {
    if (!jobId || !jobData?.client?._id) return;
    
    setError(null);
    setLoading(true);
    try {
      setClientId(jobData.client._id);
      
      const [allContactsArr, pcRes] = await Promise.all([
        getPrimaryContacts(jobData.client._id),
        getPrimaryContactsByJobId(jobId)
      ]);
      
      setAllClientContacts(allContactsArr || []);
      const jobContactsArr = pcRes?.data?.primaryContacts || [];
      setJobContacts(jobContactsArr);
      setSelectedContactIds(jobContactsArr.map((c: any) => c._id));
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
    fetchClientAndJobContacts();
    setShowPrimaryContactsDialog(true);
  };

  return (
    <div className="bg-card rounded-xl border border-border/70 shadow-xs overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-border/60 bg-muted/25">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-md text-primary shrink-0">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-foreground">Client Team</h3>
            <p className="text-[10px] text-muted-foreground font-medium">Stakeholders & Hiring Managers</p>
          </div>
        </div>
        {canModify && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2.5 text-xs font-medium text-primary hover:bg-primary/10"
            disabled={loading}
            onClick={handleOpenManageContacts}
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Manage
          </Button>
        )}
      </div>

      <div className="p-3 space-y-2.5 flex-1">
        {error && (
          <div className="flex items-center gap-2 p-2.5 text-xs font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </div>
        )}
        
        {loading && (
          <div className="flex flex-col items-center justify-center py-10 space-y-2">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <p className="text-[10px] font-medium text-muted-foreground">Loading stakeholders...</p>
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
              <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/15 border border-dashed border-border/70 rounded-lg p-4">
                <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center mb-2 text-muted-foreground">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-semibold text-foreground">No Stakeholders Assigned</h4>
                <p className="text-[11px] text-muted-foreground max-w-[240px] mt-0.5 mb-3">
                  Link decision makers from the client organization to this job requirement.
                </p>
                {canModify && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleOpenManageContacts}
                    className="h-7 px-2.5 text-xs border-border text-foreground font-medium"
                  >
                    Add Stakeholder
                  </Button>
                )}
              </div>
            );
          }

          return (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-0.5">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3 h-3" />
                  Linked Stakeholders ({selected.length})
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {selected.map((contact: any) => (
                  <div 
                    key={contact._id} 
                    className="p-2.5 rounded-lg border border-border/50 bg-muted/15 hover:border-border/80 transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20 shrink-0 mt-0.5">
                        {contact.firstName?.charAt(0) || contact.name?.charAt(0) || "U"}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h5 className="text-xs font-semibold text-foreground truncate">
                            {contact.firstName || contact.lastName
                              ? `${contact.firstName || ""} ${contact.lastName || ""}`.trim()
                              : contact.name || "Unnamed Contact"}
                          </h5>
                          {contact.gender && (
                            <span className="text-[9px] font-medium bg-muted text-muted-foreground px-1.5 py-0.2 rounded border border-border/40">
                              {contact.gender}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-[10px] font-semibold text-primary flex items-center gap-1">
                          <Briefcase className="w-2.5 h-2.5" /> 
                          {contact.position || contact.designation || "Stakeholder"}
                        </p>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 pt-0.5">
                          {contact.email && (
                            <a 
                              href={`mailto:${contact.email}`} 
                              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Mail className="w-3 h-3 text-muted-foreground/70" />
                              <span className="truncate max-w-[150px]">{contact.email}</span>
                            </a>
                          )}
                          {contact.phone && (
                            <a 
                              href={`tel:${contact.phone}`} 
                              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <Phone className="w-3 h-3 text-muted-foreground/70" />
                              <span>{contact.countryCode ? `${contact.countryCode} ` : ""}{contact.phone}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {contact.linkedin && (
                      <a
                        href={contact.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-muted-foreground hover:text-primary transition-colors shrink-0"
                        title="View LinkedIn Profile"
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                      </a>
                    )}
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
            await fetchClientAndJobContacts();
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
