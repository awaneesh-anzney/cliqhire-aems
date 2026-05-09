"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      richColors
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          // Ensure content inherits the variant color
          // Make title readable
          title: "text-inherit font-semibold",
          // Force high-contrast description and align with variant colors
          description:
            "!opacity-100 text-neutral-800 dark:text-neutral-100 group-data-[type=error]:!text-red-600 group-data-[type=success]:!text-emerald-600",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          // Force variant colors to win over base text color regardless of Tailwind utility order
          success: "!text-emerald-600",
          error: "!text-red-600",
          warning: "!text-amber-600 font-semibold",
          info: "!text-blue-600",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
