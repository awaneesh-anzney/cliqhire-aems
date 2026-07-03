"use client"

import React from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AdminPaginationProps {
  page: number
  totalPages: number
  totalItems: number
  limit: number
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void
  itemName?: string
  isLoading?: boolean
  limitOptions?: number[]
}

export function AdminPagination({
  page,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  onLimitChange,
  itemName = "records",
  isLoading = false,
  limitOptions = [5, 10, 20, 50],
}: AdminPaginationProps) {
  const from = totalItems === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, totalItems)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-border/40 bg-muted/10">
      {/* Left section: record stats & limit select */}
      <div className="flex flex-wrap items-center gap-4 text-xs">
        <span className="font-medium text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{from}</span> to{" "}
          <span className="font-semibold text-foreground">{to}</span> of{" "}
          <span className="font-semibold text-foreground">{totalItems}</span> {itemName}
        </span>

        {onLimitChange && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Rows per page
            </span>
            <Select
              value={String(limit)}
              onValueChange={(val) => {
                onLimitChange(Number(val))
              }}
              disabled={isLoading}
            >
              <SelectTrigger className="h-7 w-[65px] bg-background border-border/80 text-xs rounded-lg px-2 font-bold">
                <SelectValue placeholder={String(limit)} />
              </SelectTrigger>
              <SelectContent className="rounded-lg border-border">
                {limitOptions.map((opt) => (
                  <SelectItem key={opt} value={String(opt)} className="text-xs rounded-md">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Right section: navigation controls */}
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 rounded-lg border-border/80 hover:bg-muted active:scale-95 transition-all"
          onClick={() => onPageChange(1)}
          disabled={page <= 1 || isLoading}
          title="First page"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 rounded-lg border-border/80 hover:bg-muted active:scale-95 transition-all"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || isLoading}
          title="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        <div className="flex items-center justify-center h-7 px-3 text-[10px] font-black uppercase tracking-wider border border-border/80 rounded-lg bg-background">
          Page {page} of {totalPages || 1}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 rounded-lg border-border/80 hover:bg-muted active:scale-95 transition-all"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || isLoading}
          title="Next page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 rounded-lg border-border/80 hover:bg-muted active:scale-95 transition-all"
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages || isLoading}
          title="Last page"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
