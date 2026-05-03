import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, UserPlus, Users, Building2, Briefcase, Mail, Phone, Linkedin, Loader2, AlertCircle } from "lucide-react";
import { getJobById, getPrimaryContactsByJobId, updateJobPrimaryContacts } from "@/services/jobService";
import { getClientById } from "@/services/clientService";
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
  useEffect(() => {
    const fetchClientAndJobContacts = async () => {
      setError(null);
      setLoading(true);
      try {
        setClientId(jobData.client._id);
        // Fetch client contacts (all options)
        const client = await getClientById(jobData.client._id);
        setAllClientContacts(client.primaryContacts || []);
        // Fetch job's primary contacts (selected)
        const pcRes = await getPrimaryContactsByJobId(jobId);
        const jobContactsArr = pcRes?.data?.primaryContacts || [];
        setJobContacts(jobContactsArr);
        setSelectedContactIds(jobContactsArr.map((c: any) => c._id));
        setNewContacts([]);
      } catch (err: any) {
        setError(err.message || "Failed to load primary contacts");
        setAllClientContacts([]);
        setSelectedContactIds([]);
        setNewContacts([]);
      } finally {
        setLoading(false);
      }
    };
    if (jobId) fetchClientAndJobContacts();
  }, [jobId]);

  // Helper to check if a contact is new
  const isNewContact = (contact: any) => newContacts.some((nc) => nc._id === contact._id);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md overflow-hidden flex flex-col h-full min-h-[500px]">
      <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand/10 rounded-lg">
            <Building2 className="w-4 h-4 text-brand" />
          </div>
          <h2 className="text-base font-semibold text-slate-800">Client Team</h2>
        </div>
        <Button
          variant="default"
          size="sm"
          className="bg-brand hover:bg-brand/90 text-white rounded-lg px-4"
          disabled={!canModify || loading}
          onClick={() => {
            if (!canModify) return;
            setShowPrimaryContactsDialog(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Manage Contacts
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-5">
        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg mb-4">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
        
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-brand animate-spin" />
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
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <div className="p-4 bg-slate-50 rounded-full mb-4">
                  <UserPlus className="w-12 h-12 text-slate-200" />
                </div>
                <h3 className="text-sm font-medium text-slate-900 mb-1">No Primary Contacts</h3>
                <p className="text-xs text-slate-500 max-w-[200px] text-center">
                  Add team members from the client side who are involved in this job.
                </p>
              </div>
            );
          }

          return (
            <div className="space-y-4">
              <p className="text-xs font-medium text-slate-500 mb-4 flex items-center gap-2">
                <Users className="w-3.5 h-3.5" />
                Stakeholders from {jobData.client.name}
              </p>
              
              <div className="grid grid-cols-1 gap-4">
                {selected.map((contact: any) => (
                  <div key={contact._id} className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:border-brand/20 transition-all group">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand transition-colors">
                            {contact.firstName || contact.lastName
                              ? `${contact.firstName || ""} ${contact.lastName || ""}`.trim()
                              : contact.name || "Unnamed Contact"}
                          </h4>
                          <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                            {contact.position || "Stakeholder"}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-2">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <a href={`mailto:${contact.email}`} className="hover:text-brand hover:underline">
                              {contact.email || "—"}
                            </a>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {getCountryCodeLabel(contact.countryCode || "")} {contact.phone || "No phone"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 h-full pt-1">
                        <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-[10px] font-bold uppercase tracking-wider">
                          {contact.gender || "—"}
                        </Badge>
                        
                        {contact.linkedin && (
                          <a
                            href={contact.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-[#0077B5]/10 text-[#0077B5] rounded-md hover:bg-[#0077B5]/20 transition-colors"
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
            // Existing contact IDs: those in selectedIds AND present in allClientContacts (with real backend _id)
            const existingIdsSet = new Set(allClientContacts.map((c: any) => c._id));
            const selectedExistingContactIds = selectedIds.filter(id => existingIdsSet.has(id));
            // New contacts: those in dialogNewContacts with temp _id (not in allClientContacts)
            const newContactsToSave = (dialogNewContacts || [])
              .filter((c: any) => !existingIdsSet.has(c._id))
              .map((c: any) => {
                // Remove temp _id if present, and add client_id
                const { _id, ...rest } = c;
                return { ...rest, client_id: clientId };
              });
            await updateJobPrimaryContacts(
              jobId,
              selectedExistingContactIds, // array of IDs
              newContactsToSave,          // array of new contact objects
              clientId                    // string
            );
            // Refresh contacts from backend
            const pcRes = await getPrimaryContactsByJobId(jobId);
            const jobContacts = pcRes?.data?.primaryContacts || [];
            setSelectedContactIds(jobContacts.map((c: any) => c._id));
            setNewContacts([]);
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
