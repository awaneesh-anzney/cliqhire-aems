import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Building2, Eye, Check } from "lucide-react";
import "./scrollbar-hide.css";
import { DialogDescription } from "@radix-ui/react-dialog";

const DUMMY_TEMPLATES = [
  // Acme Corp Templates
  { 
    id: "1", 
    client: "Acme Corp",
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
    client: "Acme Corp",
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
    client: "Acme Corp",
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
    client: "Acme Corp",
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
  },

  // Beta Inc Templates
  { 
    id: "5", 
    client: "Beta Inc",
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
    id: "6", 
    client: "Beta Inc",
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
    id: "7", 
    client: "Beta Inc",
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
    id: "8", 
    client: "Beta Inc",
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
  },

  // Gamma LLC Templates
  { 
    id: "9", 
    client: "Gamma LLC",
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
    id: "10", 
    client: "Gamma LLC",
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
    id: "11", 
    client: "Gamma LLC",
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

  // Delta Corp Templates
  { 
    id: "12", 
    client: "Delta Corp",
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
    id: "13", 
    client: "Delta Corp",
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
    id: "14", 
    client: "Delta Corp",
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
    id: "15", 
    client: "Delta Corp",
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
  },

  // Epsilon Inc Templates
  { 
    id: "16", 
    client: "Epsilon Inc",
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
    id: "17", 
    client: "Epsilon Inc",
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
    id: "18", 
    client: "Epsilon Inc",
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

  // Zeta Corp Templates
  { 
    id: "19", 
    client: "Zeta Corp",
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
    id: "20", 
    client: "Zeta Corp",
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
    id: "21", 
    client: "Zeta Corp",
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
    id: "22", 
    client: "Zeta Corp",
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

interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUseTemplate: (content: string, subject: string) => void;
}

export function TemplateDialog({ open, onOpenChange, onUseTemplate }: TemplateDialogProps) {
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState<null | typeof DUMMY_TEMPLATES[0]>(null);
  const filtered = DUMMY_TEMPLATES.filter(t =>
    t.client.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="min-w-[800px] bg-card border border-border flex flex-col p-0 rounded-2xl" >
          <div className="sticky top-0 left-0 rounded-t-2xl ">
            
            <div className="relative flex items-center w-full pt-4">
              <span className="absolute left-3 text-muted-foreground">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </span>
              <input
                className="w-full pl-10 pr-10 py-2 text-foreground text-base bg-transparent border-none outline-none shadow-none placeholder-gray-400"
                placeholder="Search from all available templates..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full h-px bg-muted" />
          </div>
          <div className="flex-1 flex flex-col items-center justify-start px-5 py-0">
            <div className="w-full flex flex-col overflow-hidden">
              <div className="flex flex-col gap-0 overflow-y-auto p-0 scrollbar-hide max-h-[515px]">
                {filtered.map(t => (
                  <div key={t.id} className=" border-b last:border-b-0  px-2 py-5 flex items-center gap-2">
                    <div className="flex-shrink-0 mr-3">
                      <Building2 className="w-7 h-7 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-bold text-lg text-foreground leading-tight">{t.client}</div>
                        <Badge variant="secondary">{t.category}</Badge>
                      </div>
                      <div className="font-semibold text-base text-foreground leading-tight mb-1">{t.name}</div>
                      <div className="text-muted-foreground text-base leading-snug truncate">{t.content}</div>
                    </div>
                    <div className="flex flex-col gap-2 ml-1">
                      <Button size="icon" variant="outline" className="border-border" onClick={() => setViewing(t)} aria-label="View">
                        <Eye className="w-5 h-5 text-foreground" />
                      </Button>
                      <Button size="icon" className="bg-blue-600 hover:bg-blue-700 border-blue-700" onClick={() => { onUseTemplate(t.content, t.subject); }} aria-label="Use">
                        <Check className="w-5 h-5 text-white" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center p-4">No templates found.</div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
           
      {/* View Template Popup */}

      <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
        <DialogContent showCloseButton className="min-w-[800px] bg-card border border-border shadow-xl">
          <DialogHeader className="pb-2 border-b border-border">
            <DialogTitle className="text-xl font-semibold text-foreground leading-tight mb-0">
              {viewing?.name}
            </DialogTitle>
            <DialogDescription>
              Client: <span className="font-medium text-foreground">{viewing?.client}</span>
            </DialogDescription>
            
          </DialogHeader>
          
          {/* Subject section */}
          <div className="px-3 py-1">
            <p className="text-lg font-medium text-muted-foreground mb-1">Subject:</p>
            <p className="text-md">{viewing?.subject}</p>
          </div>
          
          {/* Content area moved outside of header */}
          <div className="max-h-[500px] overflow-y-auto w-full mt-0 rounded-lg border border-border p-4 text-foreground text-lg leading-relaxed shadow-sm">
            <pre className="whitespace-pre-wrap font-sans text-md leading-relaxed text-foreground">
              {viewing?.content}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
