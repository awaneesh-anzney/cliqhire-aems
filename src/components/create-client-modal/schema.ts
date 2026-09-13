import { z } from "zod";

const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
const urlRegex = /^https?:\/\/.+/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Primary Contact Schema
export const primaryContactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.string().min(1, "Gender is required"),
  email: z.string().min(1, "Email is required").regex(emailRegex, "Please enter a valid email"),
  phone: z.string().min(1, "Phone number is required"),
  countryCode: z.string().min(1, "Country code is required"),
  designation: z.string().min(1, "Designation is required"),
  linkedin: z.string().optional(),
  isPrimary: z.boolean().default(true),
});

// Client General Information Schema
export const clientGeneralInfoSchema = z.object({
  clientStage: z.string().min(1, "Client stage is required"),
  clientSubStage: z.string().optional(),
  salesLead: z.string().min(1, "Sales lead is required"),
  referredBy: z.string().optional(),
  clientPriority: z.string().optional(),
  clientSegment: z.string().optional(),
  clientSource: z.string().optional(),
  clientSourceDetails: z.any().optional(),
  industry: z.string().optional(),
});

// Client Contact Information Schema
export const clientContactInfoSchema = z.object({
  name: z.string().min(1, "Client name is required"),
  emails: z
    .array(z.string().regex(emailRegex, "Please enter valid email addresses"))
    .min(1, "At least one email is required"),
  phoneNumber: z.string().min(1, "Client landline number is required"),
  address: z.string().min(1, "Client address is required"),
  // website: z
  //   .string()
  //   .min(1, "Client website is required")
  //   .regex(urlRegex, "Please enter a valid website URL"),
  // website: z.string().regex(urlRegex, "Please enter a valid website URL").optional(),
  website: z.string().optional(),
  // linkedInProfile: z
  //   .string()
  //   .min(1, "Client LinkedIn profile is required")
  //   .regex(urlRegex, "Please enter a valid LinkedIn URL"),
  // location: z.string().optional(),
  linkedInProfile: z.string().optional(),
  // googleMapsLink: z
  //   .string()
  //   .min(1, "Google Maps link is required")
  //   .regex(urlRegex, "Please enter a valid Google Maps URL"),
  googleMapsLink: z.string().optional(),
  countryOfBusiness: z.string().optional(),
  primaryContacts: z.array(primaryContactSchema).min(1, "At least one primary contact is required"),
});

// Client Contract Information Schema
export const clientContractInfoSchema = z.object({
  lineOfBusiness: z.array(z.string()),
  contractForms: z.record(z.any()).refine((contractForms) => {
    // Check if contract forms are filled for selected line of business
    return true; // We'll handle this validation in the component level
  }, "Contract forms must be filled for selected line of business"),
});

// Upload Files Schema
export const uploadFilesSchema = z.object({
  profileImage: z.any().optional(),
  crCopy: z.any().optional(),
  vatCopy: z.any().optional(),
  gstTinDocument: z.any().optional(),
});

// Complete Create Client Form Schema
export const createClientFormSchema = z.object({
  clientGeneralInfo: clientGeneralInfoSchema,
  clientContactInfo: clientContactInfoSchema,
  clientContractInfo: clientContractInfoSchema,
  uploadedFiles: uploadFilesSchema,
});

export type CreateClientFormData = z.infer<typeof createClientFormSchema>;
export type PrimaryContactFormData = z.infer<typeof primaryContactSchema>;
