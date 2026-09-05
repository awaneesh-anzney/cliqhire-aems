"use client";

/**
 * useEmail.ts
 *
 * Custom TanStack Query hooks for mailbox connection, threads, messages,
 * sending emails, and real-time Socket.io updates.
 */

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { emailService } from "@/services/emailService";
import { useSocket } from "@/contexts/SocketProvider";
import {
  ConnectMailboxPayload,
  SendEmailPayload,
  GetThreadsParams,
  MailProviderConfig,
  Email,
} from "@/types/email";

export const EMAIL_QUERY_KEYS = {
  mailboxStatus: ["mailbox-status"] as const,
  providerConfig: ["mail-provider-config"] as const,
  threads: (params?: GetThreadsParams) => ["email-threads", params] as const,
  thread: (id: string) => ["email-thread", id] as const,
  adminMailboxes: ["admin-mailboxes"] as const,
};

/**
 * Hook to get current user's mailbox connection status
 */
export function useMailboxStatus() {
  return useQuery({
    queryKey: EMAIL_QUERY_KEYS.mailboxStatus,
    queryFn: () => emailService.getMailboxStatus(),
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Hook to get organization email provider config
 */
export function useProviderConfig() {
  return useQuery({
    queryKey: EMAIL_QUERY_KEYS.providerConfig,
    queryFn: () => emailService.getProviderConfig(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Don't retry on 404
  });
}

/**
 * Mutation to create organization email provider config
 */
export function useCreateProviderConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<MailProviderConfig>) => emailService.createProviderConfig(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: EMAIL_QUERY_KEYS.providerConfig });
      toast.success(res.message || "Email configuration created successfully");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to create email configuration";
      toast.error(msg);
    },
  });
}

/**
 * Mutation to update organization email provider config
 */
export function useUpdateProviderConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<MailProviderConfig>) => emailService.updateProviderConfig(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: EMAIL_QUERY_KEYS.providerConfig });
      toast.success(res.message || "Email configuration updated successfully");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to update email configuration";
      toast.error(msg);
    },
  });
}

/**
 * Mutation to connect personal mailbox
 */
export function useConnectMailbox() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ConnectMailboxPayload) => emailService.connectMailbox(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: EMAIL_QUERY_KEYS.mailboxStatus });
      queryClient.invalidateQueries({ queryKey: ["email-threads"] });
      toast.success(res.message || "Mailbox connected successfully!");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to connect mailbox";
      toast.error(msg);
    },
  });
}

/**
 * Mutation to disconnect personal mailbox
 */
export function useDisconnectMailbox() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => emailService.disconnectMailbox(),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: EMAIL_QUERY_KEYS.mailboxStatus });
      queryClient.invalidateQueries({ queryKey: ["email-threads"] });
      toast.success(res.message || "Mailbox disconnected.");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to disconnect mailbox";
      toast.error(msg);
    },
  });
}

/**
 * Hook to get paginated inbox threads
 */
export function useEmailThreads(params: GetThreadsParams = {}, enabled: boolean = true) {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  // Listen for real-time `new_email` socket event
  useEffect(() => {
    if (!socket) return;

    const handleNewEmail = (data: { mailboxId: string; threadId: string; email: Email }) => {
      // Invalidate threads query
      queryClient.invalidateQueries({ queryKey: ["email-threads"] });
      if (data.threadId) {
        queryClient.invalidateQueries({ queryKey: EMAIL_QUERY_KEYS.thread(data.threadId) });
      }

      toast.info(
        `New email from ${data.email?.from || "a contact"}: ${data.email?.subject || "No Subject"}`
      );
    };

    socket.on("new_email", handleNewEmail);
    return () => {
      socket.off("new_email", handleNewEmail);
    };
  }, [socket, queryClient]);

  return useQuery({
    queryKey: EMAIL_QUERY_KEYS.threads(params),
    queryFn: () => emailService.getThreads(params),
    enabled,
    staleTime: 1000 * 20, // 20s
  });
}

/**
 * Hook to get thread detail and conversation messages
 */
export function useEmailThread(threadId: string | null) {
  return useQuery({
    queryKey: EMAIL_QUERY_KEYS.thread(threadId || ""),
    queryFn: () => emailService.getThreadById(threadId!),
    enabled: !!threadId,
    staleTime: 1000 * 20,
  });
}

/**
 * Mutation to mark a thread as read or unread
 */
export function useMarkThreadRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ threadId, isRead }: { threadId: string; isRead: boolean }) =>
      emailService.markThreadRead(threadId, isRead),
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["email-threads"] });
      queryClient.invalidateQueries({ queryKey: EMAIL_QUERY_KEYS.thread(variables.threadId) });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update thread status");
    },
  });
}

/**
 * Mutation to send a new email or reply
 */
export function useSendEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendEmailPayload) => emailService.sendEmail(payload),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["email-threads"] });
      if (variables.threadId) {
        queryClient.invalidateQueries({ queryKey: EMAIL_QUERY_KEYS.thread(variables.threadId) });
      }
      toast.success(res.message || "Email sent successfully!");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Failed to send email";
      toast.error(msg);
    },
  });
}

/**
 * Hook for Admins to view all employees' mailbox status
 */
export function useAdminMailboxes(enabled: boolean = false) {
  return useQuery({
    queryKey: EMAIL_QUERY_KEYS.adminMailboxes,
    queryFn: () => emailService.getAdminAllMailboxes(),
    enabled,
    staleTime: 1000 * 60,
  });
}
