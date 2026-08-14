 export interface ClientDetails {
  clientPriority: string;
  clientSegment: string;
  name: string;
  website?: string;
  industry?: string;
  location?: string;
  address?: string;
  incorporationDate?: string;
  countryOfRegistration?: string;
  lineOfBusiness?: string;
  registrationNumber?: string;
  countryOfBusiness?: string;
  description?: string;
  salesLead?: string;
  referredBy?: string;
  linkedInProfile?: string;
  clientLinkedInPage?: string;
  linkedInPage?: string;
  clientProfileImage?: string;
  profileImage?: string;
  crCopy?: {
    url: string;
    fileName: string;
  };
  vatCopy?: {
    url: string;
    fileName: string;
  };
  gstTinDocument?: {
    url: string;
    fileName: string;
  };
  nationalAddressCertificate?: {
    url: string;
    fileName: string;
  };
  phoneNumber?: string;
  googleMapsLink?: string;
  position?: string;
  email?: string;
  primaryContacts?: PrimaryContact[];
  labelType?: {
    seniorLevel?: string;
    executives?: string;
    nonExecutives?: string;
    other?: string;
  };
  seniorLevel?: string;
  executives?: string;
  nonExecutives?: string;
  other?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  emails?: string[];
}

 export interface PrimaryContact {
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
  phone: string;
  countryCode: string;
  position: string;
  linkedin: string;
}

 export interface TeamMemberType {
  name: string;
  role: string;
  email: string;
  isActive?: boolean;
}

export interface ContactType {
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  position: string;
}

//  Helper function to detect file type
export const getFileType = (fileName: string): "pdf" | "docx" | "image" | "other" => {
  if (!fileName) return "other";

  const extension = fileName.toLowerCase().split(".").pop();

  switch (extension) {
    case "pdf":
      return "pdf";
    case "docx":
    case "doc":
      return "docx";
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
    case "svg":
      return "image";
    default:
      return "other";
  }
};