"use client"

import { TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface JobTabContentProps {
  value: string
  children: ReactNode
  className?: string;
}

export function JobTabContent({ value, children,className, }: JobTabContentProps) {
  return (
    <TabsContent value={value} className={cn("border-none p-0", className)}>
      {children}
    </TabsContent>
  )
}