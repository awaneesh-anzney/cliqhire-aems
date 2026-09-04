"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ShieldCheck, 
  Mail, 
  Building2, 
  GitBranch, 
  Shield, 
  Network,
  Loader2
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { RolesSettingsTab } from "@/components/settings/tabs/RolesSettingsTab";
import { EmailSettingsTab } from "@/components/settings/tabs/EmailSettingsTab";
import { GeneralSettingsTab } from "@/components/settings/tabs/GeneralSettingsTab";
import { PipelineDefaultsTab } from "@/components/settings/tabs/PipelineDefaultsTab";
import { SecuritySettingsTab } from "@/components/settings/tabs/SecuritySettingsTab";
import { IntegrationsTab } from "@/components/settings/tabs/IntegrationsTab";

type TabKey = "roles" | "email" | "general" | "pipeline" | "security" | "integrations";

const VALID_TABS: TabKey[] = ["roles", "email", "general", "pipeline", "security", "integrations"];

const TAB_TITLES: Record<TabKey, string> = {
  roles: "Roles & Permissions",
  email: "Email & SMTP",
  general: "General & Org",
  pipeline: "Pipeline Defaults",
  security: "Security & Access",
  integrations: "Integrations & API",
};

function SettingsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialTab = (searchParams?.get("tab") as TabKey) || "roles";
  const [activeTab, setActiveTab] = useState<TabKey>(
    VALID_TABS.includes(initialTab) ? initialTab : "roles"
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Sync state if URL query param changes externally
  useEffect(() => {
    const tabParam = searchParams?.get("tab") as TabKey;
    if (tabParam && VALID_TABS.includes(tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams, activeTab]);

  const handleTabChange = (val: string) => {
    const newTab = val as TabKey;
    setActiveTab(newTab);
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("tab", newTab);
    router.replace(`/settings?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-background/50 p-3 sm:p-4 md:p-5">
      <div className="max-w-[1550px] mx-auto space-y-4">
        {/* Top Header */}
        <SettingsHeader 
          activeTab={activeTab} 
          activeTabTitle={TAB_TITLES[activeTab]}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Tab Navigation & Content */}
        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange} 
          className="space-y-4"
        >
          <div className="overflow-x-auto pb-1 -mx-1 px-1">
            <TabsList className="h-10 bg-muted/70 p-1 rounded-lg border inline-flex min-w-full sm:min-w-0 sm:w-auto">
              <TabsTrigger 
                value="roles" 
                className="h-8 px-3 text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md transition-all"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <span>Roles & Permissions</span>
              </TabsTrigger>

              <TabsTrigger 
                value="email" 
                className="h-8 px-3 text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md transition-all relative"
              >
                <Mail className="h-3.5 w-3.5 text-blue-500" />
                <span>Email Configuration</span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 ml-0.5 animate-pulse" />
              </TabsTrigger>

              <TabsTrigger 
                value="general" 
                className="h-8 px-3 text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md transition-all"
              >
                <Building2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>General & Org</span>
              </TabsTrigger>

              <TabsTrigger 
                value="pipeline" 
                className="h-8 px-3 text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md transition-all"
              >
                <GitBranch className="h-3.5 w-3.5 text-indigo-500" />
                <span>Pipeline Defaults</span>
              </TabsTrigger>

              <TabsTrigger 
                value="security" 
                className="h-8 px-3 text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md transition-all"
              >
                <Shield className="h-3.5 w-3.5 text-amber-500" />
                <span>Security & Access</span>
              </TabsTrigger>

              <TabsTrigger 
                value="integrations" 
                className="h-8 px-3 text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md transition-all"
              >
                <Network className="h-3.5 w-3.5 text-violet-500" />
                <span>Integrations</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Roles & Permissions Tab */}
          <TabsContent value="roles" className="m-0 focus-visible:outline-none">
            <RolesSettingsTab searchQuery={searchQuery} />
          </TabsContent>

          {/* Email Configuration Tab */}
          <TabsContent value="email" className="m-0 focus-visible:outline-none">
            <EmailSettingsTab searchQuery={searchQuery} />
          </TabsContent>

          {/* General Settings Tab */}
          <TabsContent value="general" className="m-0 focus-visible:outline-none">
            <GeneralSettingsTab searchQuery={searchQuery} />
          </TabsContent>

          {/* Pipeline Defaults Tab */}
          <TabsContent value="pipeline" className="m-0 focus-visible:outline-none">
            <PipelineDefaultsTab searchQuery={searchQuery} />
          </TabsContent>

          {/* Security & Access Tab */}
          <TabsContent value="security" className="m-0 focus-visible:outline-none">
            <SecuritySettingsTab searchQuery={searchQuery} />
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="m-0 focus-visible:outline-none">
            <IntegrationsTab searchQuery={searchQuery} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex h-96 w-full items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Loading system settings...
          </div>
        </div>
      }
    >
      <SettingsPageContent />
    </Suspense>
  );
}
