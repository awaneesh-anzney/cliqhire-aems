/**
 * app/(protected)/layout.tsx — Protected Layout (Production Grade)
 *
 * FIX:
 *  QueryProvider yahan se HATA diya — root layout mein already hai
 *  Pehle dono jagah tha → duplicate React Query client → queries double fire hoti thi
 *
 *  AuthGuard yahan sahi jagah hai — sirf protected routes guard hongi
 */

import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { AuthGuard } from "@/components/AuthGuard";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SocketProvider } from "@/contexts/SocketProvider";

// Force fresh data on every request — SSR caching disable
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SocketProvider>
        {/* QueryProvider NAHI — root layout mein already hai */}
        <SidebarProvider
        style={{
          ["--sidebar-width" as string]: "16rem",
          ["--sidebar-width-icon" as string]: "4rem",
        }}
      >
        <Sidebar />
        <SidebarInset>
          <Header />
          <main className="flex-1 flex flex-col min-h-0 overflow-hidden bg-protected">
            <div className="flex-1 overflow-auto">{children}</div>
          </main>
        </SidebarInset>
      </SidebarProvider>
      </SocketProvider>
    </AuthGuard>
  );
}
