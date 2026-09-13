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

const TAB_CONFIG: Record<TabKey, { title: string; icon: React.ElementType; badge?: string }> = {
  roles: { title: "Roles & Permissions", icon: ShieldCheck },
  email: { title: "Email & SMTP", icon: Mail, badge: "SMTP" },
  general: { title: "General & Org", icon: Building2 },
  pipeline: { title: "Pipeline Defaults", icon: GitBranch },
  security: { title: "Security & Access", icon: Shield },
  integrations: { title: "Integrations & API", icon: Network },
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
    <div className="h-full min-h-0 w-full flex flex-col p-2.5 sm:p-3 md:p-3.5 gap-2 sm:gap-2.5 overflow-hidden bg-transparent">
      {/* Top Application Header */}
      <SettingsHeader 
        activeTab={activeTab} 
        activeTabTitle={TAB_CONFIG[activeTab]?.title}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Tabbed Layout Container */}
      <Tabs 
        value={activeTab} 
        onValueChange={handleTabChange} 
        className="flex-1 min-h-0 flex flex-col overflow-hidden gap-2 sm:gap-2.5"
      >
        {/* Sleek Segmented Tab Navigation Bar */}
        <div className="shrink-0 flex items-center justify-between gap-2 overflow-x-auto pb-0.5 custom-scrollbar">
          <TabsList className="h-9 bg-card p-1 rounded-xl border border-border/80 shadow-2xs inline-flex min-w-full sm:min-w-0 sm:w-auto">
            {VALID_TABS.map((tabKey) => {
              const item = TAB_CONFIG[tabKey];
              const Icon = item.icon;
              return (
                <TabsTrigger
                  key={tabKey}
                  value={tabKey}
                  className="h-7 px-2.5 sm:px-3 text-xs gap-1.5 font-medium rounded-lg transition-all duration-150 data-[state=active]:bg-brand data-[state=active]:text-white data-[state=active]:shadow-xs text-muted-foreground hover:text-foreground whitespace-nowrap"
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.title}</span>
                  {item.badge && (
                    <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-brand/10 data-[state=active]:bg-white/20 ml-0.5">
                      {item.badge}
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* Primary Scrollable Tab Viewport */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1 pb-4 custom-scrollbar">
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
        </div>
      </Tabs>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex h-full w-full items-center justify-center bg-transparent">
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground font-medium p-3.5 rounded-xl bg-card border border-border/80 shadow-xs">
            <Loader2 className="h-4 w-4 animate-spin text-brand" />
            <span>Loading system settings...</span>
          </div>
        </div>
      }
    >
      <SettingsPageContent />
    </Suspense>
  );
}
