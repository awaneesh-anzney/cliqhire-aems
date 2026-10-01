"use client";

import React from "react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

export function DashboardSkeleton() {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1.75,
        p: { xs: 1.5, sm: 2 },
      }}
      className="animate-in fade-in duration-300"
    >
      {/* Skeleton: Header Banner */}
      <Box className="h-14 sm:h-16 w-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-[#1C252E]/80 p-3 flex items-center justify-between">
        <Box className="flex items-center gap-2.5">
          <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: "8px" }} />
          <Box className="space-y-1">
            <Skeleton variant="text" width={160} height={20} />
            <Skeleton variant="text" width={240} height={14} />
          </Box>
        </Box>
        <Box className="hidden sm:flex items-center gap-1.5">
          <Skeleton variant="rounded" width={80} height={32} sx={{ borderRadius: "8px" }} />
          <Skeleton variant="rounded" width={80} height={32} sx={{ borderRadius: "8px" }} />
          <Skeleton variant="rounded" width={100} height={32} sx={{ borderRadius: "8px" }} />
        </Box>
      </Box>

      {/* Skeleton: 4 Primary KPI Cards */}
      <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 shrink-0">
        {[1, 2, 3, 4].map((i) => (
          <Box
            key={i}
            className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1C252E] shadow-2xs space-y-2"
          >
            <Box className="flex justify-between items-center">
              <Skeleton variant="text" width={80} height={14} />
              <Skeleton variant="rounded" width={28} height={28} sx={{ borderRadius: "8px" }} />
            </Box>
            <Skeleton variant="text" width={100} height={28} />
            <Skeleton variant="rounded" width="100%" height={6} sx={{ borderRadius: "9999px" }} />
            <Box className="flex justify-between">
              <Skeleton variant="text" width={50} height={12} />
              <Skeleton variant="text" width={50} height={12} />
            </Box>
          </Box>
        ))}
      </Box>

      {/* Skeleton: Analytical Grid (Row 1 & Row 2) */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "repeat(12, 1fr)" },
          gap: 1.75,
          alignItems: "stretch",
        }}
      >
        {/* Row 1 Left: Pipeline Velocity */}
        <Box className="lg:col-span-8 p-3 sm:p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1C252E] shadow-2xs space-y-3">
          <Box className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
            <Skeleton variant="text" width={180} height={18} />
            <Skeleton variant="rounded" width={90} height={22} sx={{ borderRadius: "9999px" }} />
          </Box>
          <Box className="grid grid-cols-3 gap-2">
            <Skeleton variant="rounded" height={52} sx={{ borderRadius: "8px" }} />
            <Skeleton variant="rounded" height={52} sx={{ borderRadius: "8px" }} />
            <Skeleton variant="rounded" height={52} sx={{ borderRadius: "8px" }} />
          </Box>
          <Skeleton variant="rounded" height={60} sx={{ borderRadius: "8px" }} />
          <Skeleton variant="rounded" height={36} sx={{ borderRadius: "8px" }} />
        </Box>

        {/* Row 1 Right: Operations Launchpad */}
        <Box className="lg:col-span-4 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1C252E] shadow-2xs space-y-2 flex flex-col justify-between">
          <Box className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
            <Skeleton variant="text" width={140} height={18} />
            <Skeleton variant="rounded" width={70} height={20} sx={{ borderRadius: "9999px" }} />
          </Box>
          <Skeleton variant="rounded" height={52} sx={{ borderRadius: "8px" }} />
          <Skeleton variant="rounded" height={52} sx={{ borderRadius: "8px" }} />
          <Skeleton variant="rounded" height={52} sx={{ borderRadius: "8px" }} />
        </Box>

        {/* Row 2 Left: Recruitment Force */}
        <Box className="lg:col-span-8 p-3 sm:p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1C252E] shadow-2xs space-y-2.5">
          <Box className="flex justify-between items-center">
            <Skeleton variant="text" width={180} height={18} />
            <Skeleton variant="rounded" width={70} height={20} sx={{ borderRadius: "6px" }} />
          </Box>
          <Box className="grid grid-cols-3 gap-2">
            <Skeleton variant="rounded" height={48} sx={{ borderRadius: "8px" }} />
            <Skeleton variant="rounded" height={48} sx={{ borderRadius: "8px" }} />
            <Skeleton variant="rounded" height={48} sx={{ borderRadius: "8px" }} />
          </Box>
          <Skeleton variant="rounded" width="100%" height={5} sx={{ borderRadius: "9999px" }} />
        </Box>

        {/* Row 2 Right: Legal & MSAs */}
        <Box className="lg:col-span-4 p-3 sm:p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1C252E] shadow-2xs space-y-2.5 flex flex-col justify-between">
          <Box className="flex justify-between items-center">
            <Skeleton variant="text" width={120} height={18} />
            <Skeleton variant="rounded" width={70} height={20} sx={{ borderRadius: "6px" }} />
          </Box>
          <Skeleton variant="rounded" height={48} sx={{ borderRadius: "8px" }} />
          <Skeleton variant="text" width="60%" height={14} />
        </Box>
      </Box>
    </Box>
  );
}
