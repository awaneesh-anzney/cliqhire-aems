"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Building2,
  UserCheck,
  Users,
  Search,
  Check,
  X,
  ChevronDown,
  Mail,
  Building,
  User,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  EmailContactItem,
  EmailContactType,
  EMAIL_TYPE_CONFIG,
} from "@/types/emailContactTypes";
import { useEmailRecipients } from "@/hooks/useEmailRecipients";
import { useInView } from "react-intersection-observer";

interface ClientGroup {
  _id: string;
  name: string;
  emails?: string[];
  primaryContacts?: Array<{
    _id: string;
    name: string;
    email: string;
    designation?: string;
  }>;
}

interface EmailAddressSelectorProps {
  initialType?: EmailContactType;
  selectedEmail?: string | null;
  onSelect: (email: string, contact?: Partial<EmailContactItem>) => void;
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

  const { ref: loadMoreRef, inView } = useInView({
    rootMargin: "40px",
  });

  React.useEffect(() => {
    if (initialType) {
      setActiveTab(initialType);
    }
  }, [initialType]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useEmailRecipients(activeTab, debouncedSearchQuery, { rawClients: true });

  const items = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.contacts || []);
  }, [data?.pages]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSelect = (email: string, name?: string) => {
    onSelect(email, name ? { name, email, type: activeTab, roleOrCompany: "", id: "" } : undefined);
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

  const renderClientGroup = (client: ClientGroup) => {
    return (
      <div key={client._id} className="mb-3 last:mb-0 border border-border/40 rounded-xl overflow-hidden bg-card/60 shadow-sm transition-all hover:border-border/80 hover:shadow-md animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-muted/40 px-3 py-2 flex items-center gap-2 border-b border-border/40 backdrop-blur-sm">
          <div className="h-6 w-6 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-sm">
            <Building className="h-3.5 w-3.5" />
          </div>
          <span className="text-[13px] font-bold text-foreground truncate">{client.name}</span>
        </div>
        
        <div className="flex flex-col p-1.5 space-y-1">
          {client.emails?.map((email) => (
            <button
              key={email}
              type="button"
              onClick={() => handleSelect(email, client.name)}
              className="w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all hover:bg-muted/80 hover:scale-[1.01] group border border-transparent hover:border-border/50"
            >
              <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 transition-colors shrink-0 shadow-sm">
                <Mail className="h-3.5 w-3.5 text-muted-foreground group-hover:text-blue-600 transition-colors" />
              </div>
              <div className="min-w-0">
                <span className="text-[12px] font-medium text-foreground truncate block">{email}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block">Company Email</span>
              </div>
            </button>
          ))}

          {client.primaryContacts?.map((contact) => (
            <button
              key={contact._id}
              type="button"
              onClick={() => handleSelect(contact.email, contact.name)}
              className="w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all hover:bg-muted/80 hover:scale-[1.01] group border border-transparent hover:border-border/50"
            >
              <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 group-hover:text-emerald-600 transition-colors shrink-0 shadow-sm">
                <User className="h-3.5 w-3.5 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] font-semibold text-foreground truncate">{contact.name}</span>
                  {contact.designation && <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-medium px-1.5 py-0.5 bg-emerald-500/10 rounded-full truncate">{contact.designation}</span>}
                </div>
                <span className="text-[11px] text-primary/80 font-mono truncate block mt-0.5">{contact.email}</span>
              </div>
            </button>
          ))}
          
          {(!client.emails || client.emails.length === 0) && (!client.primaryContacts || client.primaryContacts.length === 0) && (
            <div className="px-3 py-3 text-[11px] text-muted-foreground italic text-center">No contact info available</div>
          )}
        </div>
      </div>
    );
  };

  const renderContact = (contact: EmailContactItem) => {
    const isSelected = selectedEmail?.toLowerCase() === contact.email?.toLowerCase();
    
    return (
      <button
        key={contact.id}
        type="button"
        onClick={() => handleSelect(contact.email, contact.name)}
        className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between gap-3 transition-all group mb-1.5 animate-in fade-in zoom-in-95 duration-200 ${
          isSelected
            ? "bg-primary/10 text-foreground border border-primary/20 shadow-md ring-1 ring-primary/20"
            : "hover:bg-muted/80 border border-transparent hover:border-border/50 hover:shadow-sm"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`h-9 w-9 rounded-xl shrink-0 flex items-center justify-center text-[12px] font-bold ${
              contact.avatarColor || "bg-primary/10 text-primary border border-primary/20"
            } shadow-sm transition-all group-hover:scale-105`}
          >
            {getInitials(contact.name)}
          </div>

          <div className="min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-foreground truncate">
                {contact.name}
              </span>
              {contact.status && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted/80 border border-border/50 text-muted-foreground truncate font-semibold uppercase tracking-wider">
                  {contact.status}
                </span>
              )}
            </div>

            <p
              className="text-[11.5px] text-primary/90 font-mono truncate mt-0.5"
              title={contact.email}
            >
              {contact.email}
            </p>

            <p className="text-[10px] text-muted-foreground font-medium truncate mt-0.5">
              {contact.roleOrCompany}
            </p>
          </div>
        </div>

        {isSelected && (
          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0 shadow-md">
            <Check className="h-3.5 w-3.5" />
          </div>
        )}
      </button>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-2 text-xs font-medium border-border/70 rounded-xl bg-card hover:bg-muted/40 transition-all shadow-sm group"
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
        className="w-[360px] sm:w-[400px] p-0 rounded-2xl border-border/60 shadow-2xl overflow-hidden bg-card/95 backdrop-blur-xl"
      >
        <div className="p-3 border-b border-border/40 bg-muted/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
              <Mail className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[13px] font-bold text-foreground truncate">
                {title || "Select Email Address"}
              </h4>
              <p className="text-[10px] text-muted-foreground truncate font-medium">
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
              className="text-[10px] text-muted-foreground font-semibold hover:text-destructive flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-destructive/10 transition-colors"
              title="Clear selected email"
            >
              <X className="h-3 w-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {allowTypeSwitch && (
          <div className="p-2 border-b border-border/40 bg-card/50">
            <Tabs
              value={activeTab}
              onValueChange={(val) => {
                setActiveTab(val as EmailContactType);
                setSearchQuery("");
              }}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 h-9 p-1 bg-muted/60 rounded-xl">
                <TabsTrigger
                  value="client"
                  className="text-[11px] font-bold gap-1.5 rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                >
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Client</span>
                </TabsTrigger>
                <TabsTrigger
                  value="candidate"
                  className="text-[11px] font-bold gap-1.5 rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>Candidate</span>
                </TabsTrigger>
                <TabsTrigger
                  value="team"
                  className="text-[11px] font-bold gap-1.5 rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Team</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}

        <div className="p-2 border-b border-border/40 bg-muted/10">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/70 group-focus-within:text-primary transition-colors" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${EMAIL_TYPE_CONFIG[activeTab].singularLabel.toLowerCase()} emails, names...`}
              className="pl-9 pr-8 h-9 text-[12px] font-medium bg-background border-border/50 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/40 placeholder:text-muted-foreground/50 transition-all shadow-sm"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 bg-muted rounded-full hover:bg-muted-foreground/20 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        <div className="max-h-[320px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {isLoading && !items.length ? (
            <div className="p-8 text-center text-muted-foreground">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-[12px] font-bold text-foreground">Loading contacts...</p>
              <p className="text-[10px] mt-1 text-muted-foreground">Please wait a moment</p>
            </div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground animate-in fade-in duration-300">
              <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                <Mail className="h-5 w-5 text-muted-foreground/50" />
              </div>
              <p className="text-[13px] font-bold text-foreground">
                No {EMAIL_TYPE_CONFIG[activeTab].singularLabel.toLowerCase()}s found
              </p>
              <p className="text-[11px] text-muted-foreground mt-1 px-4">
                Try searching with a different name or email address
              </p>
            </div>
          ) : (
            <>
              {items.map((item: any, idx) => {
                if (activeTab === "client") {
                  return renderClientGroup(item as ClientGroup);
                } else {
                  return renderContact(item as EmailContactItem);
                }
              })}
              
              {hasNextPage && (
                <div ref={loadMoreRef} className="py-4 flex justify-center items-center">
                  {isFetchingNextPage ? (
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-semibold bg-muted/30 px-3 py-1.5 rounded-full">
                      <div className="h-3.5 w-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Loading more...
                    </div>
                  ) : (
                    <div className="h-4 w-full" />
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-2.5 border-t border-border/40 bg-muted/30 flex items-center justify-between text-[10px] text-muted-foreground backdrop-blur-sm">
          <span className="font-medium">Scroll down to load more</span>
          <span className="font-bold text-foreground/80 bg-background/50 px-2 py-0.5 rounded-md border border-border/50">
            {items.length} loaded
          </span>
        </div>
      </PopoverContent>
    </Popover>
  );
};
