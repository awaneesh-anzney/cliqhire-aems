import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getPrimaryContacts, 
  addPrimaryContact, 
  updatePrimaryContact, 
  deletePrimaryContact,
  PrimaryContact
} from "@/services/clientService";
import { toast } from "sonner";

export const usePrimaryContacts = (clientId: string) => {
  return useQuery({
    queryKey: ["primaryContacts", clientId],
    queryFn: () => getPrimaryContacts(clientId),
    enabled: !!clientId,
  });
};

export const useContactMutations = (clientId: string) => {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: (data: PrimaryContact) => addPrimaryContact(clientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["primaryContacts", clientId] });
      toast.success("Contact added successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add contact");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ contactId, data }: { contactId: string; data: Partial<PrimaryContact> }) => 
      updatePrimaryContact(clientId, contactId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["primaryContacts", clientId] });
      toast.success("Contact updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update contact");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (contactId: string) => deletePrimaryContact(clientId, contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["primaryContacts", clientId] });
      toast.success("Contact deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete contact");
    },
  });

  return {
    addContact: addMutation.mutateAsync,
    updateContact: updateMutation.mutateAsync,
    deleteContact: deleteMutation.mutateAsync,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
