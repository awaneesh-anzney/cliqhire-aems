/**
 * app/layout.tsx — Root Layout (Production Grade)
 *
 * FIX:
 *  QueryProvider yahan hai (root level) — (protected)/layout.tsx se hata diya
 *  Pehle dono jagah tha → React Query client double initialize hota tha
 *  → queries duplicate fire hoti thi page mount pe
 *
 * FONT UPDATE:
 *  Inter hata kar Plus Jakarta Sans use kiya — Inter system default
 *  fonts (Segoe UI / Helvetica) jaisa dikhta hai isliye farak notice
 *  nahi ho raha tha. Plus Jakarta Sans ka shape clearly distinct hai
 *  (rounder letterforms, distinct 'a' and 'g') — change turant dikhega.
 */

import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { PermissionProvider } from "@/contexts/PermissionContext";
import { QueryProvider } from "@/contexts/query-provider";
// Interceptors initialize karo — initializeAuth() nahi chalega yahan
import "@/lib/axios-config";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "CliqHire",
  description: "Recruitment Platform",
  icons: {
    icon: "/fluxxx.png"
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${jakarta.className} ${jakarta.variable} h-full min-h-screen bg-background text-foreground antialiased selection:bg-brand-primary/20 relative`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* Full Layout Brand Color Background at Full Opacity */}
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-brand transition-all duration-300"
          >
            {/* Ambient Lighting & High-end Subtle Glows */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/15 via-transparent to-transparent opacity-70" />
            <div className="absolute -top-32 -right-20 h-[36rem] w-[36rem] rounded-full bg-brand-secondary/25 blur-3xl" />
            <div className="absolute top-1/2 -left-20 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -bottom-32 right-1/4 h-[32rem] w-[32rem] rounded-full bg-brand-secondary/15 blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_40%,#000_70%,transparent_100%)] opacity-30" />
          </div>

          {/*
           * QueryProvider ek baar — yahan root level pe
           * (protected)/layout.tsx se QueryProvider HATAO
           */}
          <QueryProvider>
            <AuthProvider>
              <PermissionProvider>
                <Toaster />
                <div className="relative z-10 min-h-screen">
                  {children}
                </div>
              </PermissionProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}