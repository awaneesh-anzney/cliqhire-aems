# CliqHire — Agency & Enterprise Management System (AEMS)

<div align="center">

![CliqHire Banner](public/cliqhire-f.png)

**Enterprise-grade Applicant Tracking System (ATS) & Recruitment CRM**  
*Built for staffing agencies, headhunters, and high-velocity talent acquisition teams.*

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-FF4154?style=for-the-badge&logo=react-query&logoColor=white)](https://tanstack.com/query)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![License](https://img.shields.io/badge/License-Proprietary-orange?style=for-the-badge)](#)

</div>

---

## 📖 Table of Contents

1. [Overview](#-overview)
2. [Key Capabilities & Modules](#-key-capabilities--modules)
3. [Technology Stack](#-technology-stack)
4. [Architecture & Design Patterns](#-architecture--design-patterns)
5. [Complete Project Structure](#-complete-project-structure)
6. [UI Component Hierarchy](#-ui-component-hierarchy)
7. [Getting Started & Local Setup](#-getting-started--local-setup)
8. [Environment Variables](#-environment-variables)
9. [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
10. [Real-Time Collaboration & Email Engine](#-real-time-collaboration--email-engine)
11. [Development Guidelines](#-development-guidelines)
12. [Scripts & Build Commands](#-scripts--build-commands)

---

## 🌟 Overview

**CliqHire** is a modern, full-stack recruitment operating system engineered to streamline every stage of the talent acquisition lifecycle. Designed with high-throughput staffing agencies and enterprise recruitment teams in mind, CliqHire brings candidate tracking, client relationship management, recruiter pipelines, headhunting workflows, contracts, real-time collaboration, and an integrated email client under a single unified platform.

The frontend is architected using **Next.js 14 (App Router)**, **TypeScript**, **Radix UI**, **shadcn/ui**, and **Tailwind CSS**, paired with **TanStack Query v5** for optimistic server-state management and **Socket.IO** for live real-time event streaming.

---

## 🚀 Key Capabilities & Modules

### 1. 🎯 Recruitment Pipeline & Kanban Board
- **Visual Multi-Stage Tracking**: Drag-and-drop / stage transition workflow (Sourcing, Screening, Internal Interview, Client Submission, Interviewing, Offer, Placement, Disqualification).
- **Candidate Progression**: Instant status transitions with audit logs, note attachments, and disqualification reason tracking.
- **KPI Metrics**: Real-time pipeline health indicators, stage conversion rates, and time-to-hire counters.

### 2. 👥 Candidate & Talent Pool Management
- **Dual Display Modes**: Toggle between dense high-information Table View and visual Card Grid View.
- **Candidate Profiles**: Comprehensive detail views covering Contact Info, Work Experience, Skills Taxonomy, Education, Attachments, Notes, and Activity logs.
- **Duplicate Prevention**: Automated duplicate detection by phone, email, and identity during creation.
- **Resume Upload & Parsing**: Cloudinary and local PDF viewing (`pdfjs-dist`) with document preview modal.
- **Temporary Talent Pool**: Dedicated temporary candidate repository for quick contingency staffing.

### 3. 🏢 Client CRM & Account Operations
- **Account Hierarchy**: Manage Leads, Active Clients, and Client Groups with parent-child relationship tracking.
- **Contracts Engine**: Support for multiple billing models — Permanent Placement, Consulting Services, and Outsourcing Contracts.
- **Contact Directory**: Multi-contact directory per client with primary contact flags and role designations.
- **Client Job Orders**: Real-time cross-link to all open, in-progress, and fulfilled requisitions per account.

### 4. 💼 Job Requisition & Headcount Management
- **Lifecycle Tracking**: Track requisition open date, target closing date, headcount targets, minimum/maximum compensation ranges, and priority.
- **Rich-Text Description Editor**: Powered by Lexical & TipTap editors for formatted job specs and requirements.
- **Hiring Team Assignment**: Assign Internal Account Owners, Recruiters, and Client Primary Contacts.
- **LinkedIn Integration**: Quick post dialog and candidate sourcing hooks.

### 5. 🕵️ Headhunter & Sourcing Portal
- **Headhunter Workspace**: Dedicated sourcing interface for specialized search firms and external recruitment partners.
- **Candidate Domain Matching**: Automated domain tagging and recruiter attribution.
- **Performance & Quotas**: Metric tracking for candidate referral velocity and placement commissions.

### 6. 📬 Integrated Email Client
- **Full In-App Email Client**: Threaded inbox, Sent, Drafts, and Trash management.
- **Smart Recipient Resolution**: `/api/email/emails/:id/reply-info` integration to automatically resolve Reply vs. Reply-All recipients (To, Cc, Bcc chips) with duplicate removal.
- **Templates & Signatures**: Rich HTML email templates with personalized signatures and attachment support (`multipart/form-data`).

### 7. ⚡ Real-Time Collaboration & WebSockets
- **Live Notifications**: Instant push alerts via Socket.IO connection.
- **Cache Invalidation**: Automatic invalidation of TanStack Query caches (`my-tasks`, `notifications`, `pipeline`) when socket events fire.
- **To-Do & Task Management**: Real-time synchronized daily tasks with calendar scheduling and team delegation.

### 8. 🛡️ Enterprise RBAC & Permissions
- **Granular Permissions**: Action-level access controls (`view`, `create`, `edit`, `delete`) per module.
- **Role Hierarchy**: System Administrator, Recruiter, Hiring Manager, Team Lead, and Client Guests.
- **Dynamic Module Visibility**: Centralized `SIDEBAR_MODULES` and `PermissionContext` ensure navigation automatically mirrors role entitlements.

### 9. 🌐 External Client Portal
- **Client-Facing Dashboard**: Dedicated client portal (`/client` & `/(client-d)`) allowing hiring clients to review shortlisted CVs, schedule client interviews, and approve placements.

### 10. 📊 Analytics, Finance & Exporting
- **Executive Dashboard**: Visual metrics powered by Chart.js, covering job pipeline breakdowns and placement velocity.
- **Finance Hub**: Invoice management, contractor billing, and fee realization tracking.
- **Data Exporting**: Universal export modal (`ExportDialog`) supporting candidate, job, client, and user exports.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Framework** | [Next.js 14.2](https://nextjs.org/) (App Router, Server & Client Components) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode) |
| **UI Library** | [React 18.2](https://react.dev/) |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/), `tailwindcss-animate`, Custom Design Tokens |
| **UI Primitives** | [Radix UI](https://www.radix-ui.com/), [shadcn/ui](https://ui.shadcn.com/), [Lucide React](https://lucide.dev/) |
| **Typography** | [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) |
| **Server State** | [TanStack React Query v5](https://tanstack.com/query) + Devtools |
| **Client State** | [Zustand 5](https://github.com/pmndrs/zustand) + React Context API |
| **Real-time WebSockets** | [Socket.io Client 4.8](https://socket.io/) |
| **HTTP Client** | [Axios 1.7](https://axios-http.com/) (Centralized Interceptors & Token Handling) |
| **Forms & Validation** | [React Hook Form 7](https://react-hook-form.com/), [Zod 3.24](https://zod.dev/), `@hookform/resolvers` |
| **Rich Text Editors** | [Lexical 0.33](https://lexical.dev/) & [TipTap 2.11](https://tiptap.dev/) |
| **Drag & Drop** | [@dnd-kit/core](https://dndkit.com/), `@dnd-kit/sortable`, `@dnd-kit/utilities` |
| **Charts & Data Viz** | [Chart.js 4.4](https://www.chartjs.org/), `react-chartjs-2` |
| **Document & Media** | [PDF.js (`pdfjs-dist`)](https://mozilla.github.io/pdf.js/), Cloudinary API |
| **Notifications** | [Sonner 2.0](https://sonner.emilkowal.ski/), `react-toastify` |
| **Theming** | [next-themes](https://github.com/pacocoursey/next-themes) (Dark / Light / System) |

---

## 🏛️ Architecture & Design Patterns

### 1. App Router Route Groups
The Next.js 14 routing model uses structured route groups to isolate layout behaviors:
- `app/(protected)/`: Authenticated internal application with Sidebar, Header, Global Search, and RBAC guards.
- `app/(auth)/`: Unauthenticated login, registration, password recovery, and onboarding flows.
- `app/(client-d)/` & `app/client/`: External client portal dashboard and dedicated client login.
- `app/(form)/`: Standalone candidate application and external registration forms.
- `app/(landing)/`: Public landing page, product workflow, feature highlights, and pricing.

### 2. Multi-Tier State Architecture
```
┌────────────────────────────────────────────────────────┐
│                   Browser Viewport                     │
├────────────────────────────────────────────────────────┤
│  UI Components (shadcn/ui + Radix UI + Lucide Icons)   │
├────────────────────────────────────────────────────────┤
│  Custom React Hooks (35+ domain-specific hooks)        │
├──────────────────────────┬─────────────────────────────┤
│  Server State            │  Global Contexts            │
│  TanStack Query v5       │  • AuthContext (JWT/User)   │
│  (Caching & Mutations)   │  • PermissionContext (RBAC) │
│                          │  • SocketProvider (Events)  │
│                          │  • ThemeProvider (Dark/Lt)  │
├──────────────────────────┴─────────────────────────────┤
│  Services Layer (39 Axios-based API services)          │
├────────────────────────────────────────────────────────┤
│  HTTP Client (Axios interceptor + Auth Headers)        │
└────────────────────────────────────────────────────────┘
```

### 3. Centralized Service Layer
All network communications are decoupled from UI components and encapsulated into modular services under `src/services/`. Every service defines standard types, response wrappers, and clean asynchronous functions.

### 4. Custom Hook Layer
Feature logic is encapsulated into dedicated custom hooks in `src/hooks/` combining TanStack Query (`useQuery`, `useMutation`), local caching, and optimistic UI updates.

### 5. Single Source of Truth Permissions
`src/lib/sidebarModules.ts` defines all application modules and their corresponding backend permission keys. Both the navigation menu (`sidebar.tsx`) and the role permission editor dynamically compute module rights from this single configuration.

---

## 📂 Complete Project Structure

```
cliqhire-aems/
├── public/                       # Static public assets, logos, and favicons
├── src/
│   ├── app/                      # Next.js 14 App Router
│   │   ├── (auth)/               # Internal authentication routes
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   │
│   │   ├── (client-d)/           # External client portal dashboard
│   │   │   ├── layout.tsx
│   │   │   └── dashboards/page.tsx
│   │   │
│   │   ├── (form)/               # Public candidate submission forms
│   │   │   ├── layout.tsx
│   │   │   └── candidate/page.tsx
│   │   │
│   │   ├── (landing)/            # Public marketing landing pages
│   │   │   ├── layout.tsx
│   │   │   └── landing/page.tsx
│   │   │
│   │   ├── (protected)/          # Protected internal recruitment modules
│   │   │   ├── layout.tsx        # Protected layout (Sidebar, Header, Guard)
│   │   │   ├── activities/       # Activity tracking & timeline
│   │   │   ├── admin/            # Platform administration & roles
│   │   │   ├── candidates/       # Candidate directory & detail profiles ([id])
│   │   │   ├── client-groups/    # Client group parent-child management
│   │   │   ├── clients/          # Client CRM, contracts, & contacts ([id])
│   │   │   ├── dashboard/        # Operational KPI dashboards & charts
│   │   │   ├── email/            # In-app email client (inbox, threads, compose)
│   │   │   ├── finance/          # Billing, invoices, and expenses
│   │   │   ├── headhunter/       # Headhunter candidate sourcing workspace
│   │   │   ├── inbox/            # System messages & communications
│   │   │   ├── jobs/             # Job requisitions & detail pages ([id])
│   │   │   ├── leads/            # Sales leads & prospect conversions
│   │   │   ├── notifications/    # Notifications center
│   │   │   ├── placements/       # Confirmed candidate placements
│   │   │   ├── profile/          # User profile & credentials
│   │   │   ├── reactruterpipeline/# Recruiter pipeline kanban ([id])
│   │   │   ├── recruiter/        # Recruiter performance & assignment
│   │   │   ├── reports/          # Business intelligence & reports
│   │   │   ├── settings/         # Organization & system settings
│   │   │   ├── teammembers/      # Team member management & invitations
│   │   │   ├── tem-candidates/   # Contingent / temp talent pool
│   │   │   └── todo/             # Personal & team task manager
│   │   │
│   │   ├── client/               # External client auth routes
│   │   │   └── login/page.tsx
│   │   │
│   │   ├── globals.css           # Global Tailwind CSS and design tokens
│   │   ├── layout.tsx            # Global Root Layout (Providers & Fonts)
│   │   ├── not-found.tsx         # Custom 404 error page
│   │   └── page.tsx              # Root index router
│   │
│   ├── components/               # React UI Components
│   │   ├── ui/                   # 30+ Radix UI / shadcn base primitives
│   │   ├── candidates/           # Candidate filters, modals, cards, summary tabs
│   │   ├── clients/              # Client summary, contracts, contacts, notes
│   │   ├── jobs/                 # Job modals, salary editor, team picker, tabs
│   │   ├── Recruiter-Pipeline/   # Pipeline cards, stage badges, stage modal details
│   │   ├── Recruitment-Pipeline/ # Pipeline view tabs & candidate dialogs
│   │   ├── Headhunter-Pipeline/  # Headhunter candidate management components
│   │   ├── Referred/             # Candidate referral modules
│   │   ├── email/                # Email composer, reply dialog, thread viewer
│   │   ├── create-client-modal/  # Multi-step client onboarding wizard
│   │   ├── create-teamMembers-modal/ # Team member creation modal
│   │   ├── contract-forms/       # Business, consulting, & outsourcing forms
│   │   ├── new-jobs/             # New job requisition modal & forms
│   │   ├── landing/              # Landing hero, navbar, pricing, features, footer
│   │   ├── client/               # Client portal KPI, topnav, tables
│   │   ├── client-external/      # External client registration & login
│   │   ├── common/               # Universal export, share, position dialogs
│   │   ├── today-tasks/          # Calendar, task cards, task filters
│   │   ├── teamMembers/          # Member tables, status badges, permissions
│   │   ├── user-Access/          # Permission matrices & user privileges
│   │   ├── user-profile/         # User profile modal and settings
│   │   ├── AuthGuard.tsx         # Client-side route protection guard
│   │   ├── global-search.tsx     # Command-K universal application search
│   │   ├── NotificationDropdown.tsx # Real-time notification popover
│   │   ├── header.tsx            # Application top navigation bar
│   │   └── sidebar.tsx           # Dynamic RBAC-aware collapsible sidebar
│   │
│   ├── contexts/                 # Global React Contexts
│   │   ├── AuthContext.tsx       # User authentication, tokens, and sessions
│   │   ├── PermissionContext.tsx # Dynamic role permission evaluation
│   │   ├── SocketProvider.tsx    # Live WebSocket connection & events
│   │   └── query-provider.tsx    # TanStack Query client & devtools provider
│   │
│   ├── hooks/                    # 35+ Domain-Specific Custom React Hooks
│   │   ├── useCandidate.ts       # Candidate CRUD and queries
│   │   ├── useClient.ts          # Client CRM operations
│   │   ├── useJobs.ts            # Job orders and listings
│   │   ├── useRecruiterPipeline.ts # Pipeline stage actions
│   │   ├── useEmail.ts           # Email inbox, send, and replies
│   │   ├── useNotifications.ts   # Live notification stream
│   │   ├── usePersonalTasks.ts   # To-Do and personal tasks
│   │   ├── useExportCandidates.ts# Universal data export
│   │   └── ...                   # Additional feature hooks
│   │
│   ├── services/                 # 39 API Services (Axios Integration)
│   │   ├── authService.ts        # Login, register, token refresh
│   │   ├── candidateService.ts   # Candidate APIs
│   │   ├── clientService.ts      # Client management APIs
│   │   ├── jobService.ts         # Job requisition APIs
│   │   ├── recruiterPipelineService.ts # Recruiter pipeline workflows
│   │   ├── emailService.ts       # Mailbox, send, reply-info, threads
│   │   ├── notificationService.ts# Notification queries & mark-read
│   │   ├── roleService.ts        # RBAC role queries & permissions
│   │   ├── taskService.ts        # Tasks and to-do endpoints
│   │   ├── headhunterService.ts  # Headhunter workflows
│   │   └── ...                   # Additional domain services
│   │
│   ├── types/                    # TypeScript interfaces & declarations
│   │   ├── candidate.ts
│   │   ├── client.ts
│   │   ├── job.ts
│   │   ├── email.ts
│   │   ├── teamMember.ts
│   │   └── search.ts
│   │
│   └── lib/                      # Shared libraries & utilities
│       ├── axios-config.ts       # Axios instance with auth interceptors
│       ├── sidebarModules.ts     # Single source of truth for sidebar & RBAC
│       ├── constants.ts          # Global app constants
│       └── utils.ts              # Class merging utilities (`cn`)
│
├── middleware.ts                 # Next.js edge request routing
├── next.config.mjs               # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS design system tokens
├── tsconfig.json                 # TypeScript compiler configuration
└── package.json                  # Dependencies and scripts
```

---

## 📐 UI Component Hierarchy

### Root Application Composition
```
RootLayout (app/layout.tsx)
├── ThemeProvider (Dark / Light / System Theme)
├── AuthProvider (User Session & Token State)
├── PermissionProvider (RBAC Permissions Matrix)
├── QueryProvider (TanStack React Query Cache)
├── Toaster (Sonner & Notification Alerts)
└── {Route Group Layout}
    │
    ├── (auth)/layout.tsx
    │   └── Login / Register / Forgot Password / Reset Password
    │
    ├── (landing)/layout.tsx
    │   ├── Navbar
    │   ├── Hero
    │   ├── Features & Workflow
    │   ├── Pricing
    │   └── Footer
    │
    ├── (client-d)/layout.tsx
    │   ├── ClientTopNav
    │   └── Client Dashboard Views
    │
    └── (protected)/layout.tsx
        ├── AuthGuard (Authentication Verification)
        └── SocketProvider (WebSocket Connection)
            └── SidebarProvider
                ├── Sidebar (Dynamic RBAC Modules)
                │   ├── SidebarHeader (Brand Logo)
                │   ├── SidebarContent (SIDEBAR_MODULES)
                │   └── SidebarFooter (User Badge)
                └── SidebarInset
                    ├── Header
                    │   ├── SidebarTrigger
                    │   ├── GlobalSearch (Cmd+K)
                    │   ├── ModeToggle (Dark/Light)
                    │   ├── NotificationDropdown (Live Socket Alerts)
                    │   └── UserAvatar & Profile Menu
                    └── <main>
                        └── {Active Protected Page}
```

---

## ⚡ Getting Started & Local Setup

### Prerequisites
- **Node.js**: `v18.17.0` or higher (Recommended: Node 20 LTS)
- **Package Manager**: `npm` (v9+), `yarn`, or `pnpm`
- **Backend API**: Running instance of `aems-backend` or configured remote endpoint

### 1. Clone the Repository
```bash
git clone https://github.com/awaneesh-anzney/cliqhire-aems.git
cd cliqhire-aems
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```
*(Configure values as outlined in the [Environment Variables](#-environment-variables) section).*

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Environment Variables

The following environment variables configure the application:

| Variable | Required | Default / Example | Purpose |
|---|:---:|---|---|
| `NEXT_PUBLIC_API_URL` | **Yes** | `https://aems-backend-v1.onrender.com` | Base REST API & WebSocket endpoint |
| `FRONTEND_URL` | **Yes** | `http://localhost:3000` | Application host for invitation & reset links |
| `CLOUDINARY_CLOUD_NAME`| Optional | `dxkhyfdhd` | Cloudinary cloud name for CV and file uploads |
| `CLOUDINARY_API_KEY` | Optional | `468214242775917` | Cloudinary client API key |
| `CLOUDINARY_API_SECRET` | Optional | `lR-o7L5_kGn0mqSsc3vefkC-6Qc` | Cloudinary API secret |
| `PORT` | Optional | `5000` | Port allocation for custom local server configurations |

> [!NOTE]
> The WebSocket connection in `SocketProvider.tsx` automatically resolves its socket host from `NEXT_PUBLIC_API_URL`, stripping any trailing `/api` path.

---

## 🛡️ Role-Based Access Control (RBAC)

CliqHire enforces an enterprise-grade authorization matrix:

1. **Role Profiles**:
   - **Super Admin**: Unrestricted read/write/delete access across all modules.
   - **Hiring Manager**: Access to Jobs, Pipelines, Candidates, and Placements.
   - **Team Lead**: Access to assigned team pipelines, tasks, and team member metrics.
   - **Recruiter**: Access to candidate sourcing, pipeline stages, to-do lists, and email client.
   - **Client Guest**: Limited access to candidate submissions and review stages via the client portal.

2. **Permission Evaluation**:
   Components query the permission matrix using the `usePermissions` hook:
   ```tsx
   import { usePermissions } from "@/contexts/PermissionContext";

   const { hasPermission } = usePermissions();

   if (hasPermission("candidates", "delete")) {
     // Render delete action button
   }
   ```

3. **Dynamic Navigation**:
   Modules registered in `src/lib/sidebarModules.ts` are automatically filtered against the authenticated user's permission set.

---

## 📨 Real-Time Collaboration & Email Engine

### Socket.IO Integration
- Connected automatically upon authentication in `SocketProvider.tsx`.
- **Live Event Invalidation**:
  - `task:created` / `task:updated` ➔ Auto-refetches `['my-tasks']`.
  - `notification:new` ➔ Triggers toast notification via `sonner` and refetches `['notifications']` and `['notifications', 'unread-count']`.

### Full-Featured Email Client
- **Reply / Reply-All Protocol**:
  - Calls `GET /api/email/emails/:id/reply-info?mode=reply|replyAll`.
  - Intelligently filters self-address and duplicates.
  - Automatically toggles the **Reply All** button based on `hasMultipleRecipients`.
  - Prefills editable recipient chips (To, Cc, Bcc).
- **Multipart Sending**:
  - `POST /api/email/send` accepts HTML markup, recipient arrays, and attachments via `multipart/form-data`.

---

## 📐 Development Guidelines

### Adding a New Protected Feature
1. **Define Route**: Create `src/app/(protected)/[feature]/page.tsx`.
2. **Register Module**: Add entry to `SIDEBAR_MODULES` in `src/lib/sidebarModules.ts` if it requires menu navigation and RBAC.
3. **Build API Service**: Implement clean REST methods in `src/services/[feature]Service.ts`.
4. **Implement React Query Hook**: Create `src/hooks/use[Feature].ts` using TanStack Query.
5. **Construct UI Components**: Place modular components in `src/components/[feature]/`.

### Code Quality & Standards
- **Component Design**: Favor composable, accessible components using Radix UI primitives.
- **Strict Typing**: All service payloads and hook responses must be strongly typed with TypeScript.
- **Styling**: Use utility classes with `cn()` (`clsx` + `tailwind-merge`) for conditional class composition.

---

## 📜 Scripts & Build Commands

```bash
# Start local development server with Turbopack / Next.js
npm run dev

# Run ESLint validation
npm run lint

# Compile production build
npm run build

# Start production server
npm run start
```

---

<div align="center">

**CliqHire ATS / AEMS** • Developed with Next.js, React & TypeScript  
© 2026 CliqHire Inc. All rights reserved.

</div>
