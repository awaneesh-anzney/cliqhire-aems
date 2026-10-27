
import { useMutation } from "@tanstack/react-query";
import { exportService, ExportClientsParams } from "@/services/exportService";
import { toast } from "sonner";

export const useExportClients = () => {
    return useMutation({
        mutationFn: (params?: ExportClientsParams) => exportService.exportClients(params),
        onSuccess: () => {
            toast.success("Client data export prepared");
        },
        onError: (error) => {
            console.error("Export failed:", error);
            toast.error("Failed to export clients");
        },
    });
};
