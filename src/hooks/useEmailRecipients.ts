import { useInfiniteQuery } from "@tanstack/react-query";
import { emailService } from "@/services/emailService";
import { EmailContactItem, EmailContactType, MOCK_EMAIL_CONTACTS } from "@/types/emailContactTypes";

export function useEmailRecipients(
  frontendType: EmailContactType,
  searchQuery: string = "",
  options?: { rawClients?: boolean }
) {
  // Map frontend "team" to backend "user"
  const backendType = frontendType === "team" ? "user" : frontendType;

  return useInfiniteQuery({
    queryKey: ["email-recipients", backendType, searchQuery, options?.rawClients],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const response = await emailService.getEmailRecipients({
          type: backendType as "client" | "candidate" | "user",
          search: searchQuery.trim(),
          page: pageParam,
          limit: 20,
        });

        const mappedContacts: any[] = [];
        let fetchedItemsCount = 0;
        let totalCount = 0;

        if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
          fetchedItemsCount = response.data.length;
          totalCount = response.total ?? response.count ?? response.data.length;
          response.data.forEach((item: any) => {
            if (backendType === "user") {
              mappedContacts.push({
                id: item._id,
                name: `${item.firstName || ""} ${item.lastName || ""}`.trim() || item.name || "Team Member",
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
              if (options?.rawClients) {
                // Push the raw client object to allow UI to visually group company emails and primary contacts
                mappedContacts.push(item);
              } else {
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
            }
          });

          return { contacts: mappedContacts, count: fetchedItemsCount, total: totalCount };
        }

        // Fallback to MOCK_EMAIL_CONTACTS matching frontendType if API response is empty on first page
        if (pageParam === 1) {
          const fallback = MOCK_EMAIL_CONTACTS.filter((c) => c.type === frontendType);
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            if (backendType === "client" && options?.rawClients) {
              // For client fallback, format mock data into group shape
              const groupedFallback = fallback.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))
                .map(c => ({
                  _id: c.id,
                  name: c.roleOrCompany.split(" • ")[0] || c.name,
                  emails: [c.email],
                  primaryContacts: []
                }));
              return { contacts: groupedFallback, count: fallback.length, total: groupedFallback.length };
            }
            const filteredFallback = fallback.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
            return { contacts: filteredFallback, count: fallback.length, total: filteredFallback.length };
          }
          if (backendType === "client" && options?.rawClients) {
            const groupedFallback = fallback.map(c => ({
              _id: c.id,
              name: c.roleOrCompany.split(" • ")[0] || c.name,
              emails: [c.email],
              primaryContacts: []
            }));
            return { contacts: groupedFallback, count: fallback.length, total: groupedFallback.length };
          }
          return { contacts: fallback, count: fallback.length, total: fallback.length };
        }
        
        return { contacts: [], count: 0, total: 0 };
      } catch {
        // Fallback gracefully on network / server error
        if (pageParam === 1) {
          const fallback = MOCK_EMAIL_CONTACTS.filter((c) => c.type === frontendType);
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            if (backendType === "client" && options?.rawClients) {
              const groupedFallback = fallback.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))
                .map(c => ({
                  _id: c.id,
                  name: c.roleOrCompany.split(" • ")[0] || c.name,
                  emails: [c.email],
                  primaryContacts: []
                }));
              return { contacts: groupedFallback, count: fallback.length, total: groupedFallback.length };
            }
            const filteredFallback = fallback.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
            return { contacts: filteredFallback, count: fallback.length, total: filteredFallback.length };
          }
          if (backendType === "client" && options?.rawClients) {
            const groupedFallback = fallback.map(c => ({
              _id: c.id,
              name: c.roleOrCompany.split(" • ")[0] || c.name,
              emails: [c.email],
              primaryContacts: []
            }));
            return { contacts: groupedFallback, count: fallback.length, total: groupedFallback.length };
          }
          return { contacts: fallback, count: fallback.length, total: fallback.length };
        }
        
        return { contacts: [], count: 0, total: 0 };
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      // If the last page returned exactly 20 original items, there might be a next page
      if (lastPage.count === 20) {
        return allPages.length + 1;
      }
      return undefined;
    },
    // Don't refetch on window focus as this might be typed into frequently
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

