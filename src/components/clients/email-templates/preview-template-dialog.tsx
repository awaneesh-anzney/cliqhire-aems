"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { EmailTemplate } from "@/components/clients/email-templates/types";
import { Star, Calendar, User } from "lucide-react";

interface PreviewTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: EmailTemplate | null;
  clientData?: any;
}

export function PreviewTemplateDialog({
  open,
  onOpenChange,
  template,
  clientData,
}: PreviewTemplateDialogProps) {
  if (!template) return null;

  // Replace template variables with sample data for preview
  const replaceVariables = (text: string) => {
    return text
      .replace(/\{\{clientName\}\}/g, clientData?.name || "John Smith")
      .replace(/\{\{clientCompany\}\}/g, clientData?.company || "Acme Corporation")
      .replace(/\{\{clientEmail\}\}/g, clientData?.email || "john@acme.com")
      .replace(/\{\{clientPhone\}\}/g, clientData?.phone || "+1 (555) 123-4567")
      .replace(/\{\{todayDate\}\}/g, new Date().toLocaleDateString())
      .replace(/\{\{currentTime\}\}/g, new Date().toLocaleTimeString())
      .replace(/\{\{senderName\}\}/g, "Sarah Johnson")
      .replace(/\{\{senderTitle\}\}/g, "Account Manager")
      .replace(/\{\{companyName\}\}/g, "CliqHire")
      .replace(/\{\{renewalDate\}\}/g, "December 31, 2024");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {template.name}
              {template.isDefault && (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              )}
            </DialogTitle>
            <Badge variant="secondary" className="ml-1">{template.category}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 flex-1 flex flex-col">
          {/* Email Preview Card */}
          <div className=" rounded-lg bg-card flex flex-col flex-1">
            {/* Email Header - Sticky */}
            {/* <div className="border-b bg-muted px-4 py-3 rounded-t-lg flex-shrink-0"> */}
              {/* <div className="flex items-center gap-2 text-sm text-foreground">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="ml-2 font-medium">Email Preview</span>
              </div> */}
            {/* </div> */}

            {/* Email Content */}
            <div className="p-1 flex flex-col flex-1">
              {/* Subject Line - Sticky */}
              <div className="mb-4 flex-shrink-0">
                <label className="text-sm font-medium text-foreground block mb-1">
                  Subject:
                </label>
                <div className="text-lg font-semibold text-foreground">
                  {replaceVariables(template.subject)}
                </div>
              </div>

              {/* Email Body - Only this part scrollable */}
              <div className="flex-1 flex flex-col min-h-0">
                <label className="text-sm font-medium text-foreground block mb-2 flex-shrink-0">
                  Content:
                </label>
                <div className="bg-muted rounded-lg p-4 border flex-1 overflow-y-auto min-h-0 max-h-[300px]">
                  <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                    {replaceVariables(template.content)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Template Metadata - Sticky at bottom */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm pt-4 border-t flex-shrink-0">
          <div className="flex items-center gap-2 text-foreground">
            <User className="h-4 w-4" />
            <span>By {template.author.name}</span>
          </div>
          <div className="flex items-center gap-2 text-foreground">
            <Calendar className="h-4 w-4" />
            <span>Created {formatDate(template.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2 text-foreground">
            <Calendar className="h-4 w-4" />
            <span>Updated {formatDate(template.updatedAt)}</span>
          </div>
        </div>

        {/* Variable Information */}
        {/* <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Template Variables Used:
          </h4>
          <div className="flex flex-wrap gap-2">
            {template.content.match(/\{\{[^}]+\}\}/g)?.map((variable, index) => (
              <Badge key={index} variant="outline" className="text-xs bg-card">
                {variable}
              </Badge>
            )) || <span className="text-sm text-blue-700">No variables used</span>}
          </div>
        </div> */}
      </DialogContent>
    </Dialog>
  );
}
