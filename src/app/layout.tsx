import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/AuthContext"
import { PermissionProvider } from "@/contexts/PermissionContext"
import '@/lib/axios-config'; // Initialize global axios interceptors
import { QueryProvider } from "@/contexts/query-provider";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CliqHire",
  description: "Recruitment Platform",
  icons: {
    icon: "/cliqhire-icon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className } suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <PermissionProvider>
              <QueryProvider>
                <Toaster />
                {children}
              </QueryProvider>
            </PermissionProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

