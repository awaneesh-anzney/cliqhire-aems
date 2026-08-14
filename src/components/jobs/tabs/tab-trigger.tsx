"use client"

import { TabsTrigger } from "@/components/ui/tabs"
import { ReactNode } from "react"

interface JobTabTriggerProps {
  value: string
  icon: ReactNode // ReactNode allow karega JSX elements pass karna
  label: string
  count?: number
}

export function JobTabTrigger({ value, icon, label, count }: JobTabTriggerProps) {
  return (
    <TabsTrigger
      value={value}
      className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-emerald-900 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 rounded-t-lg flex items-center gap-2 h-9 px-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-900 hover:bg-white/50 transition-all shrink-0 cursor-pointer"
    >
      {/* Direct render node */}
      {icon}

      <span>{label}</span>

      {typeof count === "number" && (
        <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
          {count}
        </span>
      )}
    </TabsTrigger>
  )
}