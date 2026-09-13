import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { AuthGuard } from "@/components/AuthGuard";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SocketProvider } from "@/contexts/SocketProvider";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SocketProvider>
        <SidebarProvider
          style={{
            ["--sidebar-width" as string]: "16.5rem",
            ["--sidebar-width-icon" as string]: "4.25rem",
          }}
          className="h-dvh max-h-dvh w-full flex bg-transparent text-foreground antialiased overflow-hidden"
        >
          {/* Main Sidebar */}
          <Sidebar />

          {/* Main Workspace Area */}
          <SidebarInset className="flex-1 flex flex-col min-w-0 h-dvh max-h-dvh overflow-hidden bg-transparent text-foreground">
            {/* Unified Glassmorphism Header */}
            <Header />

            {/* Main Content Area - Primary Scrollable Viewport */}
            <div
              id="main-content"
              tabIndex={-1}
              className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden relative focus:outline-none"
            >
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </SocketProvider>
    </AuthGuard>
  );
}