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
          className="bg-[#7ce0ad]" // Aapke green theme ka base color
        >
          <Sidebar />
          
          {/* 
            FIX: !m-0, !rounded-none, !border-none 
            Ye shadcn SidebarInset ke margins & rounded corners ko completely kill kar dega.
          */}
          <SidebarInset className="!m-0 !p-0 !rounded-none !border-none !shadow-none flex-1 flex flex-col min-w-0 bg-[#7ce0ad]">
            <Header />
            <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-auto">{children}</div>
            </main>
          </SidebarInset>
        </SidebarProvider>
      </SocketProvider>
    </AuthGuard>
  );
}