/**
 * emailSignature.ts
 *
 * Types and templates for user-managed email signatures (Gmail style).
 */

export interface EmailSignature {
  id?: string;
  _id?: string;
  name: string;
  contentHtml: string;
  contentText?: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmailSignatureSettings {
  insertSignatureBeforeQuotedText?: boolean;
}

export interface SignatureTemplatePreset {
  id: string;
  name: string;
  description: string;
  badge: string;
  generateHtml: (user: { name?: string; title?: string; email?: string; phone?: string }) => string;
}

export const SIGNATURE_TEMPLATE_PRESETS: SignatureTemplatePreset[] = [
  {
    id: "modern_professional",
    name: "Modern Professional",
    description: "Balanced typography with company badge and contact row.",
    badge: "Popular",
    generateHtml: ({ name = "Alex Morgan", title = "Senior Talent Partner", email = "alex@cliqhire.com", phone = "+1 (555) 234-5678" }) => `
<div class="gmail_signature" data-signature-block="true" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; color: #334155; line-height: 1.5; padding-top: 10px; margin-top: 16px; border-top: 1px solid #e2e8f0;">
  <p style="margin: 0; font-weight: 700; font-size: 14px; color: #0f172a; letter-spacing: -0.01em;">${name}</p>
  <p style="margin: 2px 0 6px 0; font-size: 12px; color: #64748b; font-weight: 500;">${title} <span style="color: #cbd5e1;">•</span> CliqHire Talent Systems</p>
  <div style="font-size: 12px; color: #475569; margin-top: 4px; display: flex; flex-wrap: wrap; gap: 10px;">
    <span>📧 <a href="mailto:${email}" style="color: #2563eb; text-decoration: none; font-weight: 500;">${email}</a></span>
    <span>📞 <span style="color: #475569;">${phone}</span></span>
    <span>🌐 <a href="https://cliqhire.com" style="color: #2563eb; text-decoration: none; font-weight: 500;">cliqhire.com</a></span>
  </div>
</div>`,
  },
  {
    id: "executive_card",
    name: "Executive Accent Card",
    description: "Sleek vertical border highlight with elevated credentials.",
    badge: "Executive",
    generateHtml: ({ name = "Alex Morgan", title = "Head of Talent Acquisition", email = "alex@cliqhire.com", phone = "+1 (555) 234-5678" }) => `
<div class="gmail_signature" data-signature-block="true" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; color: #334155; line-height: 1.4; border-left: 3px solid #3b82f6; padding-left: 12px; margin-top: 16px; margin-bottom: 8px;">
  <p style="margin: 0; font-weight: 700; font-size: 14px; color: #0f172a;">${name}</p>
  <p style="margin: 2px 0 4px 0; font-size: 12px; color: #2563eb; font-weight: 600;">${title}</p>
  <p style="margin: 0 0 6px 0; font-size: 11px; color: #64748b; font-weight: 500;">CliqHire Automated Enterprise Management</p>
  <p style="margin: 0; font-size: 11px; color: #475569;">
    <a href="mailto:${email}" style="color: #334155; text-decoration: none; font-weight: 500;">${email}</a>
    <span style="color: #94a3b8; margin: 0 4px;">|</span>
    <span>${phone}</span>
  </p>
</div>`,
  },
  {
    id: "minimal_clean",
    name: "Minimal Clean",
    description: "Subtle single-line layout without visual clutter.",
    badge: "Minimal",
    generateHtml: ({ name = "Alex Morgan", title = "Talent Partner", email = "alex@cliqhire.com", phone = "+1 (555) 234-5678" }) => `
<div class="gmail_signature" data-signature-block="true" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; color: #64748b; line-height: 1.6; margin-top: 14px;">
  <span style="font-weight: 600; color: #0f172a;">${name}</span>
  <span style="color: #94a3b8;"> — </span>
  <span>${title}</span>
  <br />
  <span style="color: #64748b;">CliqHire</span>
  <span style="color: #cbd5e1; margin: 0 4px;">•</span>
  <a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a>
  <span style="color: #cbd5e1; margin: 0 4px;">•</span>
  <span>${phone}</span>
</div>`,
  },
  {
    id: "recruiter_specialized",
    name: "Recruiter & Interview",
    description: "Includes interview scheduling badge and confidential disclaimer.",
    badge: "Recruiting",
    generateHtml: ({ name = "Alex Morgan", title = "Senior Technical Recruiter", email = "alex@cliqhire.com", phone = "+1 (555) 234-5678" }) => `
<div class="gmail_signature" data-signature-block="true" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; color: #334155; line-height: 1.5; margin-top: 16px; padding-top: 10px; border-top: 1px dashed #cbd5e1;">
  <p style="margin: 0; font-weight: 700; font-size: 14px; color: #0f172a;">${name}</p>
  <p style="margin: 2px 0 6px 0; font-size: 12px; color: #0284c7; font-weight: 600;">${title} • Talent Acquisition</p>
  <p style="margin: 0 0 8px 0; font-size: 12px; color: #475569;">
    CliqHire AEMS <span style="color: #cbd5e1;">•</span> <a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a> <span style="color: #cbd5e1;">•</span> ${phone}
  </p>
  <div style="margin: 6px 0;">
    <a href="https://calendly.com" style="display: inline-block; background-color: #f8fafc; color: #0f172a; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; text-decoration: none; border: 1px solid #e2e8f0;">
      📅 Schedule an Interview
    </a>
  </div>
  <p style="margin: 8px 0 0 0; font-size: 10px; color: #94a3b8; line-height: 1.3;">
    Confidentiality Notice: This message and any attachments are intended solely for the use of the intended recipient.
  </p>
</div>`,
  },
];
