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
    icon: "/cliqhire-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${jakarta.className} ${jakarta.variable}`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/*
           * QueryProvider ek baar — yahan root level pe
           * (protected)/layout.tsx se QueryProvider HATAO
           */}
          <QueryProvider>
            <AuthProvider>
              <PermissionProvider>
                <Toaster />
                {children}
              </PermissionProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}