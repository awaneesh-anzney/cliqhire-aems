"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface TeamMemberPaginationProps {
  currentPage: number;
  totalPages: number;
  totalMembers: number;
  pageSize: number;
  setPageSize: (size: number) => void;
  handlePageChange: (page: number) => void;
  membersLength: number;
}

export const TeamMemberPagination: React.FC<TeamMemberPaginationProps> = ({
  currentPage,
  totalPages,
  totalMembers,
  pageSize,
  setPageSize,
  handlePageChange,
  membersLength,
}) => {
  const startItem = membersLength > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalMembers);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-1.5 text-xs select-none">
      {/* Left: Summary & Per Page */}
      <div className="flex items-center gap-3 text-muted-foreground">
        <span className="text-[11px] font-medium">
          Showing <span className="font-semibold text-foreground">{startItem}</span>-
          <span className="font-semibold text-foreground">{endItem}</span> of{" "}
          <span className="font-semibold text-foreground">{totalMembers}</span> team members
        </span>

        <div className="flex items-center gap-1.5 pl-2 border-l border-border/70">
          <span className="text-[11px] text-muted-foreground">Rows:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              const newSize = parseInt(value, 10);
              setPageSize(newSize);
              handlePageChange(1);
            }}
          >
            <SelectTrigger className="h-7 w-[68px] text-[11px] rounded-lg bg-muted/40 border-border/70 font-semibold focus:ring-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border">
              {["10", "25", "50", "100"].map((item) => (
                <SelectItem key={item} value={item} className="text-xs">
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Right: Navigation Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-7 px-2.5 text-xs rounded-lg border-border/70 hover:bg-muted/60 disabled:opacity-40"
        >
          <ChevronLeft className="h-3.5 w-3.5 mr-1" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <div className="px-2.5 py-1 rounded-lg bg-muted/40 border border-border/60 text-[11px] font-medium text-foreground">
          Page <span className="font-bold">{currentPage}</span> of{" "}
          <span className="font-bold">{Math.max(totalPages, 1)}</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-7 px-2.5 text-xs rounded-lg border-border/70 hover:bg-muted/60 disabled:opacity-40"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
};
