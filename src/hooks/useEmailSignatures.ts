"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMailboxStatus } from "./useEmail";
import {
  EmailSignature,
  EmailSignatureSettings,
  SIGNATURE_TEMPLATE_PRESETS,
} from "@/types/emailSignature";

const STORAGE_EVENT_NAME = "cliqhire_signatures_changed";

export function useEmailSignatures() {
  const { user } = useAuth();
  const { data: mailboxData } = useMailboxStatus();
  const mailbox = mailboxData?.data;

  // Determine user identity for storage scope
  const userId = user?.id || (user as any)?._id || mailbox?.userId || "user";
  const storageKey = `cliqhire_signatures_${userId}`;

  // Default display values
  const defaultUserName =
    mailbox?.displayName ||
    user?.name ||
    "Alex Morgan";
  const defaultUserEmail = mailbox?.emailAddress || user?.email || "alex@cliqhire.com";

  // Initial starter signature generator
  const getInitialSettings = useCallback((): EmailSignatureSettings => {
    const starterId = "default_sig_1";
    const starterHtml = SIGNATURE_TEMPLATE_PRESETS[0].generateHtml({
      name: defaultUserName,
      title: "Talent Partner",
      email: defaultUserEmail,
      phone: "+1 (555) 234-5678",
    });

    const initialSignature: EmailSignature = {
      id: starterId,
      name: "Work Signature",
      contentHtml: starterHtml,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      signatures: [initialSignature],
      defaultNewEmailSignatureId: starterId,
      defaultReplySignatureId: starterId,
      insertSignatureBeforeQuotedText: true,
    };
  }, [defaultUserName, defaultUserEmail]);

  // Load state from localStorage
  const [settings, setSettings] = useState<EmailSignatureSettings>(() => {
    if (typeof window === "undefined") {
      return {
        signatures: [],
        defaultNewEmailSignatureId: null,
        defaultReplySignatureId: null,
        insertSignatureBeforeQuotedText: true,
      };
    }
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.signatures) && parsed.signatures.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return getInitialSettings();
  });

  // Sync state to localStorage and broadcast change event
  const persistSettings = useCallback(
    (newSettings: EmailSignatureSettings) => {
      setSettings(newSettings);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(storageKey, JSON.stringify(newSettings));
          window.dispatchEvent(new CustomEvent(STORAGE_EVENT_NAME, { detail: newSettings }));
        } catch (e) {
          console.error("Failed to save email signatures to localStorage", e);
        }
      }
    },
    [storageKey]
  );

  // Cross-component and cross-tab real-time listener
  useEffect(() => {
    const handleCustomChange = (e: Event) => {
      const customEvent = e as CustomEvent<EmailSignatureSettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        try {
          setSettings(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener(STORAGE_EVENT_NAME, handleCustomChange);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(STORAGE_EVENT_NAME, handleCustomChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, [storageKey]);

  // CRUD Operations
  const createSignature = useCallback(
    (name: string, contentHtml?: string): EmailSignature => {
      const newId = `sig_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const html =
        contentHtml ||
        SIGNATURE_TEMPLATE_PRESETS[0].generateHtml({
          name: defaultUserName,
          title: "Talent Specialist",
          email: defaultUserEmail,
        });

      const newSig: EmailSignature = {
        id: newId,
        name: name.trim() || `Signature ${settings.signatures.length + 1}`,
        contentHtml: html,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedSignatures = [...settings.signatures, newSig];
      const newDefaults = {
        ...settings,
        signatures: updatedSignatures,
        // If this is the only signature, set it as default
        defaultNewEmailSignatureId:
          settings.defaultNewEmailSignatureId || newId,
        defaultReplySignatureId:
          settings.defaultReplySignatureId || newId,
      };

      persistSettings(newDefaults);
      return newSig;
    },
    [settings, defaultUserName, defaultUserEmail, persistSettings]
  );

  const updateSignature = useCallback(
    (id: string, updates: Partial<Omit<EmailSignature, "id" | "createdAt">>) => {
      const updatedSignatures = settings.signatures.map((sig) => {
        if (sig.id === id) {
          return {
            ...sig,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
        }
        return sig;
      });

      persistSettings({
        ...settings,
        signatures: updatedSignatures,
      });
    },
    [settings, persistSettings]
  );

  const deleteSignature = useCallback(
    (id: string) => {
      const updatedSignatures = settings.signatures.filter((s) => s.id !== id);
      const newSettings: EmailSignatureSettings = {
        ...settings,
        signatures: updatedSignatures,
        defaultNewEmailSignatureId:
          settings.defaultNewEmailSignatureId === id ? null : settings.defaultNewEmailSignatureId,
        defaultReplySignatureId:
          settings.defaultReplySignatureId === id ? null : settings.defaultReplySignatureId,
      };

      persistSettings(newSettings);
    },
    [settings, persistSettings]
  );

  const setDefaultNewEmail = useCallback(
    (id: string | null) => {
      persistSettings({
        ...settings,
        defaultNewEmailSignatureId: id,
      });
    },
    [settings, persistSettings]
  );

  const setDefaultReply = useCallback(
    (id: string | null) => {
      persistSettings({
        ...settings,
        defaultReplySignatureId: id,
      });
    },
    [settings, persistSettings]
  );

  const setInsertBeforeQuoted = useCallback(
    (value: boolean) => {
      persistSettings({
        ...settings,
        insertSignatureBeforeQuotedText: value,
      });
    },
    [settings, persistSettings]
  );

  const getSignatureById = useCallback(
    (id: string | null): EmailSignature | undefined => {
      if (!id) return undefined;
      return settings.signatures.find((s) => s.id === id);
    },
    [settings.signatures]
  );

  const defaultNewSignature = useMemo(() => {
    return getSignatureById(settings.defaultNewEmailSignatureId) || null;
  }, [getSignatureById, settings.defaultNewEmailSignatureId]);

  const defaultReplySignature = useMemo(() => {
    return getSignatureById(settings.defaultReplySignatureId) || null;
  }, [getSignatureById, settings.defaultReplySignatureId]);

  return {
    signatures: settings.signatures,
    settings,
    createSignature,
    updateSignature,
    deleteSignature,
    setDefaultNewEmail,
    setDefaultReply,
    setInsertBeforeQuoted,
    getSignatureById,
    defaultNewSignature,
    defaultReplySignature,
    defaultUserName,
    defaultUserEmail,
  };
}
