"use client";

import React, { useState } from "react";
import { 
  Network, 
  Calendar, 
  Cloud, 
  Share2, 
  Code, 
  CheckCircle2, 
  ExternalLink, 
  Plus, 
  Key, 
  Copy, 
  Check, 
  RefreshCw,
  Power
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface IntegrationsTabProps {
  searchQuery?: string;
}

interface IntegrationItem {
  id: string;
  name: string;
  category: "Calendar" | "Storage" | "Job Boards" | "API";
  description: string;
  connected: boolean;
  iconBg: string;
  badge?: string;
}

const INITIAL_INTEGRATIONS: IntegrationItem[] = [
  {
    id: "google-calendar",
    name: "Google Calendar & Meet",
    category: "Calendar",
    description: "Sync interview events, detect interviewer conflicts, and generate Google Meet rooms automatically.",
    connected: true,
    iconBg: "bg-blue-500/10 text-blue-600",
  },
  {
    id: "outlook-calendar",
    name: "Microsoft Outlook 365",
    category: "Calendar",
    description: "Integrate with Microsoft Exchange calendars and automatically embed Microsoft Teams links.",
    connected: false,
    iconBg: "bg-sky-500/10 text-sky-600",
  },
  {
    id: "aws-s3",
    name: "Amazon S3 Resume Storage",
    category: "Storage",
    description: "Store candidate resumes, portfolios, and offer letters securely in your private cloud bucket.",
    connected: true,
    iconBg: "bg-amber-500/10 text-amber-600",
  },
  {
    id: "linkedin",
    name: "LinkedIn Job Sync",
    category: "Job Boards",
    description: "One-click publish open job requisitions to LinkedIn Recruiter and sync applicant profiles.",
    connected: true,
    iconBg: "bg-blue-600/10 text-blue-700",
  },
  {
    id: "indeed",
    name: "Indeed Job Feed",
    category: "Job Boards",
    description: "Generate structured XML feeds to publish requisitions to Indeed organic job listings.",
    connected: false,
    iconBg: "bg-indigo-500/10 text-indigo-600",
  },
  {
    id: "slack",
    name: "Slack Notifications",
    category: "API",
    description: "Post real-time hiring updates, new applications, and interview feedback alerts to team channels.",
    connected: false,
    iconBg: "bg-purple-500/10 text-purple-600",
    badge: "Popular",
  },
];

export const IntegrationsTab: React.FC<IntegrationsTabProps> = ({ searchQuery = "" }) => {
  const [integrations, setIntegrations] = useState<IntegrationItem[]>(INITIAL_INTEGRATIONS);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState("cqh_live_89f023e1b7c891458dfa");
  const [copiedKey, setCopiedKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("https://api.yourcompany.com/webhooks/cliqhire");

  const toggleConnection = (id: string) => {
    setIntegrations(prev => prev.map(item => {
      if (item.id === id) {
        const nextState = !item.connected;
        toast.success(`${item.name} ${nextState ? "connected" : "disconnected"} successfully.`);
        return { ...item, connected: nextState };
      }
      return item;
    }));
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    toast.success("API key copied to clipboard");
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRollKey = () => {
    const newKey = "cqh_live_" + Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
    setApiKey(newKey);
    toast.success("Rotated production API key. Be sure to update your external integrations.");
  };

  const handleTestWebhook = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 800)),
      {
        loading: "Dispatching ping event to webhook...",
        success: "Webhook responded with HTTP 200 OK!",
        error: "Failed to ping webhook",
      }
    );
  };

  const filteredIntegrations = integrations.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border rounded-lg p-3 sm:p-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Integrations & API Ecosystem</h2>
            <Badge variant="outline" className="text-xs bg-muted/60">Connected Services</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Connect your recruitment pipelines to calendars, external job boards, cloud storage, and automated webhooks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setApiKeyModalOpen(true)} 
            className="h-8 gap-1.5 text-xs"
          >
            <Key className="h-3.5 w-3.5" />
            Manage API Key
          </Button>
        </div>
      </div>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredIntegrations.map((item) => (
          <div 
            key={item.id} 
            className="bg-card border rounded-lg p-3.5 shadow-sm flex flex-col justify-between hover:border-primary/40 transition-colors"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${item.iconBg}`}>
                    {item.category === "Calendar" && <Calendar className="h-4 w-4" />}
                    {item.category === "Storage" && <Cloud className="h-4 w-4" />}
                    {item.category === "Job Boards" && <Share2 className="h-4 w-4" />}
                    {item.category === "API" && <Code className="h-4 w-4" />}
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-foreground">{item.name}</h3>
                    <span className="text-[10px] text-muted-foreground">{item.category}</span>
                  </div>
                </div>

                {item.badge && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary">
                    {item.badge}
                  </Badge>
                )}
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2">
                {item.description}
              </p>
            </div>

            <div className="pt-3 border-t mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${item.connected ? "bg-emerald-500" : "bg-muted-foreground/30"}`} />
                <span className="text-[11px] font-medium text-muted-foreground">
                  {item.connected ? "Connected" : "Not connected"}
                </span>
              </div>

              <Button
                variant={item.connected ? "outline" : "default"}
                size="sm"
                onClick={() => toggleConnection(item.id)}
                className={`h-7 px-2.5 text-xs gap-1 ${
                  item.connected 
                    ? "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30" 
                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
                }`}
              >
                <Power className="h-3 w-3" />
                {item.connected ? "Disconnect" : "Connect"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Webhook & Developer Section */}
      <div className="bg-card border rounded-lg p-4 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Webhooks & Outbound Events</h3>
          </div>
          <Badge variant="outline" className="text-[11px] bg-muted/40">Event-Driven</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Receive HTTPS POST payloads whenever key pipeline actions happen (candidate hired, interview scheduled, scorecard completed).
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
          <div className="w-full">
            <Input 
              value={webhookUrl} 
              onChange={(e) => setWebhookUrl(e.target.value)} 
              placeholder="https://your-domain.com/webhook" 
              className="h-8 text-xs font-mono"
            />
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleTestWebhook} 
            className="h-8 text-xs shrink-0 gap-1.5"
          >
            <RefreshCw className="h-3 w-3" />
            Test Webhook Ping
          </Button>
          <Button 
            size="sm" 
            onClick={() => toast.success("Saved webhook subscription endpoint.")} 
            className="h-8 text-xs shrink-0 bg-primary text-primary-foreground"
          >
            Save Endpoint
          </Button>
        </div>
      </div>

      {/* API Key Modal */}
      <Dialog open={apiKeyModalOpen} onOpenChange={setApiKeyModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Key className="h-4 w-4 text-primary" />
              API Access Credentials
            </DialogTitle>
            <DialogDescription className="text-xs">
              Use this secret key to authenticate direct REST API calls to the CliqHire Recruitment Engine.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Production API Token</Label>
              <div className="flex items-center gap-2">
                <Input 
                  readOnly 
                  value={apiKey} 
                  type="password"
                  className="font-mono text-xs h-8 bg-muted/30 select-all" 
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCopyKey} 
                  className="h-8 px-2.5 shrink-0 gap-1 text-xs"
                >
                  {copiedKey ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedKey ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>

            <div className="p-2.5 rounded-md bg-amber-500/10 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300">
              Keep this key private. Anyone with this key has programmatic read/write access to your candidates and job requisitions.
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRollKey} 
              className="h-8 text-xs text-destructive hover:bg-destructive/10 border-destructive/30"
            >
              Rotate Key
            </Button>
            <Button 
              size="sm" 
              onClick={() => setApiKeyModalOpen(false)} 
              className="h-8 text-xs"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
