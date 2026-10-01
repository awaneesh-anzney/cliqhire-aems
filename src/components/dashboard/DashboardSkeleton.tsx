"use client";

import React from "react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

export function DashboardSkeleton() {
  return (
    <Box className="flex-1 min-h-0 flex flex-col gap-4 animate-in fade-in duration-300">
      {/* Skeleton: Header Banner */}
      <Box className="h-20 w-full rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-[#1C252E]/80 p-4 flex items-center justify-between">
        <Box className="flex items-center gap-3">
          <Skeleton variant="rounded" width={42} height={42} sx={{ borderRadius: "12px" }} />
          <Box className="space-y-1.5">
            <Skeleton variant="text" width={180} height={24} />
            <Skeleton variant="text" width={280} height={16} />
          </Box>
        </Box>
        <Box className="hidden sm:flex items-center gap-2">
          <Skeleton variant="rounded" width={110} height={36} sx={{ borderRadius: "10px" }} />
          <Skeleton variant="rounded" width={100} height={36} sx={{ borderRadius: "10px" }} />
          <Skeleton variant="rounded" width={120} height={36} sx={{ borderRadius: "10px" }} />
        </Box>
      </Box>

      {/* Skeleton: 4 Primary KPI Cards */}
      <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 shrink-0">
        {[1, 2, 3, 4].map((i) => (
          <Box
            key={i}
            className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1C252E] shadow-2xs space-y-3"
          >
            <Box className="flex justify-between items-center">
              <Skeleton variant="text" width={90} height={16} />
              <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: "10px" }} />
            </Box>
            <Skeleton variant="text" width={120} height={36} />
            <Skeleton variant="rounded" width="100%" height={6} sx={{ borderRadius: "9999px" }} />
            <Box className="flex justify-between">
              <Skeleton variant="text" width={60} height={14} />
              <Skeleton variant="text" width={60} height={14} />
            </Box>
          </Box>
        ))}
      </Box>

      {/* Skeleton: Two-Column Analytics & Launchpad */}
      <Box className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 flex-1 min-h-0">
        <Box className="lg:col-span-8 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1C252E] shadow-2xs space-y-4">
          <Box className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
            <Skeleton variant="text" width={200} height={20} />
            <Skeleton variant="rounded" width={100} height={24} sx={{ borderRadius: "9999px" }} />
          </Box>
          <Box className="grid grid-cols-3 gap-3">
            <Skeleton variant="rounded" height={68} sx={{ borderRadius: "12px" }} />
            <Skeleton variant="rounded" height={68} sx={{ borderRadius: "12px" }} />
            <Skeleton variant="rounded" height={68} sx={{ borderRadius: "12px" }} />
          </Box>
          <Skeleton variant="rounded" height={120} sx={{ borderRadius: "12px" }} />
          <Skeleton variant="rounded" height={50} sx={{ borderRadius: "12px" }} />
        </Box>

        <Box className="lg:col-span-4 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1C252E] shadow-2xs space-y-3 flex flex-col justify-between">
          <Box className="space-y-3">
            <Skeleton variant="text" width={150} height={20} />
            <Skeleton variant="rounded" height={60} sx={{ borderRadius: "12px" }} />
            <Skeleton variant="rounded" height={60} sx={{ borderRadius: "12px" }} />
            <Skeleton variant="rounded" height={60} sx={{ borderRadius: "12px" }} />
          </Box>
          <Box className="grid grid-cols-2 gap-2.5">
            <Skeleton variant="rounded" height={90} sx={{ borderRadius: "12px" }} />
            <Skeleton variant="rounded" height={90} sx={{ borderRadius: "12px" }} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
