"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  ShieldAlert,
  FileSignature,
  Building2,
  ChevronRight,
  RefreshCw,
  Lock,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  const canModifyClients =
    isAdmin ||
    hasPermission("clients", "create") ||
    hasPermission("clients", "edit");

  const { data: client, isLoading, isError, refetch } = useClientById(id);

  // Error State
  if (isError) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center p-6 bg-background">
        <div className="mx-auto max-w-md w-full rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center shadow-lg backdrop-blur-sm">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-8 ring-destructive/5">
            <AlertCircle className="size-7" />
          </div>
          <h2 className="text-lg font-bold text-foreground">
            Unable to Load Contract Information
          </h2>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            We encountered an issue fetching details for this client. Please check your connection or try refreshing.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              Go Back
            </Button>
            <Button size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="size-3.5" />
              Retry Loading
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // Loading State
  if (isLoading || !client) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center p-6 bg-background">
        <div className="flex flex-col items-center gap-3 p-8 rounded-2xl border border-border/50 bg-card/60 shadow-sm backdrop-blur-sm">
          <div className="relative flex items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary" />
            <FileSignature className="size-4 text-primary absolute" />
          </div>
          <p className="text-xs font-semibold text-foreground tracking-wide">
            Loading Contract Details...
          </p>
          <p className="text-[11px] text-muted-foreground">
            Preparing client agreement summaries and pricing structures
          </p>
        </div>
      </main>
    );
  }

  // Unauthorized State
  if (!canViewClients) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center p-6 bg-background">
        <div className="mx-auto max-w-md w-full rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 text-center shadow-lg backdrop-blur-sm">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-8 ring-amber-500/5">
            <ShieldAlert className="size-7" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Access Restricted</h2>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            You do not have the required permissions to view contract details for this client. Contact your administrator if you require access.
          </p>
          <Button variant="outline" size="sm" className="mt-6" onClick={() => router.back()}>
            Return to Previous Page
          </Button>
        </div>
      </main>
    );
  }

  const clientInitial = client.name ? client.name.charAt(0).toUpperCase() : "C";

  return (
    <main className="flex min-h-screen flex-col bg-background/60">
      {/* Top Glassmorphism Navigation & Header Bar */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 px-4 py-2.5 backdrop-blur-md transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
          
          {/* Left Navigation & Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="size-8 rounded-lg border-border/80 bg-background shadow-xs hover:bg-muted transition-colors shrink-0"
              aria-label="Back to Clients"
              title="Back"
            >
              <ArrowLeft className="size-4" />
            </Button>

            {/* Breadcrumb Path */}
            <div className="flex items-center gap-1.5 min-w-0 text-xs">
              <button
                onClick={() => router.push("/clients")}
                className="text-muted-foreground hover:text-foreground font-medium transition-colors truncate hidden sm:inline"
              >
                Clients
              </button>
              <ChevronRight className="size-3 text-muted-foreground/50 shrink-0 hidden sm:inline" />
              <button
                onClick={() => router.push(`/clients/${id}`)}
                className="text-muted-foreground hover:text-foreground font-medium transition-colors truncate max-w-[140px] sm:max-w-[200px]"
              >
                {client.name}
              </button>
              <ChevronRight className="size-3 text-muted-foreground/50 shrink-0" />
              <div className="flex items-center gap-1.5 font-semibold text-foreground shrink-0">
                <FileSignature className="size-3.5 text-primary" />
                <span>Contracts</span>
              </div>
            </div>
          </div>

          {/* Right Action & Permission Meta */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Permission Badge */}
            <Badge
              variant="outline"
              className={`hidden sm:flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
                canModifyClients
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              {canModifyClients ? (
                <>
                  <Edit3 className="size-3" /> Full Edit Access
                </>
              ) : (
                <>
                  <Lock className="size-3" /> Read-only Mode
                </>
              )}
            </Badge>

            {/* Refresh Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              title="Refresh Data"
            >
              <RefreshCw className="size-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Header Banner Card */}
      <div className="border-b border-border/40 bg-gradient-to-b from-card/80 to-background/50 px-2 py-2">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            
            {/* Client Identity & Title */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex size-12 sm:size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 text-primary font-bold text-lg sm:text-xl border border-primary/20 shadow-sm shrink-0">
                {clientInitial}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
                    {client.name}
                  </h1>
                  {client.clientId && (
                    <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5">
                      {client.clientId}
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Building2 className="size-3 text-muted-foreground/70" />
                    Client Contract Management & Lifecycle Hub
                  </span>
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <section className="flex-1 p-2">
        <div className="mx-auto max-w-7xl">
          <ContractSection
            clientId={id}
            clientData={client}
            canModify={canModifyClients}
          />
        </div>
      </section>
    </main>
  );
}
