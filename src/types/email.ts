/**
 * email.ts
 *
 * Comprehensive TypeScript types matching the Email System API contract (EMAIL_API.md).
 */

export type MailProviderPreset =
  | "godaddy"
  | "zoho"
  | "google_workspace"
  | "outlook365"
  | "custom";

export type MailEncryptionType = "SSL" | "TLS" | "STARTTLS";

export type MailboxConnectionStatus = "connected" | "auth_failed" | "disconnected";

export type EmailDirection = "sent" | "received";

export type EmailStatus = "queued" | "sent" | "failed" | "delivered" | "received";

export interface MailProviderConfig {
  _id?: string;
  domain?: string;
  provider: MailProviderPreset;
  imapHost?: string;
  imapPort?: number;
  imapEncryption?: MailEncryptionType;
  smtpHost?: string;
  smtpPort?: number;
  smtpEncryption?: MailEncryptionType;
  requiresAppPassword?: boolean;
  dailySendLimit?: number | null;
  status: "active" | "disabled";
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Mailbox {
  _id: string;
  userId: string;
  providerConfigId?: string;
  emailAddress: string;
  displayName: string;
  connectionStatus: MailboxConnectionStatus;
  lastSyncedAt?: string | null;
  lastSyncError?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmailThread {
  _id: string;
  mailboxId: string;
  subject: string;
  participants: string[];
  lastMessageAt: string;
  unreadCount: number;
  isStarred: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmailAttachment {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageUrl: string;
}

export interface Email {
  _id: string;
  mailboxId: string;
  threadId: string;
  direction: EmailDirection;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  bodyText?: string;
  bodyHtml?: string;
  attachments?: EmailAttachment[];
  messageIdHeader?: string;
  inReplyTo?: string;
  isRead: boolean;
  status: EmailStatus;
  errorMessage?: string;
  sentAt?: string;
  receivedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ConnectMailboxPayload {
  email: string;
  password: string;
  displayName: string;
}

export interface SendEmailPayload {
  to: string | string[];
  subject: string;
  cc?: string | string[];
  bcc?: string | string[];
  text?: string;
  html?: string;
  threadId?: string;
  inReplyTo?: string;
  attachments?: File[];
}

export interface GetThreadsParams {
  page?: number;
  limit?: number;
  starredOnly?: boolean;
}

export interface ThreadsResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: EmailThread[];
}

export interface ThreadDetailResponse {
  success: boolean;
  data: {
    thread: EmailThread;
    messages: Email[];
  };
}

export interface MailboxStatusResponse {
  success: boolean;
  connected: boolean;
  data: Mailbox | null;
}

export interface AdminMailboxStatusItem {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  emailAddress: string;
  connectionStatus: MailboxConnectionStatus;
  lastSyncedAt: string | null;
  lastSyncError: string | null;
  isActive: boolean;
}

export interface AdminMailboxStatusResponse {
  success: boolean;
  count: number;
  data: AdminMailboxStatusItem[];
}
