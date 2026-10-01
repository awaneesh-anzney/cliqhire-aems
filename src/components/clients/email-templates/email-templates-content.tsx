"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import CircularProgress from "@mui/material/CircularProgress";
import { AddTemplateDialog } from "@/components/clients/email-templates/add-template-dialog";
import { TemplatesList } from "@/components/clients/email-templates/templates-list";
import { PreviewTemplateDialog } from "@/components/clients/email-templates/preview-template-dialog";
import { EmailTemplate } from "@/components/clients/email-templates/types";

// Default pre-configured templates
const DUMMY_TEMPLATES: EmailTemplate[] = [
  {
    id: "1",
    name: "Welcome Email",
    subject: "Welcome to our partnership, {{clientName}}!",
    content: `Dear {{clientName}},

Welcome to our partnership! We're thrilled to have {{clientCompany}} as our client.

Our team is excited to work with you and help achieve your recruitment goals. You can expect:
- Dedicated account management
- Regular progress updates
- Access to our top talent pool
- Transparent communication throughout the process

If you have any questions or need assistance, please don't hesitate to reach out.

Best regards,
{{senderName}}
{{companyName}}`,
    category: "Welcome",
    isDefault: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    author: { name: "John Doe", avatar: "JD" },
  },
  {
    id: "2",
    name: "Follow-up Meeting",
    subject: "Following up on our discussion - {{clientCompany}}",
    content: `Hi {{clientName}},

Thank you for taking the time to meet with us yesterday. It was great discussing {{clientCompany}}'s recruitment needs and how we can support your growth.

As discussed, we'll be moving forward with:
- [Specific action items from the meeting]
- Timeline: [Insert timeline]
- Next steps: [Insert next steps]

I'll keep you updated on our progress and reach out if I need any additional information.

Looking forward to a successful partnership!

Best regards,
{{senderName}}`,
    category: "Follow-up",
    isDefault: false,
    createdAt: "2024-01-16T14:30:00Z",
    updatedAt: "2024-01-16T14:30:00Z",
    author: { name: "Sarah Smith", avatar: "SS" },
  },
  {
    id: "3",
    name: "Proposal Submission",
    subject: "Recruitment Proposal for {{clientCompany}}",
    content: `Dear {{clientName}},

Please find attached our comprehensive recruitment proposal for {{clientCompany}}.

This proposal includes:
- Detailed recruitment strategy
- Timeline and milestones
- Pricing structure
- Our team introduction
- Success metrics and KPIs

We've tailored this proposal specifically to address your unique requirements and challenges.

I'm available to discuss any aspects of the proposal and answer any questions you might have.

Best regards,
{{senderName}}`,
    category: "Proposal",
    isDefault: false,
    createdAt: "2024-01-17T09:15:00Z",
    updatedAt: "2024-01-17T09:15:00Z",
    author: { name: "Mike Johnson", avatar: "MJ" },
  },
];

export function EmailTemplatesContent({
  clientId,
  clientData,
  canModify = true,
}: {
  clientId: string;
  clientData?: any;
  canModify?: boolean;
}) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<EmailTemplate | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setTemplates([]);
      setLoading(false);
    }, 400);
  }, [clientId]);

  const handleAddTemplate = async (template: {
    name: string;
    subject: string;
    content: string;
    category: string;
    isDefault: boolean;
  }) => {
    if (!canModify) return;
    const newTemplate: EmailTemplate = {
      id: Date.now().toString(),
      ...template,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: { name: "Current User", avatar: "CU" },
    };

    setTemplates([newTemplate, ...templates]);
  };

  const handleUpdateTemplate = async (updated: {
    name: string;
    subject: string;
    content: string;
    category: string;
    isDefault: boolean;
  }) => {
    if (!canModify) return;
    if (!editTemplate) return;

    const updatedTemplate: EmailTemplate = {
      ...editTemplate,
      ...updated,
      updatedAt: new Date().toISOString(),
    };

    const updatedTemplates = templates.map((t) =>
      t.id === editTemplate.id ? updatedTemplate : t,
    );

    setTemplates(updatedTemplates);
    setEditTemplate(null);
    setIsEditDialogOpen(false);
  };

  const handleDeleteTemplate = async (templateToDelete: EmailTemplate) => {
    if (!canModify) return;
    setTemplates(templates.filter((t) => t.id !== templateToDelete.id));
  };

  const handlePreviewTemplate = (template: EmailTemplate) => {
    setPreviewTemplate(template);
    setIsPreviewDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-3">
        <CircularProgress size={32} thickness={4} sx={{ color: "primary.main" }} />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Loading Templates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header action bar */}
      <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/70 bg-card shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <EmailOutlinedIcon sx={{ fontSize: 18 }} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Email Templates</h3>
            <p className="text-xs text-muted-foreground">
              Pre-configured templates for automated and direct communication
            </p>
          </div>
        </div>
        <Button
          onClick={() => canModify && setIsAddDialogOpen(true)}
          disabled={!canModify}
          size="sm"
          className="h-8 px-3 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <AddOutlinedIcon sx={{ fontSize: 15, mr: 0.5 }} /> Create Template
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border/70 shadow-2xs p-4 sm:p-5 flex-1">
        {templates.length > 0 ? (
          <TemplatesList
            templates={templates}
            onEdit={(template: EmailTemplate) => {
              if (!canModify) return;
              setEditTemplate(template);
              setTimeout(() => {
                setIsEditDialogOpen(true);
              }, 0);
            }}
            onDelete={handleDeleteTemplate}
            onPreview={handlePreviewTemplate}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-12 px-4 min-h-[260px]">
            <div className="w-12 h-12 mb-3 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground">
              <EmailOutlinedIcon sx={{ fontSize: 26 }} />
            </div>

            <div className="max-w-sm">
              <h4 className="text-sm font-bold text-foreground mb-1">
                No email templates created yet
              </h4>
              <p className="text-muted-foreground text-xs leading-relaxed mb-4">
                Create reusable email templates to streamline your communications with {clientData?.name || "this client"}.
              </p>

              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  onClick={() => canModify && setIsAddDialogOpen(true)}
                  size="sm"
                  className="text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={!canModify}
                >
                  <AddOutlinedIcon sx={{ fontSize: 15, mr: 0.5 }} />
                  Create Template
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs font-semibold rounded-lg"
                  onClick={() => canModify && setTemplates(DUMMY_TEMPLATES)}
                  disabled={!canModify}
                >
                  Load Sample Templates
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AddTemplateDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddTemplate}
        clientData={clientData}
      />

      {editTemplate && (
        <AddTemplateDialog
          open={isEditDialogOpen}
          onOpenChange={(open: boolean) => {
            setIsEditDialogOpen(open);
            if (!open) setEditTemplate(null);
          }}
          onSubmit={handleUpdateTemplate}
          initialTemplate={editTemplate}
          clientData={clientData}
          isEdit
        />
      )}

      <PreviewTemplateDialog
        open={isPreviewDialogOpen}
        onOpenChange={(open: boolean) => {
          setIsPreviewDialogOpen(open);
          if (!open) setPreviewTemplate(null);
        }}
        template={previewTemplate}
        clientData={clientData}
      />
    </div>
  );
}
