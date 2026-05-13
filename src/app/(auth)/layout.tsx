import React from 'react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="auth-bg relative flex min-h-screen items-center justify-center p-4 md:p-6 overflow-hidden">
      {/* Soft overlay for better contrast */}
      <div className="absolute inset-0 bg-background/20 backdrop-blur-[2px] z-0"></div>
      <div className="relative z-10 w-full flex justify-center items-center fade-in-up">
        {children}
      </div>
    </div>
  )
}

