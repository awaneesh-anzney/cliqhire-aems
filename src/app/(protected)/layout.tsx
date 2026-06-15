import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { AuthGuard } from "@/components/AuthGuard";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SidebarProvider
        style={{ ["--sidebar-width" as any]: "16rem", ["--sidebar-width-icon" as any]: "4rem" }}
      >
        <Sidebar />
        <SidebarInset>
          <Header />
          <main className="flex-1 flex flex-col min-h-0 overflow-hidden bg-protected">
            <div className="flex-1 overflow-auto">{children}</div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
