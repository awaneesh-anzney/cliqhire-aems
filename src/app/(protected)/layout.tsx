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
            ["--sidebar-width" as string]: "16rem",
            ["--sidebar-width-icon" as string]: "4rem",
          }}
          className="bg-[hsl(var(--protected-bg))] min-h-screen w-full !m-0 !p-0 flex text-foreground antialiased transition-colors duration-300"
        >
          {/* Main Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <SidebarInset className="!m-0 !p-0 !rounded-none !border-none !shadow-none flex-1 flex flex-col min-w-0 min-h-screen bg-[hsl(var(--protected-bg))] text-foreground">
            <Header />
            
            <main className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[hsl(var(--protected-bg))] !m-0 !p-0">
              <div className="flex-1 overflow-auto">
                {children}
              </div>
            </main>
          </SidebarInset>
        </SidebarProvider>
      </SocketProvider>
    </AuthGuard>
  );
}