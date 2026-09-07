"use client";

import React, { useState, useRef, KeyboardEvent, ClipboardEvent } from "react";
import { X, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RecipientInputProps {
  label: string;
  recipients: string[];
  onChange: (recipients: string[]) => void;
  placeholder?: string;
  autoFocus?: boolean;
  rightAction?: React.ReactNode;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const RecipientInput: React.FC<RecipientInputProps> = ({
  label,
  recipients,
  onChange,
  placeholder = "Add recipients...",
  autoFocus = false,
  rightAction,
}) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addEmails = (emailsToAdd: string[]) => {
    const cleaned = emailsToAdd
      .map((e) => e.trim().replace(/^[<"']+|[>"']+$/g, ""))
      .filter((e) => e.length > 0);

    if (cleaned.length === 0) return;

    // Filter duplicates
    const unique = Array.from(new Set([...recipients, ...cleaned]));
    onChange(unique);
    setInputValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      if (inputValue.trim()) {
        addEmails([inputValue]);
      }
    } else if (e.key === "Backspace" && !inputValue && recipients.length > 0) {
      // Remove last chip when backspace pressed on empty input
      e.preventDefault();
      onChange(recipients.slice(0, -1));
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text");
    const emails = pasteData.split(/[\s,;]+/).filter(Boolean);
    addEmails(emails);
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addEmails([inputValue]);
    }
  };

  const removeRecipient = (index: number) => {
    onChange(recipients.filter((_, i) => i !== index));
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="flex items-center flex-wrap gap-1.5 px-3 py-1.5 border-b border-border/60 hover:border-border transition-colors cursor-text min-h-[38px] text-xs"
    >
      <span className="text-muted-foreground font-medium text-xs shrink-0 select-none mr-1 w-8">
        {label}
      </span>

      {/* Chips */}
      {recipients.map((recipient, index) => {
        const isValid = EMAIL_REGEX.test(recipient);

        return (
          <Badge
            key={index}
            variant="secondary"
            className={`h-6 pl-2 pr-1 gap-1 text-[11px] font-normal rounded-lg transition-all ${
              isValid
                ? "bg-muted text-foreground border-border/80"
                : "bg-destructive/10 text-destructive border-destructive/30"
            }`}
          >
            {!isValid && (
              <span title="Invalid email address">
                <AlertCircle className="h-3 w-3 text-destructive" />
              </span>
            )}
            <span className="truncate max-w-[200px]">{recipient}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeRecipient(index);
              }}
              className="p-0.5 rounded-full hover:bg-foreground/10 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        );
      })}

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={handleBlur}
        autoFocus={autoFocus}
        placeholder={recipients.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[120px] bg-transparent outline-none text-xs text-foreground placeholder:text-muted-foreground/60 h-6"
      />

      {/* Optional right actions (e.g. + Cc, + Bcc toggles) */}
      {rightAction && <div className="ml-auto shrink-0">{rightAction}</div>}
    </div>
  );
};
