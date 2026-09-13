/**
 * emailContactTypes.ts
 *
 * Types and pre-populated directory data for Client, Candidate, and Team stakeholder contacts.
 * Used for email address selection in the email module and composer.
 */

export type EmailContactType = "client" | "candidate" | "team";

export interface EmailContactItem {
  id: string;
  name: string;
  email: string;
  type: EmailContactType;
  roleOrCompany: string;
  status?: string;
  avatarColor?: string;
}

export const MOCK_EMAIL_CONTACTS: EmailContactItem[] = [
  // --- Client Contacts ---
  {
    id: "client-1",
    name: "Eleanor Vance",
    email: "e.vance@acmecorp.com",
    type: "client",
    roleOrCompany: "Acme Corporation • VP Engineering",
    status: "Active Client",
    avatarColor: "bg-blue-600 text-white",
  },
  {
    id: "client-2",
    name: "Thomas Sterling",
    email: "t.sterling@technovasolutions.com",
    type: "client",
    roleOrCompany: "TechNova Solutions • Talent Acquisition Director",
    status: "Active Client",
    avatarColor: "bg-indigo-600 text-white",
  },
  {
    id: "client-3",
    name: "Samantha Reed",
    email: "s.reed@globalscale.io",
    type: "client",
    roleOrCompany: "GlobalScale Systems • Head of People",
    status: "Active Client",
    avatarColor: "bg-cyan-600 text-white",
  },
  {
    id: "client-4",
    name: "Marcus Holloway",
    email: "holloway@apexpartners.net",
    type: "client",
    roleOrCompany: "Apex Partners • Managing Partner",
    status: "Active Client",
    avatarColor: "bg-teal-600 text-white",
  },
  {
    id: "client-5",
    name: "Chloe Dupont",
    email: "c.dupont@luminahealth.com",
    type: "client",
    roleOrCompany: "Lumina Health • HR Operations",
    status: "Lead / Prospect",
    avatarColor: "bg-sky-600 text-white",
  },

  // --- Candidate Contacts ---
  {
    id: "candidate-1",
    name: "Liam O'Connor",
    email: "liam.oconnor@devmail.io",
    type: "candidate",
    roleOrCompany: "Senior Full Stack Engineer",
    status: "Interviewing",
    avatarColor: "bg-emerald-600 text-white",
  },
  {
    id: "candidate-2",
    name: "Priya Patel",
    email: "priya.patel@techcandidate.org",
    type: "candidate",
    roleOrCompany: "Lead Data Scientist",
    status: "Offer Extended",
    avatarColor: "bg-purple-600 text-white",
  },
  {
    id: "candidate-3",
    name: "David Kim",
    email: "david.kim@engineerhub.net",
    type: "candidate",
    roleOrCompany: "Cloud Architect & DevOps",
    status: "Screening",
    avatarColor: "bg-amber-600 text-white",
  },
  {
    id: "candidate-4",
    name: "Amina Al-Mansoor",
    email: "amina.almansoor@clouddev.com",
    type: "candidate",
    roleOrCompany: "Principal Product Designer",
    status: "Sourced",
    avatarColor: "bg-rose-600 text-white",
  },
  {
    id: "candidate-5",
    name: "Lucas Meyer",
    email: "lucas.meyer@backendcraft.de",
    type: "candidate",
    roleOrCompany: "Go / Distributed Systems Specialist",
    status: "Technical Assessment",
    avatarColor: "bg-orange-600 text-white",
  },

  // --- Team Member Contacts ---
  {
    id: "team-1",
    name: "Sarah Connor",
    email: "sarah.connor@cliqhire.com",
    type: "team",
    roleOrCompany: "CliqHire • Lead Technical Recruiter",
    status: "Online",
    avatarColor: "bg-violet-600 text-white",
  },
  {
    id: "team-2",
    name: "David Miller",
    email: "david.miller@cliqhire.com",
    type: "team",
    roleOrCompany: "CliqHire • Senior Account Manager",
    status: "In a meeting",
    avatarColor: "bg-fuchsia-600 text-white",
  },
  {
    id: "team-3",
    name: "Rachel Green",
    email: "rachel.green@cliqhire.com",
    type: "team",
    roleOrCompany: "CliqHire • Sourcing Specialist",
    status: "Online",
    avatarColor: "bg-pink-600 text-white",
  },
  {
    id: "team-4",
    name: "Alex Morgan",
    email: "alex.morgan@cliqhire.com",
    type: "team",
    roleOrCompany: "CliqHire • Talent Operations Lead",
    status: "Online",
    avatarColor: "bg-blue-700 text-white",
  },
  {
    id: "team-5",
    name: "Karan Sharma",
    email: "karan.sharma@cliqhire.com",
    type: "team",
    roleOrCompany: "CliqHire • Recruitment Coordinator",
    status: "Away",
    avatarColor: "bg-slate-700 text-white",
  },
];

export const EMAIL_TYPE_CONFIG: Record<
  EmailContactType,
  {
    label: string;
    singularLabel: string;
    description: string;
    badgeColor: string;
    iconColor: string;
  }
> = {
  client: {
    label: "Client Emails",
    singularLabel: "Client",
    description: "Hiring managers & client company contacts",
    badgeColor: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/40",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  candidate: {
    label: "Candidate Emails",
    singularLabel: "Candidate",
    description: "Active talent pool & prospective applicants",
    badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  team: {
    label: "Team Emails",
    singularLabel: "Team",
    description: "Internal team members, recruiters & staff",
    badgeColor: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/40",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
};
