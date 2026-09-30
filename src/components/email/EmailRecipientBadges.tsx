"use client";

import React, { useState } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Mail, 
  Users, 
  Calendar,
  ExternalLink,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

export interface ParsedContact {
  raw: string;
  name: string;
  email: string;
  initials: string;
}

const AVATAR_COLORS = [
  "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/50",
  "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/50",
  "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/50",
  "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-200/60 dark:border-teal-800/50",
  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/50",
  "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/50",
  "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/50",
];

export function getContactAvatarColor(identifier: string): string {
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function parseContactString(input?: string): ParsedContact | null {
  if (!input || !input.trim()) return null;
  const trimmed = input.trim();

  // Pattern: "Display Name <email@domain.com>" or Display Name <email@domain.com>
  const angleMatch = trimmed.match(/^(?:"?([^"]*)"?\s*)?<([^>]+)>$/);
  if (angleMatch) {
    const rawName = angleMatch[1]?.trim() || "";
    const email = angleMatch[2]?.trim() || "";
    const name = rawName || email.split("@")[0] || email;
    return {
      raw: trimmed,
      name,
      email,
      initials: getInitialsFromName(name),
    };
  }

  // Bare email address
  if (trimmed.includes("@")) {
    const localPart = trimmed.split("@")[0].replace(/[._-]/g, " ");
    const name = localPart.charAt(0).toUpperCase() + localPart.slice(1);
    return {
      raw: trimmed,
      name,
      email: trimmed,
      initials: getInitialsFromName(name),
    };
  }

  return {
    raw: trimmed,
    name: trimmed,
    email: trimmed,
    initials: getInitialsFromName(trimmed),
  };
}

export function normalizeContacts(contacts?: string | string[] | null): ParsedContact[] {
  if (!contacts) return [];
  const list: string[] = [];

  if (Array.isArray(contacts)) {
    contacts.forEach((item) => {
      if (typeof item === "string") {
        if (item.includes(",")) {
          item.split(",").forEach((sub) => {
            if (sub.trim()) list.push(sub.trim());
          });
        } else if (item.trim()) {
          list.push(item.trim());
        }
      }
    });
  } else if (typeof contacts === "string") {
    contacts.split(",").forEach((sub) => {
      if (sub.trim()) list.push(sub.trim());
    });
  }

  const results: ParsedContact[] = [];
  const seenEmails = new Set<string>();

  for (const raw of list) {
    const parsed = parseContactString(raw);
    if (parsed) {
      const key = parsed.email.toLowerCase();
      if (!seenEmails.has(key)) {
        seenEmails.add(key);
        results.push(parsed);
      }
    }
  }

  return results;
}

function getInitialsFromName(name: string): string {
  if (!name) return "EM";
  const clean = name.replace(/[<>"']/g, "").trim();
  const parts = clean.split(/[\s@._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

interface EmailRecipientBadgesProps {
  from: string;
  to?: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  date?: string;
  subject?: string;
  isSent?: boolean;
  status?: string;
  onComposeTo?: (email: string) => void;
  maxCollapsedChips?: number;
}

export const EmailRecipientBadges: React.FC<EmailRecipientBadgesProps> = ({
  from,
  to,
  cc,
  bcc,
  date,
  subject,
  isSent = false,
  status,
  onComposeTo,
  maxCollapsedChips = 3,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllToChips, setShowAllToChips] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const parsedFrom = parseContactString(from) || {
    raw: from,
    name: isSent ? "You" : from,
    email: from,
    initials: isSent ? "ME" : "FR",
  };

  const toList = normalizeContacts(to);
  const ccList = normalizeContacts(cc);
  const bccList = normalizeContacts(bcc);

  const totalRecipients = toList.length + ccList.length + bccList.length;

  const copyToClipboard = (text: string, label: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied ${label} to clipboard`);
    setTimeout(() => {
      setCopiedKey((curr) => (curr === key ? null : curr));
    }, 2000);
  };

  const copyAllRecipients = () => {
    const all = [...toList, ...ccList, ...bccList].map((c) => c.email).join(", ");
    copyToClipboard(all, "all recipient emails", "all-recipients");
  };

  const visibleToChips = showAllToChips ? toList : toList.slice(0, maxCollapsedChips);
  const hiddenToCount = Math.max(0, toList.length - maxCollapsedChips);

  return (
    <div className="w-full text-xs">
      <TooltipProvider delayDuration={200}>
        {/* Compact Bar / Recipient Summary Row */}
        <div className="flex items-center justify-between gap-2 flex-wrap min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0 flex-1">
            <span className="text-[11px] font-bold text-muted-foreground shrink-0 select-none">
              To:
            </span>

            {toList.length === 0 ? (
              <span className="text-[11px] text-muted-foreground/80 italic">
                Undisclosed recipients
              </span>
            ) : (
              visibleToChips.map((recipient, idx) => (
                <Tooltip key={idx}>
                  <TooltipTrigger asChild>
                    <span
                      onClick={() => onComposeTo?.(recipient.email)}
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[11px] font-medium transition-all ${
                        onComposeTo ? "cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/40" : ""
                      } bg-muted/40 border-border/70 text-foreground/90 max-w-[240px] truncate shadow-2xs`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      <span className="truncate">{recipient.name}</span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs space-y-0.5">
                    <p className="font-bold">{recipient.name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{recipient.email}</p>
                    {onComposeTo && <p className="text-[10px] text-blue-400 pt-1">Click to write an email</p>}
                  </TooltipContent>
                </Tooltip>
              ))
            )}

            {/* "+X more / View All" Interactive Badge */}
            {hiddenToCount > 0 && !showAllToChips && (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/25 hover:bg-blue-500/20 transition-all cursor-pointer shadow-2xs"
                    title={`Click to view all ${toList.length} recipients`}
                  >
                    <span>+{hiddenToCount} more</span>
                    <span className="opacity-75">• View All</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-80 p-3 rounded-2xl shadow-xl border-border/70 space-y-2.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-blue-600" />
                      <span className="text-xs font-bold text-foreground">
                        All Recipients ({toList.length})
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowAllToChips(true);
                      }}
                      className="h-6 px-1.5 text-[10px] text-blue-600 font-semibold"
                    >
                      Expand inline
                    </Button>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                    {toList.map((rec, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border/60 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar className="h-6 w-6 border border-border/50 text-[10px] shrink-0">
                            <AvatarFallback className={`font-bold ${getContactAvatarColor(rec.email)}`}>
                              {rec.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-foreground truncate">{rec.name}</p>
                            <p className="text-[10px] font-mono text-muted-foreground truncate">{rec.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {onComposeTo && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onComposeTo(rec.email)}
                              className="h-6 w-6 rounded text-muted-foreground hover:text-blue-600"
                              title="Compose to recipient"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(rec.email, rec.email, `pop-${rec.email}`)}
                            className="h-6 w-6 rounded text-muted-foreground hover:text-foreground"
                            title="Copy email address"
                          >
                            {copiedKey === `pop-${rec.email}` ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {/* Show less button if inline chips are expanded */}
            {showAllToChips && hiddenToCount > 0 && (
              <button
                type="button"
                onClick={() => setShowAllToChips(false)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted/60 transition-colors"
              >
                Show less
              </button>
            )}

            {/* CC snippet badge if available */}
            {ccList.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium text-muted-foreground bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                <span className="font-bold">Cc:</span>
                <span>{ccList.length} {ccList.length === 1 ? "contact" : "contacts"}</span>
              </span>
            )}

            {/* BCC snippet badge if available */}
            {bccList.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium text-muted-foreground bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                <span className="font-bold">Bcc:</span>
                <span>{bccList.length}</span>
              </span>
            )}
          </div>

          {/* Details toggle button */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 px-2.5 py-1 rounded-lg hover:bg-muted/60 border border-transparent hover:border-border/60 transition-all ml-auto shrink-0 select-none cursor-pointer"
            aria-expanded={isExpanded}
            aria-label="Toggle full recipient envelope details"
          >
            <span>{isExpanded ? "Hide Details" : totalRecipients > 1 ? `Details (${totalRecipients})` : "Details"}</span>
            {isExpanded ? (
              <ChevronUp className="h-3 w-3 text-muted-foreground/70" />
            ) : (
              <ChevronDown className="h-3 w-3 text-muted-foreground/70" />
            )}
          </button>
        </div>

        {/* Expanded Rich Details Box */}
        {isExpanded && (
          <div className="mt-3 p-3.5 sm:p-4 rounded-xl border border-border/80 bg-background/95 backdrop-blur-sm shadow-sm space-y-3 animate-in fade-in-50 slide-in-from-top-1 duration-200">
            {/* Header of details with Copy All */}
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-xs font-bold text-foreground">Message Envelope & Recipients</span>
                <Badge variant="outline" className="text-[10px] h-4.5 px-1.5 font-semibold text-muted-foreground">
                  {totalRecipients} {totalRecipients === 1 ? "recipient" : "recipients"}
                </Badge>
              </div>

              {totalRecipients > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAllRecipients}
                  className="h-6 px-2 text-[10px] font-semibold text-muted-foreground hover:text-blue-600 gap-1 rounded-md"
                >
                  {copiedKey === "all-recipients" ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-500" />
                      <span className="text-emerald-600 font-bold">Copied All</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy All Emails</span>
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Grid of Envelope fields */}
            <div className="space-y-2.5 text-xs">
              {/* FROM ROW */}
              <div className="flex items-start gap-2.5">
                <span className="w-16 shrink-0 text-[11px] font-bold text-muted-foreground pt-0.5">
                  From:
                </span>
                <div className="flex-1 min-w-0 flex items-center justify-between gap-2 p-1.5 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="h-6 w-6 border border-border/60 text-[10px] shrink-0">
                      <AvatarFallback className={`font-bold ${getContactAvatarColor(parsedFrom.email)}`}>
                        {parsedFrom.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate text-[11px]">{parsedFrom.name}</p>
                      <p className="font-mono text-[10px] text-muted-foreground truncate">{parsedFrom.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(parsedFrom.email, "sender email", `from-${parsedFrom.email}`)}
                    className="h-6 w-6 rounded-md hover:bg-muted/80 text-muted-foreground hover:text-foreground shrink-0"
                    title="Copy sender email"
                  >
                    {copiedKey === `from-${parsedFrom.email}` ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>

              {/* TO ROW - All Recipients */}
              <div className="flex items-start gap-2.5">
                <span className="w-16 shrink-0 text-[11px] font-bold text-muted-foreground pt-1">
                  To ({toList.length}):
                </span>
                <div className="flex-1 min-w-0">
                  {toList.length === 0 ? (
                    <span className="text-[11px] text-muted-foreground italic">None</span>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {toList.map((recipient, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between gap-2 p-1.5 px-2 rounded-lg bg-card border border-border/70 hover:border-blue-300 dark:hover:border-blue-800 transition-colors shadow-2xs group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Avatar className="h-5 w-5 border border-border/50 text-[9px] shrink-0">
                              <AvatarFallback className={`font-bold ${getContactAvatarColor(recipient.email)}`}>
                                {recipient.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground truncate text-[11px] leading-tight">
                                {recipient.name}
                              </p>
                              <p className="font-mono text-[10px] text-muted-foreground truncate leading-tight">
                                {recipient.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                            {onComposeTo && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onComposeTo(recipient.email)}
                                className="h-5.5 w-5.5 rounded text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                                title="Compose email to this contact"
                              >
                                <ExternalLink className="h-2.5 w-2.5" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyToClipboard(recipient.email, recipient.email, `to-${recipient.email}`)}
                              className="h-5.5 w-5.5 rounded text-muted-foreground hover:text-foreground"
                              title="Copy email address"
                            >
                              {copiedKey === `to-${recipient.email}` ? (
                                <Check className="h-2.5 w-2.5 text-emerald-500" />
                              ) : (
                                <Copy className="h-2.5 w-2.5" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* CC ROW */}
              {ccList.length > 0 && (
                <div className="flex items-start gap-2.5">
                  <span className="w-16 shrink-0 text-[11px] font-bold text-muted-foreground pt-1">
                    Cc ({ccList.length}):
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {ccList.map((recipient, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between gap-2 p-1.5 px-2 rounded-lg bg-card border border-border/70 hover:border-purple-300 dark:hover:border-purple-800 transition-colors shadow-2xs group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Avatar className="h-5 w-5 border border-border/50 text-[9px] shrink-0">
                              <AvatarFallback className={`font-bold ${getContactAvatarColor(recipient.email)}`}>
                                {recipient.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground truncate text-[11px] leading-tight">
                                {recipient.name}
                              </p>
                              <p className="font-mono text-[10px] text-muted-foreground truncate leading-tight">
                                {recipient.email}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(recipient.email, recipient.email, `cc-${recipient.email}`)}
                            className="h-5.5 w-5.5 rounded text-muted-foreground hover:text-foreground shrink-0"
                            title="Copy CC email"
                          >
                            {copiedKey === `cc-${recipient.email}` ? (
                              <Check className="h-2.5 w-2.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-2.5 w-2.5" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* BCC ROW */}
              {bccList.length > 0 && (
                <div className="flex items-start gap-2.5">
                  <span className="w-16 shrink-0 text-[11px] font-bold text-muted-foreground pt-1">
                    Bcc ({bccList.length}):
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {bccList.map((recipient, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between gap-2 p-1.5 px-2 rounded-lg bg-card border border-border/70 hover:border-amber-300 dark:hover:border-amber-800 transition-colors shadow-2xs group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Avatar className="h-5 w-5 border border-border/50 text-[9px] shrink-0">
                              <AvatarFallback className={`font-bold ${getContactAvatarColor(recipient.email)}`}>
                                {recipient.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground truncate text-[11px] leading-tight">
                                {recipient.name}
                              </p>
                              <p className="font-mono text-[10px] text-muted-foreground truncate leading-tight">
                                {recipient.email}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(recipient.email, recipient.email, `bcc-${recipient.email}`)}
                            className="h-5.5 w-5.5 rounded text-muted-foreground hover:text-foreground shrink-0"
                            title="Copy BCC email"
                          >
                            {copiedKey === `bcc-${recipient.email}` ? (
                              <Check className="h-2.5 w-2.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-2.5 w-2.5" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* METADATA FOOTER (Date & Subject) */}
              <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2 text-[10px] text-muted-foreground flex-wrap">
                {date && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 text-muted-foreground/70" />
                    <span>
                      {new Date(date).toLocaleString(undefined, {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </div>
                )}
                {subject && (
                  <span className="truncate max-w-[280px]" title={subject}>
                    Subject: <strong className="text-foreground/80">{subject}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </TooltipProvider>
    </div>
  );
};
