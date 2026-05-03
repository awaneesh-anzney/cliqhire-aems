"use client";
import React from "react";
import { ArrowLeft, Loader, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ContractSection } from "@/components/clients/contract/contract-section";
import { useClientById } from "@/hooks/useClient";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/contexts/PermissionContext";

interface PageProps {
  params: { id: string };
}

export default function ClientContractPage({ params }: PageProps) {
  const { id } = params;
  const router = useRouter();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();

  const isAdmin = user?.role === "ADMIN";
  const canViewClients = isAdmin || hasPermission("clients", "view");
  const canModifyClients = isAdmin || hasPermission("clients", "create") || hasPermission("clients", "edit");

  const { data: client, isLoading, isError } = useClientById(id);

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center justify-center">
          <TriangleAlert className="size-4" />
          <div className="text-gray-600">Something went wrong! Please try again later</div>
        </div>
      </div>
    );
  }

  if (isLoading || !client) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center flex-col justify-center">
          <Loader className="size-6 animate-spin" />
          <p className="text-gray-600">Loading client data...</p>
        </div>
      </div>
    );
  }

  if (!canViewClients) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center text-muted-foreground">
          You do not have permission to view this client.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/30">
      <div className="border-b bg-white py-4 px-6 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-slate-100">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Contract Details</h1>
            <p className="text-sm text-slate-500">{client.name}</p>
          </div>
        </div>
      </div>
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <ContractSection clientId={id} clientData={client} canModify={canModifyClients} />
      </div>
    </div>
  );
}
