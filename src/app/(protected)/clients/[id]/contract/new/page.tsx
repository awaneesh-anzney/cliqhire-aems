"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  ShieldAlert,
  FilePlus,
  Save,
  ChevronRight,
  CheckCircle2,
  Users,
  Briefcase,
  ShieldCheck,
  Code2,
  UserCheck,
  Building2,
  Building,
  Check,
  Sparkles,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useClientById } from "@/hooks/useClient";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/contexts/PermissionContext";
import { useClientContracts } from "@/hooks/useClientContracts";
import { ClientContractInfo } from "@/components/create-client-modal/type";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import BusinessForm from "@/components/contract-forms/business-form";
import ConsultingForm from "@/components/contract-forms/consulting-form";
import OutsourcingForm from "@/components/contract-forms/outsourcing-form";
import {
  businessInitialState,
  consultingInitialState,
  outsourcingInitialState,
} from "@/components/create-client-modal/constants";

interface PageProps {
  params: { id: string };
}

const CONTRACT_MAPPING: Record<string, string> = {
  Recruitment: "businessContractRQT",
  "HR Managed Services": "businessContractHMS",
  "IT & Technology": "businessContractIT",
  "Mgt Consulting": "consultingContractMGTC",
  "HR Consulting": "consultingContractHRC",
  Outsourcing: "outsourcingContract",
};

const BUSINESS_OPTIONS = [
  {
    name: "Recruitment",
    category: "Talent Acquisition",
    icon: Users,
    description: "Standard & executive placement contract terms",
    bgColor: "bg-blue-500/10",
    color: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-500/30",
  },
  {
    name: "HR Managed Services",
    category: "Managed HR",
    icon: ShieldCheck,
    description: "End-to-end HR management & operation services",
    bgColor: "bg-indigo-500/10",
    color: "text-indigo-600 dark:text-indigo-400",
    borderColor: "border-indigo-500/30",
  },
  {
    name: "IT & Technology",
    category: "Tech Hiring",
    icon: Code2,
    description: "Specialized tech recruitment & IT staff terms",
    bgColor: "bg-purple-500/10",
    color: "text-purple-600 dark:text-purple-400",
    borderColor: "border-purple-500/30",
  },
  {
    name: "Mgt Consulting",
    category: "Advisory",
    icon: Briefcase,
    description: "Strategic management consulting & project scope",
    bgColor: "bg-emerald-500/10",
    color: "text-emerald-600 dark:text-emerald-400",
    borderColor: "border-emerald-500/30",
  },
  {
    name: "HR Consulting",
    category: "Advisory",
    icon: UserCheck,
    description: "Human resources advisory, scope & proposal terms",
    bgColor: "bg-teal-500/10",
    color: "text-teal-600 dark:text-teal-400",
    borderColor: "border-teal-500/30",
  },
  {
    name: "Outsourcing",
    category: "Staffing",
    icon: Building2,
    description: "Resource allocation, SLA guarantees & outsourcing costs",
    bgColor: "bg-amber-500/10",
    color: "text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-500/30",
  },
];

export default function NewContractPage({ params }: PageProps) {
  const { id } = params;
  const router = useRouter();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();

  const isAdmin = user?.role === "ADMIN";
  const canModifyClients =
    isAdmin ||
    hasPermission("clients", "create") ||
    hasPermission("clients", "edit");

  const { data: client, isLoading, isError } = useClientById(id);
  const { addContractMutation } = useClientContracts(id);
  const isAddingContract = addContractMutation.isPending;

  const [addContractFormData, setAddContractFormData] =
    useState<ClientContractInfo>({
      lineOfBusiness: [],
      contractForms: {},
    });

  const handleBusinessCheckChange = (business: string, checked: boolean) => {
    setAddContractFormData((prev) => {
      const currentLob = prev.lineOfBusiness || [];
      if (checked) {
        let initialState: any = {};
        if (
          ["Recruitment", "HR Managed Services", "IT & Technology"].includes(
            business
          )
        ) {
          initialState = { ...businessInitialState };
        } else if (
          ["HR Consulting", "Mgt Consulting"].includes(business)
        ) {
          initialState = { ...consultingInitialState };
        } else if (business === "Outsourcing") {
          initialState = { ...outsourcingInitialState };
        }

        return {
          ...prev,
          lineOfBusiness: [...currentLob, business],
          contractForms: {
            ...prev.contractForms,
            [business]: initialState,
          },
        };
      } else {
        const newLob = currentLob.filter((b) => b !== business);
        const newForms = { ...prev.contractForms };
        delete newForms[business];
        return {
          ...prev,
          lineOfBusiness: newLob,
          contractForms: newForms,
        };
      }
    });
  };

  const createUpdateFormHandler = (business: string) => (updater: any) => {
    setAddContractFormData((prev) => {
      const currentData = prev.contractForms[business];
      const newData =
        typeof updater === "function" ? updater(currentData) : updater;
      return {
        ...prev,
        contractForms: {
          ...prev.contractForms,
          [business]: newData,
        },
      };
    });
  };

  const handleSubmitContract = async () => {
    if (!canModifyClients) return;

    const { lineOfBusiness, contractForms } = addContractFormData;

    if (!lineOfBusiness || lineOfBusiness.length === 0) {
      toast.error("Please select at least one line of business");
      return;
    }

    const unfilledLOBs = lineOfBusiness.filter((lob) => !contractForms[lob]);
    if (unfilledLOBs.length > 0) {
      toast.error(
        `Please fill out the contract parameters for: ${unfilledLOBs.join(
          ", "
        )}`
      );
      return;
    }

    try {
      const promises = lineOfBusiness.map(async (businessType: string) => {
        const contractData = contractForms[businessType];
        if (contractData) {
          const contractKey = CONTRACT_MAPPING[businessType];
          await addContractMutation.mutateAsync({
            contractType: contractKey,
            contractData,
          });
        }
      });

      await Promise.all(promises);
      toast.success("Contract configurations successfully saved!");
      router.push(`/clients/${id}/contract`);
    } catch (error) {
      console.error("Failed to add contract:", error);
      toast.error("Failed to add contract. Please try again.");
    }
  };

  // Error State
  if (isError) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center p-6 bg-background">
        <div className="mx-auto max-w-md w-full rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center shadow-lg backdrop-blur-sm">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-8 ring-destructive/5">
            <AlertCircle className="size-7" />
          </div>
          <h2 className="text-lg font-bold text-foreground">
            Unable to Load Client Data
          </h2>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            We encountered an issue fetching client information. Please try again later.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-6"
            onClick={() => router.back()}
          >
            Go Back
          </Button>
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
            <FilePlus className="size-4 text-primary absolute" />
          </div>
          <p className="text-xs font-semibold text-foreground tracking-wide">
            Loading Contract Configuration...
          </p>
        </div>
      </main>
    );
  }

  // Unauthorized State
  if (!canModifyClients) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center p-6 bg-background">
        <div className="mx-auto max-w-md w-full rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 text-center shadow-lg backdrop-blur-sm">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-8 ring-amber-500/5">
            <ShieldAlert className="size-7" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Access Restricted</h2>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            You do not have permission to configure contracts for this client.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-6"
            onClick={() => router.back()}
          >
            Return to Contracts
          </Button>
        </div>
      </main>
    );
  }

  const clientInitial = client.name ? client.name.charAt(0).toUpperCase() : "C";
  const selectedCount = addContractFormData.lineOfBusiness.length;

  return (
    <main className="flex min-h-screen flex-col bg-background/60">
      {/* Top Glassmorphism Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 px-4 py-2.5 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push(`/clients/${id}/contract`)}
              className="size-8 rounded-lg border-border/80 bg-background shadow-xs hover:bg-muted transition-colors shrink-0"
              title="Back to Contracts"
            >
              <ArrowLeft className="size-4" />
            </Button>

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
                className="text-muted-foreground hover:text-foreground font-medium transition-colors truncate max-w-[120px] sm:max-w-[180px]"
              >
                {client.name}
              </button>
              <ChevronRight className="size-3 text-muted-foreground/50 shrink-0" />
              <button
                onClick={() => router.push(`/clients/${id}/contract`)}
                className="text-muted-foreground hover:text-foreground font-medium transition-colors shrink-0"
              >
                Contracts
              </button>
              <ChevronRight className="size-3 text-muted-foreground/50 shrink-0" />
              <div className="flex items-center gap-1.5 font-semibold text-foreground shrink-0">
                <FilePlus className="size-3.5 text-primary" />
                <span>New Contract</span>
              </div>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/clients/${id}/contract`)}
              disabled={isAddingContract}
              className="h-8 text-xs rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitContract}
              disabled={isAddingContract || selectedCount === 0}
              className="h-8 text-xs rounded-xl bg-primary hover:bg-primary/90 text-white font-medium shadow-xs gap-1.5"
            >
              {isAddingContract ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-3.5" />
                  Save Contract
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Header Card */}
      <div className="border-b border-border/40 bg-gradient-to-b from-card/80 to-background/50 px-3 py-3">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-12 sm:size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 text-primary font-bold text-lg sm:text-xl border border-primary/20 shadow-sm shrink-0">
                {clientInitial}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
                    Create New Contract
                  </h1>
                  {client.clientId && (
                    <Badge
                      variant="secondary"
                      className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5"
                    >
                      {client.clientId}
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1">
                  <span>Client:</span>
                  <span className="font-semibold text-foreground">
                    {client.name}
                  </span>
                </p>
              </div>
            </div>

            {/* Selection Counter Pill */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              <Badge
                variant="outline"
                className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                  selectedCount > 0
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                <Layers className="size-3.5 mr-1.5 inline" />
                {selectedCount}{" "}
                {selectedCount === 1 ? "Service Line" : "Service Lines"}{" "}
                Selected
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <section className="flex-1 p-2 sm:p-4">
        <div className="mx-auto max-w-7xl space-y-6">
          
          {/* Step 1: Line of Business Selection */}
          <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-lg bg-primary text-white font-bold text-xs">
                    1
                  </span>
                  <h2 className="text-base font-bold text-foreground">
                    Select Lines of Business
                  </h2>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Choose one or multiple service lines to configure specific pricing and commercial parameters.
                </p>
              </div>
            </div>

            {/* Business Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {BUSINESS_OPTIONS.map((option) => {
                const isSelected =
                  addContractFormData.lineOfBusiness.includes(option.name);
                const Icon = option.icon;

                return (
                  <div
                    key={option.name}
                    onClick={() =>
                      handleBusinessCheckChange(option.name, !isSelected)
                    }
                    className={`group relative flex flex-col justify-between p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none ${
                      isSelected
                        ? `bg-gradient-to-br from-card via-card to-primary/5 ${option.borderColor} ring-2 ring-primary/20 shadow-xs`
                        : "bg-card border-border/80 hover:border-border hover:bg-muted/30"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div
                          className={`p-2.5 rounded-xl ${option.bgColor} ${option.color} transition-transform group-hover:scale-105`}
                        >
                          <Icon className="size-5" />
                        </div>
                        <div
                          className={`flex size-6 items-center justify-center rounded-lg border transition-all ${
                            isSelected
                              ? "bg-primary border-primary text-white"
                              : "border-border/80 bg-background text-transparent"
                          }`}
                        >
                          <Check className="size-3.5 stroke-[3]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-foreground">
                            {option.name}
                          </h3>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Contract Parameters Forms */}
          {selectedCount > 0 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                <span className="flex size-6 items-center justify-center rounded-lg bg-primary text-white font-bold text-xs">
                  2
                </span>
                <h2 className="text-base font-bold text-foreground">
                  Configure Service Terms & Financial Parameters
                </h2>
              </div>

              <div className="space-y-5">
                {addContractFormData.lineOfBusiness.map((business) => {
                  const optionCfg = BUSINESS_OPTIONS.find(
                    (o) => o.name === business
                  );
                  const ServiceIcon = optionCfg?.icon || FilePlus;

                  return (
                    <div
                      key={business}
                      className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden transition-all"
                    >
                      {/* Section Card Header */}
                      <div className="bg-muted/40 px-5 py-3.5 border-b border-border/60 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-xl ${
                              optionCfg?.bgColor || "bg-primary/10"
                            } ${optionCfg?.color || "text-primary"}`}
                          >
                            <ServiceIcon className="size-4" />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-foreground">
                              {business} Terms
                            </h3>
                            <p className="text-[11px] text-muted-foreground">
                              Configure contract dates, fees, and deliverables
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-semibold"
                        >
                          {optionCfg?.category || "Contract"}
                        </Badge>
                      </div>

                      {/* Form Body */}
                      <div className="p-4 sm:p-6">
                        {[
                          "Recruitment",
                          "HR Managed Services",
                          "IT & Technology",
                        ].includes(business) && (
                          <BusinessForm
                            formData={
                              addContractFormData.contractForms[business]
                            }
                            setFormData={createUpdateFormHandler(business)}
                          />
                        )}
                        {[
                          "HR Consulting",
                          "Mgt Consulting",
                        ].includes(business) && (
                          <ConsultingForm
                            businessType={business}
                            formData={
                              addContractFormData.contractForms[business]
                            }
                            setFormData={createUpdateFormHandler(business)}
                          />
                        )}
                        {business === "Outsourcing" && (
                          <OutsourcingForm
                            formData={
                              addContractFormData.contractForms[business]
                            }
                            setFormData={createUpdateFormHandler(business)}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Action Footer */}
          <div className="sticky bottom-3 z-20 rounded-2xl border border-border/80 bg-card/95 p-4 shadow-lg backdrop-blur-md flex items-center justify-between gap-4">
            <div className="text-xs text-muted-foreground hidden sm:block">
              {selectedCount === 0 ? (
                <span>Select at least one line of business to enable saving.</span>
              ) : (
                <span className="text-foreground font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  Ready to configure {selectedCount} service line(s).
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <Button
                variant="outline"
                onClick={() => router.push(`/clients/${id}/contract`)}
                disabled={isAddingContract}
                className="rounded-xl h-9 text-xs border-border/80 px-5"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitContract}
                disabled={isAddingContract || selectedCount === 0}
                className="rounded-xl h-9 text-xs bg-primary hover:bg-primary/90 text-white font-medium shadow-xs px-6 gap-2"
              >
                {isAddingContract ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Saving Configurations...
                  </>
                ) : (
                  <>
                    <Save className="size-3.5" />
                    Save Contract Configurations
                  </>
                )}
              </Button>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}

