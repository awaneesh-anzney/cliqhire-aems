"use client";

import React, { useState, useMemo } from "react";
import {
  Building2,
  UserCheck,
  Users,
  Search,
  Check,
  X,
  ChevronDown,
  Mail,
  Briefcase,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  EmailContactItem,
  EmailContactType,
  EMAIL_TYPE_CONFIG,
} from "@/types/emailContactTypes";
import { useEmailRecipients } from "@/hooks/useEmailRecipients";

interface EmailAddressSelectorProps {
  initialType?: EmailContactType;
  selectedEmail?: string | null;
  onSelect: (email: string, contact: EmailContactItem) => void;
  onClear?: () => void;
  trigger?: React.ReactNode;
  align?: "start" | "center" | "end";
  allowTypeSwitch?: boolean;
  title?: string;
  placeholder?: string;
}

export const EmailAddressSelector: React.FC<EmailAddressSelectorProps> = ({
  initialType = "client",
  selectedEmail = null,
  onSelect,
  onClear,
  trigger,
  align = "start",
  allowTypeSwitch = true,
  title,
  placeholder,
}) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<EmailContactType>(initialType);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Sync initial type whenever it changes externally
  React.useEffect(() => {
    if (initialType) {
      setActiveTab(initialType);
    }
  }, [initialType]);

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: contacts, isLoading } = useEmailRecipients(activeTab, debouncedSearchQuery);
  const filteredContacts = contacts || [];

  const handleSelectContact = (contact: EmailContactItem) => {
    onSelect(contact.email, contact);
    setOpen(false);
    setSearchQuery("");
    setDebouncedSearchQuery("");
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const activeContact = useMemo(() => {
    if (!selectedEmail) return null;
    const found = filteredContacts.find(
      (c) => c.email.toLowerCase() === selectedEmail.toLowerCase()
    );
    if (found) return found;
    return {
      id: "selected",
      name: selectedEmail.split("@")[0],
      email: selectedEmail,
      type: activeTab,
      roleOrCompany: "Selected Contact",
      status: "Active",
    } as EmailContactItem;
  }, [selectedEmail, filteredContacts, activeTab]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-2 text-xs font-medium border-border/70 rounded-xl bg-card hover:bg-muted/40 transition-all shadow-2xs group"
          >
            <Mail className="h-3.5 w-3.5 text-primary" />
            <span className="truncate max-w-[150px]">
              {selectedEmail || placeholder || "Select Email Address"}
            </span>
            <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-transform" />
          </Button>
        )}
      </PopoverTrigger>

      <PopoverContent
        align={align}
        className="w-[340px] sm:w-[380px] p-0 rounded-2xl border-border/70 shadow-xl overflow-hidden bg-card/95 backdrop-blur-md"
      >
        {/* Header Title & Active Selection */}
        <div className="p-3 border-b border-border/60 bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Mail className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-foreground truncate">
                {title || "Select Email Address"}
              </h4>
              <p className="text-[10px] text-muted-foreground truncate">
                {EMAIL_TYPE_CONFIG[activeTab].description}
              </p>
            </div>
          </div>

          {selectedEmail && onClear && (
            <button
              type="button"
              onClick={() => {
                onClear();
                setOpen(false);
              }}
              className="text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-muted transition-colors"
              title="Clear selected email"
            >
              <X className="h-3 w-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Stakeholder Category Tabs */}
        {allowTypeSwitch && (
          <div className="p-2 border-b border-border/50 bg-card">
            <Tabs
              value={activeTab}
              onValueChange={(val) => setActiveTab(val as EmailContactType)}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 h-8 p-0.5 bg-muted/50 rounded-xl">
                <TabsTrigger
                  value="client"
                  className="text-[11px] font-semibold gap-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xs"
                >
                  <Building2 className="h-3 w-3" />
                  <span>Client</span>
                </TabsTrigger>
                <TabsTrigger
                  value="candidate"
                  className="text-[11px] font-semibold gap-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xs"
                >
                  <UserCheck className="h-3 w-3" />
                  <span>Candidate</span>
                </TabsTrigger>
                <TabsTrigger
                  value="team"
                  className="text-[11px] font-semibold gap-1.5 rounded-lg data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xs"
                >
                  <Users className="h-3 w-3" />
                  <span>Team</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}

        {/* Search Input */}
        <div className="p-2 border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/70 pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${EMAIL_TYPE_CONFIG[activeTab].singularLabel.toLowerCase()} emails, names...`}
              className="pl-8 pr-7 h-8 text-xs bg-muted/30 border-border/60 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/40 placeholder:text-muted-foreground/60"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Contacts Email List */}
        <div className="max-h-64 overflow-y-auto p-1.5 space-y-1">
          {isLoading ? (
            <div className="p-6 text-center text-muted-foreground">
              <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs font-semibold text-foreground">Loading contacts...</p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Mail className="h-6 w-6 text-muted-foreground/40 mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-foreground">
                No {EMAIL_TYPE_CONFIG[activeTab].singularLabel.toLowerCase()} contacts found
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Try searching with a different name or email address
              </p>
            </div>
          ) : (
            filteredContacts.map((contact) => {
              const isSelected =
                selectedEmail?.toLowerCase() === contact.email.toLowerCase();

              return (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => handleSelectContact(contact)}
                  className={`w-full text-left p-2 rounded-xl flex items-center justify-between gap-2.5 transition-all group ${
                    isSelected
                      ? "bg-primary/10 text-foreground border border-primary/20 shadow-2xs"
                      : "hover:bg-muted/50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`h-8 w-8 rounded-xl shrink-0 flex items-center justify-center text-[11px] font-bold ${
                        contact.avatarColor || "bg-primary/20 text-primary"
                      } shadow-2xs`}
                    >
                      {getInitials(contact.name)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-foreground truncate">
                          {contact.name}
                        </span>
                        {contact.status && (
                          <span className="text-[9px] px-1 py-0.2 rounded-md bg-muted/70 text-muted-foreground truncate font-medium">
                            {contact.status}
                          </span>
                        )}
                      </div>

                      <p
                        className="text-[11px] text-primary/90 font-mono truncate"
                        title={contact.email}
                      >
                        {contact.email}
                      </p>

                      <p className="text-[10px] text-muted-foreground truncate">
                        {contact.roleOrCompany}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0 shadow-xs">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className="p-2 border-t border-border/50 bg-muted/15 flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Click any contact to select email address</span>
          <span className="font-semibold text-foreground/80">
            {filteredContacts.length} {EMAIL_TYPE_CONFIG[activeTab].singularLabel}s
          </span>
        </div>
      </PopoverContent>
    </Popover>
  );
};
