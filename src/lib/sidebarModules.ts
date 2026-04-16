/**
 * SINGLE SOURCE OF TRUTH — Sidebar modules + permission keys
 *
 * Jab bhi sidebar mein route add/remove karo, permission list automatically update hogi.
 * CreateRole page yahan se modules padhta hai.
 * Sidebar component yahan se filter karta hai.
 */

export interface SidebarModule {
  name: string; // Display name in sidebar
  href: string; // Route path
  moduleKey: string; // Permission key — backend mein "set" field key
  alwaysVisible?: boolean; // Admin aur non-admin dono ko dikhega
}

export const SIDEBAR_MODULES: SidebarModule[] = [
  { name: "Home", href: "/", moduleKey: "home", alwaysVisible: true },
  { name: "Today's Tasks", href: "/today-tasks", moduleKey: "today_tasks", alwaysVisible: true },
  { name: "Clients", href: "/clients", moduleKey: "clients" },
  { name: "Jobs", href: "/jobs", moduleKey: "jobs" },
  { name: "Candidates", href: "/candidates", moduleKey: "candidates" },
  { name: "Recruitment Pipeline", href: "/reactruterpipeline", moduleKey: "pipeline" },
  { name: "Recruiter", href: "/recruiter", moduleKey: "recruiter" },
  { name: "Head Hunter", href: "/headhunter", moduleKey: "headhunter" },
  { name: "Temp Candidates", href: "/tem-candidates", moduleKey: "tem_candidates" },
  { name: "Team Members", href: "/teammembers", moduleKey: "teams" },
  { name: "User Access", href: "/user-access", moduleKey: "roles" },
  { name: "Settings", href: "/settings", moduleKey: "settings" },
  { name: "Administration", href: "/admin", moduleKey: "admin" },
];

/**
 * Sirf woh modules return karta hai jo permission matrix mein hote hain
 * (alwaysVisible wale skip hote hain — unhe permission set karne ki zaroorat nahi)
 */
export const PERMISSION_MODULES = SIDEBAR_MODULES.filter((m) => !m.alwaysVisible);
