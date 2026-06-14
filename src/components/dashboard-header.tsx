import React from 'react'
import { Button } from "@/components/ui/button"
import { Plus, Funnel, RefreshCcw, Trash2 } from 'lucide-react'
import { cn } from "@/lib/utils"

type DashboardHeaderProps = {
  setOpen: (open: boolean) => void;
  setFilterOpen: (open: boolean) => void;
  initialLoading: boolean;
  heading: string;
  buttonText: string;
  showFilterButton?: boolean;
  showCreateButton?: boolean;
  rightContent?: React.ReactNode;
  onRefresh?: () => void;
  selectedCount?: number;
  onDelete?: () => void;
  isFilterActive?: boolean;
  filterCount?: number;
  onExport?: () => void;
}

const Dashboardheader = ({
  setOpen,
  setFilterOpen,
  initialLoading,
  heading,
  buttonText,
  showFilterButton = true,
  showCreateButton = true,
  rightContent,
  onRefresh,
  selectedCount = 0,
  onDelete,
  isFilterActive = false,
  filterCount = 0,
  onExport,
}: DashboardHeaderProps) => {

  return (
    <div className="flex items-center justify-between px-4 py-3.5 w-full bg-card gap-4">
      {/* Left: Add Button */}
      <div className="flex items-center pl-1 shrink-0">
        {showCreateButton && (
          <Button 
            size="sm" 
            onClick={() => setOpen(true)}
            className="h-9 px-4 rounded-lg bg-brand hover:bg-brand/90 text-white text-xs font-semibold transition-all active:scale-[0.98] shadow-md shadow-brand/10 shrink-0 flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5 shrink-0" />
            <span>{buttonText}</span>
          </Button>
        )}
      </div>

      {/* Right: Grouped Actions */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
        {rightContent ? (
          rightContent
        ) : (
          <>
            {selectedCount > 0 && onDelete && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 rounded-lg text-xs font-semibold bg-red-50 text-red-600 border-red-100 hover:bg-red-100/80 hover:text-red-700 transition-all shrink-0 flex items-center gap-1.5"
                onClick={onDelete}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete ({selectedCount})</span>
              </Button>
            )}

            {showFilterButton && (
              <Button
                variant={isFilterActive ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterOpen(true)}
                className={cn(
                  "h-9 px-3 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5",
                  isFilterActive 
                    ? "bg-brand text-white border-brand hover:bg-brand/90 hover:shadow-sm" 
                    : "border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <Funnel className="h-3.5 w-3.5" />
                <span>{isFilterActive ? `Filters (${filterCount})` : 'Filters'}</span>
              </Button>
            )}

            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                className="h-9 px-3 rounded-lg text-xs font-semibold border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all shrink-0 flex items-center gap-1.5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" x2="12" y1="15" y2="3" />
                </svg>
                <span>Export</span>
              </Button>
            )}

            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={initialLoading}
                className="h-9 px-3 rounded-lg text-xs font-semibold border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all shrink-0 flex items-center gap-1.5"
              >
                <RefreshCcw className={cn("h-3.5 w-3.5 shrink-0", initialLoading && "animate-spin")} />
                <span>{initialLoading ? "Loading..." : "Refresh"}</span>
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboardheader;
