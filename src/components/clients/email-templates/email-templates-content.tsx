"use client";

import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Mail, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { AddTemplateDialog } from "@/components/clients/email-templates/add-template-dialog";
import { TemplatesList } from "@/components/clients/email-templates/templates-list";
import { PreviewTemplateDialog } from "@/components/clients/email-templates/preview-template-dialog";
import { EmailTemplate } from "@/components/clients/email-templates/types";

// Dummy data for email templates
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
    author: { name: "John Doe", avatar: "JD" }
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
    author: { name: "Sarah Smith", avatar: "SS" }
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

We've tailored this proposal specifically to address your unique requirements and challenges. Our approach focuses on finding the right talent that aligns with your company culture and values.

I'm available to discuss any aspects of the proposal and answer any questions you might have. We can schedule a call at your convenience.

Thank you for considering our services.

Best regards,
{{senderName}}
{{companyName}}`,
    category: "Proposal",
    isDefault: true,
    createdAt: "2024-01-17T09:15:00Z",
    updatedAt: "2024-01-17T09:15:00Z",
    author: { name: "Mike Johnson", avatar: "MJ" }
  },
  {
    id: "4",
    name: "Contract Reminder",
    subject: "Contract Renewal Reminder - {{clientCompany}}",
    content: `Dear {{clientName}},

I hope this email finds you well. This is a friendly reminder that your recruitment services contract with us is due for renewal on {{renewalDate}}.

We've been honored to serve {{clientCompany}} and would love to continue our partnership. Over the past year, we've:
- Successfully filled [X] positions
- Maintained a [X]% success rate
- Reduced your time-to-hire by [X]%

I'd like to schedule a brief call to discuss:
- Your upcoming recruitment needs
- Contract renewal terms
- Any feedback or suggestions you might have

Please let me know your availability for next week.

Thank you for your continued trust in our services.

Best regards,
{{senderName}}`,
    category: "Contract",
    isDefault: false,
    createdAt: "2024-01-18T16:45:00Z",
    updatedAt: "2024-01-18T16:45:00Z",
    author: { name: "Emily Davis", avatar: "ED" }
  }
];

export function EmailTemplatesContent({
  clientId,
  clientData,
  canModify = true
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
    // Simulate loading and set empty data to show empty state
    setLoading(true);
    setTimeout(() => {
      setTemplates([]); // Start with empty templates to show empty state
      setLoading(false);
    }, 500); // Simulate network delay
  }, [clientId]);

  const handleAddTemplate = async (template: {
    name: string;
    subject: string;
    content: string;
    category: string;
    isDefault: boolean;
  }) => {
    if (!canModify) return;
    // Create new template with dummy data
    const newTemplate: EmailTemplate = {
      id: Date.now().toString(),
      ...template,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: { name: "Current User", avatar: "CU" },
    };

    // Add to the beginning of the templates array
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

    // Update template with dummy data
    const updatedTemplate: EmailTemplate = {
      ...editTemplate,
      ...updated,
      updatedAt: new Date().toISOString(),
    };

    const updatedTemplates = templates.map((t) =>
      t.id === editTemplate.id ? updatedTemplate : t
    );

    setTemplates(updatedTemplates);
    setEditTemplate(null);
    setIsEditDialogOpen(false);
  };

  const handleDeleteTemplate = async (templateToDelete: EmailTemplate) => {
    if (!canModify) return;
    // Delete template from dummy data
    setTemplates(templates.filter((t) => t.id !== templateToDelete.id));
  };

  // const handleDuplicateTemplate = async (templateToDuplicate: EmailTemplate) => {
  //   const duplicatedTemplate = {
  //     name: `${templateToDuplicate.name} (Copy)`,
  //     subject: templateToDuplicate.subject,
  //     content: templateToDuplicate.content,
  //     category: templateToDuplicate.category,
  //     isDefault: false,
  //   };

  //   await handleAddTemplate(duplicatedTemplate);
  // };

  const handlePreviewTemplate = (template: EmailTemplate) => {
    setPreviewTemplate(template);
    setIsPreviewDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading email templates...</div>
      </div>
    );
  }

  return (
    <div className="bg-muted/50 rounded-2xl p-6 flex flex-col h-full">
      <div className="mb-6 flex justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand/10 rounded-lg">
            <Mail className="w-4 h-4 text-brand" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Email Templates</h2>
            <p className="text-xs text-muted-foreground">
              Manage email templates for {clientData?.name || "this client"}
            </p>
          </div>
        </div>
        <Button onClick={() => canModify && setIsAddDialogOpen(true)} disabled={!canModify} className="hover:bg-brand/90 transition-colors bg-brand text-white">
          <Plus className="h-4 w-4 mr-2" /> Create Template
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm transition-all p-5 flex-1">

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
            // onDuplicate={handleDuplicateTemplate}
            onPreview={handlePreviewTemplate}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-12 px-4 min-h-[300px]">
            {/* Illustration */}
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
                <Mail className="w-12 h-12 text-muted-foreground" />
              </div>
            </div>

            {/* Content */}
            <div className="max-w-sm">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No email templates created yet
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Create professional email templates to streamline your communication with {clientData?.name || "this client"}.
              </p>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => canModify && setIsAddDialogOpen(true)}
                  className="bg-brand hover:bg-brand/90 text-white"
                  disabled={!canModify}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
                <Button
                  variant="outline"
                  onClick={() => canModify && setTemplates(DUMMY_TEMPLATES)}
                  disabled={!canModify}
                >
                  Load Samples
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
