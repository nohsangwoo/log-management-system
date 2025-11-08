import type React from "react"
import { Plus_Jakarta_Sans } from "next/font/google"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { ClientBootstrap } from "@/components/client-bootstrap"
import "./globals.css"

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
})

export const metadata = {
  title: "일지 관리 시스템",
  description: "자동화된 일지 관리 시스템",
    generator: 'ludgi'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${plusJakarta.className} nice-scrollbar`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* 글로벌 배경 */}
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 -z-10"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
            <div className="absolute inset-0 bg-grid opacity-[0.35]" />
          </div>
          <SidebarProvider>
            <div className="flex h-screen">
              <AppSidebar />
              <main className="flex-1 overflow-y-auto p-6 md:p-8">
                {children}
              </main>
              <Toaster />
            </div>
          </SidebarProvider>
        </ThemeProvider>
        <ClientBootstrap />
      </body>
    </html>
  )
}

