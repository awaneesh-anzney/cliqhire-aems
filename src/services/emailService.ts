/**
 * emailService.ts
 *
 * Dedicated API service for the integrated employee mailbox system.
 * Based on the contract defined in EMAIL_API.md.
 */

import { api } from "@/lib/axios-config";
import {
  MailProviderConfig,
  MailboxStatusResponse,
  ConnectMailboxPayload,
  ThreadsResponse,
  ThreadDetailResponse,
  SendEmailPayload,
  GetThreadsParams,
  AdminMailboxStatusResponse,
  Email,
} from "@/types/email";

export const emailService = {
  /**
   * Fetch current organization email provider configuration.
   */
  async getProviderConfig(): Promise<{ success: boolean; data: MailProviderConfig }> {
    const response = await api.get("/api/email/provider-config");
    return response.data;
  },

  /**
   * Update or create organization email provider config (ADMIN only).
   */
  async updateProviderConfig(
    data: Partial<MailProviderConfig>
  ): Promise<{ success: boolean; message: string; data: MailProviderConfig }> {
    const response = await api.patch("/api/email/provider-config", data);
    return response.data;
  },

  /**
   * Check current user's mailbox connection status.
   */
  async getMailboxStatus(): Promise<MailboxStatusResponse> {
    const response = await api.get<MailboxStatusResponse>("/api/email/mailbox/status");
    return response.data;
  },

  /**
   * Connect user's own mailbox (live IMAP + SMTP validation).
   */
  async connectMailbox(
    payload: ConnectMailboxPayload
  ): Promise<{ success: boolean; message: string; data: any }> {
    const response = await api.post("/api/email/mailbox/connect", payload);
    return response.data;
  },

  /**
   * Disconnect user's mailbox (soft disconnect, preserving history).
   */
  async disconnectMailbox(): Promise<{ success: boolean; message: string }> {
    const response = await api.post("/api/email/mailbox/disconnect");
    return response.data;
  },

  /**
   * Fetch mailbox statuses for all employees in organization (ADMIN only).
   */
  async getAdminAllMailboxes(): Promise<AdminMailboxStatusResponse> {
    const response = await api.get<AdminMailboxStatusResponse>("/api/email/mailbox/admin/all");
    return response.data;
  },

  /**
   * List paginated inbox threads for the authenticated user's mailbox.
   */
  async getThreads(params: GetThreadsParams = {}): Promise<ThreadsResponse> {
    const response = await api.get<ThreadsResponse>("/api/email/threads", {
      params: {
        page: params.page || 1,
        limit: params.limit || 20,
        starredOnly: params.starredOnly ? "true" : undefined,
      },
    });
    return response.data;
  },

  /**
   * Fetch thread details and all chronological messages in the conversation.
   */
  async getThreadById(threadId: string): Promise<ThreadDetailResponse> {
    const response = await api.get<ThreadDetailResponse>(`/api/email/threads/${threadId}`);
    return response.data;
  },

  /**
   * Mark a thread as read or unread.
   */
  async markThreadRead(
    threadId: string,
    isRead: boolean = true
  ): Promise<{ success: boolean; message: string; data: any }> {
    const response = await api.patch(`/api/email/threads/${threadId}/read`, { isRead });
    return response.data;
  },

  /**
   * Compose & dispatch an email (new conversation or reply).
   * Automatically handles multipart/form-data if attachments are present.
   */
  async sendEmail(
    payload: SendEmailPayload
  ): Promise<{ success: boolean; message: string; data: Email }> {
    const hasFiles = payload.attachments && payload.attachments.length > 0;

    if (hasFiles) {
      const formData = new FormData();

      const toStr = Array.isArray(payload.to) ? payload.to.join(", ") : payload.to;
      formData.append("to", toStr);
      formData.append("subject", payload.subject);

      if (payload.cc) {
        formData.append("cc", Array.isArray(payload.cc) ? payload.cc.join(", ") : payload.cc);
      }
      if (payload.bcc) {
        formData.append("bcc", Array.isArray(payload.bcc) ? payload.bcc.join(", ") : payload.bcc);
      }
      if (payload.text) {
        formData.append("text", payload.text);
      }
      if (payload.html) {
        formData.append("html", payload.html);
      }
      if (payload.threadId) {
        formData.append("threadId", payload.threadId);
      }
      if (payload.inReplyTo) {
        formData.append("inReplyTo", payload.inReplyTo);
      }

      payload.attachments?.forEach((file) => {
        formData.append("attachments", file);
      });

      const response = await api.post("/api/email/send", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } else {
      const jsonBody: Record<string, any> = {
        to: payload.to,
        subject: payload.subject,
      };
      if (payload.cc) jsonBody.cc = payload.cc;
      if (payload.bcc) jsonBody.bcc = payload.bcc;
      if (payload.text) jsonBody.text = payload.text;
      if (payload.html) jsonBody.html = payload.html;
      if (payload.threadId) jsonBody.threadId = payload.threadId;
      if (payload.inReplyTo) jsonBody.inReplyTo = payload.inReplyTo;

      const response = await api.post("/api/email/send", jsonBody);
      return response.data;
    }
  },
};
