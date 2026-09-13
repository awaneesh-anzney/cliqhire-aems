import { useQuery } from "@tanstack/react-query";
import { emailService } from "@/services/emailService";
import { EmailContactItem, EmailContactType } from "@/types/emailContactTypes";

export function useEmailRecipients(
  frontendType: EmailContactType,
  searchQuery: string = ""
) {
  // Map frontend "team" to backend "user"
  const backendType = frontendType === "team" ? "user" : frontendType;

  return useQuery({
    queryKey: ["email-recipients", backendType, searchQuery],
    queryFn: async () => {
      const response = await emailService.getEmailRecipients({
        type: backendType as "client" | "candidate" | "user",
        search: searchQuery.trim(),
        limit: frontendType === "team" && !searchQuery.trim() ? 200 : 20, // Load all users if no search
      });

      const mappedContacts: EmailContactItem[] = [];

      response.data.forEach((item: any) => {
        if (backendType === "user") {
          mappedContacts.push({
            id: item._id,
            name: `${item.firstName} ${item.lastName}`.trim(),
            email: item.email,
            type: "team",
            roleOrCompany: `${item.department || "Organization"} • ${item.teamRole || "Team Member"}`,
            status: item.status,
          });
        } else if (backendType === "candidate") {
          mappedContacts.push({
            id: item._id,
            name: item.name,
            email: item.email,
            type: "candidate",
            roleOrCompany: item.roleOrCompany || item.experience || "Candidate",
            status: item.status,
          });
        } else if (backendType === "client") {
          if (searchQuery.trim() && item.primaryContacts && item.primaryContacts.length > 0) {
            // Search Mode (Mode C) - Return the primary contacts
            item.primaryContacts.forEach((contact: any) => {
              mappedContacts.push({
                id: contact._id,
                name: contact.name,
                email: contact.email,
                type: "client",
                roleOrCompany: `${item.name} • ${contact.designation || "Primary Contact"}`,
                status: "Active Client",
              });
            });
            // Optionally, add the company's general email as well if needed
            if (item.emails && item.emails[0]) {
              mappedContacts.push({
                id: item._id,
                name: item.name,
                email: item.emails[0],
                type: "client",
                roleOrCompany: "Company Email",
                status: "Active Client",
              });
            }
          } else {
            // Browse Mode (Mode A) - Return the company general email
            if (item.emails && item.emails.length > 0) {
              mappedContacts.push({
                id: item._id,
                name: item.name,
                email: item.emails[0],
                type: "client",
                roleOrCompany: "Client Company",
                status: "Active Client",
              });
            }
          }
        }
      });

      return mappedContacts;
    },
    // Don't refetch on window focus as this might be typed into frequently
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
