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
          className="h-screen w-full flex bg-background text-foreground antialiased overflow-hidden !m-0 !p-0"
        >
          {/* Main Sidebar */}
          <Sidebar />

          {/* Main Workspace Area */}
          <SidebarInset className="!m-0 !p-0 !rounded-none !border-none !shadow-none flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-background text-foreground">
            {/* Unified Glassmorphism Header */}
            <Header />

            {/* Main Page Viewport Container */}
            <main className="flex-1 flex flex-col min-h-0 overflow-hidden bg-background !m-0 !p-0 relative">
              <div className="flex-1 min-h-0 overflow-hidden">
                {children}
              </div>
            </main>
          </SidebarInset>
        </SidebarProvider>
      </SocketProvider>
    </AuthGuard>
  );
}