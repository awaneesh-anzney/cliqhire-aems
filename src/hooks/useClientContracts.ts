import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClientContracts, getContractByType, addContract, updateContract, deleteContract, renewContract } from "@/services/clientContractService";
import { toast } from "sonner";

export const useClientContracts = (clientId: string) => {
  const queryClient = useQueryClient();

  const contractsQuery = useQuery({
    queryKey: ["clientContracts", clientId],
    queryFn: () => getClientContracts(clientId),
    enabled: !!clientId,
  });

  const addContractMutation = useMutation({
    mutationFn: ({ contractType, contractData }: { contractType: string; contractData: any }) => 
      addContract(clientId, contractType, contractData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientContracts", clientId] });
      queryClient.invalidateQueries({ queryKey: ["clientsData", clientId] });
      toast.success("Contract added successfully!");
    },
    onError: (error) => {
      console.error("Failed to add contract:", error);
      toast.error("Failed to add contract. Please try again.");
    }
  });

  const updateContractMutation = useMutation({
    mutationFn: ({ contractType, contractData }: { contractType: string; contractData: any }) => 
      updateContract(clientId, contractType, contractData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clientContracts", clientId] });
      queryClient.invalidateQueries({ queryKey: ["clientsData", clientId] });
      toast.success(`Contract updated successfully!`);
    },
    onError: (error) => {
      console.error("Failed to update contract:", error);
      toast.error("Failed to update contract. Please try again.");
    }
  });

  const deleteContractMutation = useMutation({
    mutationFn: (contractType: string) => deleteContract(clientId, contractType),
    onSuccess: (_, contractType) => {
      queryClient.invalidateQueries({ queryKey: ["clientContracts", clientId] });
      queryClient.invalidateQueries({ queryKey: ["clientsData", clientId] });
      toast.success(`Contract deleted successfully!`);
    },
    onError: (error) => {
      console.error("Failed to delete contract:", error);
      toast.error("Failed to delete contract. Please try again.");
    }
  });

  const renewContractMutation = useMutation({
    mutationFn: ({ contractType, notes }: { contractType: string; notes?: string }) => 
      renewContract(clientId, contractType, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientContracts", clientId] });
      queryClient.invalidateQueries({ queryKey: ["clientsData", clientId] });
      toast.success("Contract renewed successfully!");
    },
    onError: (error) => {
      console.error("Failed to renew contract:", error);
      toast.error("Failed to renew contract. Please try again.");
    }
  });

  return {
    contractsQuery,
    addContractMutation,
    updateContractMutation,
    deleteContractMutation,
    renewContractMutation,
  };
};
