"use client";

import { useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { emailService } from "@/services/emailService";
import { EmailSignature, SIGNATURE_TEMPLATE_PRESETS } from "@/types/emailSignature";
import { useAuth } from "@/contexts/AuthContext";
import { useMailboxStatus } from "./useEmail";

export function useEmailSignatures() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: mailboxData } = useMailboxStatus();
  const mailbox = mailboxData?.data;

  // Default display values
  const defaultUserName = mailbox?.displayName || user?.name || "Alex Morgan";
  const defaultUserEmail = mailbox?.emailAddress || user?.email || "alex@cliqhire.com";

  // Fetch signatures
  const { data, isLoading } = useQuery({
    queryKey: ["email-signatures"],
    queryFn: () => emailService.getSignatures(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const signatures: EmailSignature[] = data?.data || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: { name: string; contentHtml?: string }) => {
      const html = payload.contentHtml || SIGNATURE_TEMPLATE_PRESETS[0].generateHtml({
        name: defaultUserName,
        email: defaultUserEmail,
      });
      return emailService.createSignature({ name: payload.name, contentHtml: html });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-signatures"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create signature");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<{ name: string; contentHtml: string }> }) =>
      emailService.updateSignature(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-signatures"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update signature");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => emailService.deleteSignature(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-signatures"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete signature");
    }
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => emailService.setDefaultSignature(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-signatures"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to set default signature");
    }
  });

  const getSignatureById = useCallback(
    (id: string | null): EmailSignature | undefined => {
      if (!id) return undefined;
      return signatures.find((s) => s._id === id || s.id === id);
    },
    [signatures]
  );

  const defaultSignature = useMemo(() => {
    return signatures.find(s => s.isDefault) || null;
  }, [signatures]);

  return {
    signatures,
    isLoading,
    createMutation,
    updateMutation,
    deleteMutation,
    setDefaultMutation,
    getSignatureById,
    defaultSignature,
    defaultUserName,
    defaultUserEmail,
    // We map old default accessors to the single default signature
    defaultNewSignature: defaultSignature,
    defaultReplySignature: defaultSignature,
  };
}
