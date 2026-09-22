import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClients, getClientById, ClientResponse, bulkUploadClients } from "@/services/clientService";

export interface ClientsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  name?: string;
  clientId?: string;
  email?: string;
  phoneNumber?: string;
  industry?: string;
  clientStage?: "Lead" | "Engaged" | "Signed" | string;
  location?: string;
  clientTeam?: "Enterprise" | "SMB" | "Mid-Market";
  topLevelOnly?: boolean;
  salesLead?: string;
  referredBy?: string;
  createdBy?: string;
}

export interface ClientsPage {
  clients: ClientResponse[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  filters?: {
    topLevelOnly?: boolean;
    topLevelOnlyRequested?: boolean;
    [key: string]: any;
  };
}

export function useClients(params: ClientsQueryParams = {}) {
  const { page = 1, limit = 10, ...rest } = params;

  return useQuery<ClientsPage>({
    queryKey: ["clients", { page, limit, ...rest }],
    queryFn: () => getClients({ page, limit, ...rest }),
  });
}

export function useClientById(id: string) {
  return useQuery<ClientResponse>({
    queryKey: ["clientsData", id],
    queryFn: () => getClientById(id),
    enabled: Boolean(id),
  });
}

export function useBulkUploadClients() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => bulkUploadClients(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useLinkParentClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, parentClientId }: { clientId: string; parentClientId: string | null }) => 
      import("@/services/clientService").then(m => m.linkParentClient(clientId, parentClientId)),
    onSuccess: (data, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: ["clientsData", clientId] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useToggleContractSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, contractSource }: { clientId: string; contractSource: 'own' | 'parent' }) => 
      import("@/services/clientService").then(m => m.toggleContractSource(clientId, contractSource)),
    onSuccess: (data, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: ["clientsData", clientId] });
      queryClient.invalidateQueries({ queryKey: ["clientContracts", clientId] });
    },
  });
}

export function useToggleContactSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, primaryContactSource }: { clientId: string; primaryContactSource: 'own' | 'parent' }) => 
      import("@/services/clientService").then(m => m.toggleContactSource(clientId, primaryContactSource)),
    onSuccess: (data, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: ["clientsData", clientId] });
      queryClient.invalidateQueries({ queryKey: ["clientPrimaryContacts", clientId] });
    },
  });
}

export function useClientHierarchy(clientId: string) {
  return useQuery({
    queryKey: ["clientHierarchy", clientId],
    queryFn: () => import("@/services/clientService").then(m => m.getClientHierarchy(clientId)),
    enabled: Boolean(clientId),
  });
}
