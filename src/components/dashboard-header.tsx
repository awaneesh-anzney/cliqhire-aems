import React from 'react'
import { Button } from "@/components/ui/button"
import { Plus, Funnel, RefreshCcw, MoreVertical, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'

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
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2">
        {showCreateButton ? (
          <Button 
            size="sm" 
            onClick={() => setOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white font-bold shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            <Plus className="h-4 w-4 mr-2" />
            {buttonText}
          </Button>
        ) : (<div />)}
        <div className="flex items-center gap-2">
          {rightContent ? (
            rightContent
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                disabled={selectedCount === 0}
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {selectedCount > 0 ? `Delete (${selectedCount})` : 'Delete'}
              </Button>
              {showFilterButton && (
                <Button
                  variant={isFilterActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterOpen(true)}
                >
                  <Funnel className="h-4 w-4 mr-2" />
                  {isFilterActive ? `Filters (${filterCount})` : 'Filters'}
                </Button>
              )}
              {onExport && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onExport}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" x2="12" y1="15" y2="3" />
                  </svg>
                  Export
                </Button>
              )}
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={initialLoading}
          >
            {initialLoading ? (
              <>
                <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCcw className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Dashboardheader;
