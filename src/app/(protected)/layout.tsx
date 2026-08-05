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
          className="bg-[#7ce0ad] min-h-screen w-full !m-0 !p-0 flex"
        >
          <Sidebar />
          
          {/* 
            FIX: !m-0, !p-0, !rounded-none, !border-none, !shadow-none 
            Completely removes default Shadcn SidebarInset margins, paddings, borders, and rounded corners.
          */}
          <SidebarInset className="!m-0 !p-0 !rounded-none !border-none !shadow-none flex-1 flex flex-col min-w-0 min-h-screen bg-[#7ce0ad]">
            <Header />
            <main className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#7ce0ad] !m-0 !p-0">
              <div className="flex-1 overflow-auto">{children}</div>
            </main>
          </SidebarInset>
        </SidebarProvider>
      </SocketProvider>
    </AuthGuard>
  );
}