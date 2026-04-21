import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus } from "lucide-react";
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
    <div className="bg-white rounded-lg border px-4 py-4 h-[56vh] flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Client Team</h2>
        <Button
          variant="default"
          size="sm"
          className="gap-1"
          disabled={!canModify}
          onClick={() => {
            if (!canModify) return;
            setShowPrimaryContactsDialog(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Add Primary Contacts
        </Button>
      </div>
      <div className="flex-1 overflow-auto mt-2">
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {/* Show empty state if no contacts */}
        {(() => {
          // Show selected contacts (from allClientContacts if present, else from jobContacts)
          const selected = selectedContactIds
            .map(id =>
              allClientContacts.find(c => c._id === id) ||
              jobContacts.find(c => c._id === id)
            )
            .filter(Boolean);
          if (selected.length === 0 && !error) {
            return (
              <div className="flex flex-col items-center justify-center h-[calc(100%-50px)] text-gray-500 text-sm py-8">
                <UserPlus className="w-10 h-10 mb-2" />
                <span className="text-base">
                  Add primary contact related to this job.
                </span>
              </div>
            );
          }
          return (
            <div className="space-y-2">
              <Label className="mb-2 block text-sm">
                Team involved from client Side to handle this job
              </Label>
              {selected.map((contact: any) => (
                <div key={contact._id} className="p-3 rounded-md border bg-gray-50">
                  <div className="flex gap-6">
                    <div>
                      <div>
                        <span className="text-xs font-semibold text-gray-500 mr-1">Name:</span>
                        <span className="text-sm text-muted-foreground">
                          {contact.firstName || contact.lastName
                            ? `${contact.firstName || ""} ${contact.lastName || ""}`.trim()
                            : contact.name || "Unnamed Contact"}
                        </span>
                      </div>

                      <div>
                        <span className="text-xs font-semibold text-gray-500 mr-1">Position:</span>
                        <span className="text-sm text-muted-foreground">
                          {contact.position || "—"}
                        </span>
                      </div>

                      <div>
                        <span className="text-xs font-semibold text-gray-500 mr-1">Email:</span>
                        <span className="text-sm text-muted-foreground">
                          {contact.email || "—"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div>
                        <span className="text-xs font-semibold text-gray-500 mr-1">Gender:</span>
                        <span className="text-sm text-muted-foreground">
                          {contact.gender || "—"}
                        </span>
                      </div>

                      <div>
                        <span className="text-xs font-semibold text-gray-500 mr-1">LinkedIn:</span>
                        <span className="text-sm text-muted-foreground">
                          {contact.linkedin ? (
                            <a
                              href={contact.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-500 hover:underline"
                            >
                              {contact.linkedin}
                            </a>
                          ) : (
                            "No LinkedIn"
                          )}
                        </span>
                      </div>

                      <div>
                        <span className="text-xs font-semibold text-gray-500 mr-1">Phone:</span>
                        <span className="text-sm text-muted-foreground">
                          {getCountryCodeLabel(contact.countryCode || "")}
                          <span className="mx-1">-</span>
                          {contact.phone || "No phone"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
