"use client"

import React from "react"
import { Search, FilterX } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface FilterField {
  id: string
  type: "search" | "select"
  placeholder?: string
  value: string
  onChange: (value: string) => void
  options?: { label: string; value: string }[]
  className?: string
}

interface AdminFiltersProps {
  leftFields: FilterField[]
  rightFields?: FilterField[]
  onReset?: () => void
  showReset?: boolean
}

export function AdminFilters({
  leftFields,
  rightFields = [],
  onReset,
  showReset = false,
}: AdminFiltersProps) {
  const renderField = (field: FilterField) => {
    if (field.type === "search") {
      return (
        <div
          key={field.id}
          className={`relative w-full md:w-72 shrink-0 ${field.className || ""}`}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/80" />
          <Input
            placeholder={field.placeholder || "Search..."}
            className="pl-9 h-9 text-xs rounded-xl bg-muted/20 border-border/80 focus-visible:ring-1 focus-visible:ring-brand w-full"
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
          />
        </div>
      )
    }

    if (field.type === "select" && field.options) {
      return (
        <Select
          key={field.id}
          value={field.value}
          onValueChange={field.onChange}
        >
          <SelectTrigger
            className={`w-full md:w-[150px] h-9 text-xs rounded-xl bg-card border-border/80 shrink-0 font-medium ${
              field.className || ""
            }`}
          >
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border">
            {field.options.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="text-xs rounded-lg"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    return null
  }

  return (
    <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-card p-3 rounded-xl border border-border/60 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.02)] w-full">
      {/* Left-aligned filters */}
      <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
        {leftFields.map(renderField)}
      </div>

      {/* Right-aligned filters + reset button */}
      <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-start md:justify-end">
        {rightFields.map(renderField)}

        {showReset && onReset && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 transition-all active:scale-95"
            onClick={onReset}
            title="Reset filters"
          >
            <FilterX className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
