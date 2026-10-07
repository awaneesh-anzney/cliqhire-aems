"use client";

import React from "react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

export function DashboardSkeleton() {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        display: "flex",
        flexDirection: "column",
        gap: { xs: 1.5, md: 2 },
        p: { xs: "10px 12px 16px", sm: "12px 16px 16px" },
      }}
      className="animate-in fade-in duration-300 font-sans"
    >
      {/* Skeleton: Welcome Header */}
      <Box className="flex items-center justify-between">
        <Box className="space-y-1.5">
          <Skeleton variant="text" width={220} height={34} />
          <Skeleton variant="text" width={320} height={18} />
        </Box>
        <Box className="hidden sm:flex items-center gap-2">
          <Skeleton variant="rounded" width={180} height={38} sx={{ borderRadius: "10px" }} />
          <Skeleton variant="rounded" width={110} height={38} sx={{ borderRadius: "10px" }} />
        </Box>
      </Box>

      {/* Skeleton: 4 Primary KPI Cards */}
      <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        {[1, 2, 3, 4].map((i) => (
          <Box
            key={i}
            className="p-4 rounded-[16px] border border-[#E7EDF4] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_4px_16px_rgba(15,23,42,0.04)] space-y-3"
          >
            <Box className="flex justify-between items-center">
              <Box className="flex items-center gap-2">
                <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: "12px" }} />
                <Skeleton variant="text" width={90} height={16} />
              </Box>
              <Skeleton variant="circular" width={24} height={24} />
            </Box>
            <Box className="flex items-baseline gap-2">
              <Skeleton variant="text" width={80} height={32} />
              <Skeleton variant="text" width={60} height={16} />
            </Box>
            <Box className="flex justify-between items-center pt-2 border-t border-[#F1F5F9] dark:border-slate-800">
              <Skeleton variant="rounded" width={60} height={20} sx={{ borderRadius: "9999px" }} />
              <Skeleton variant="rounded" width={70} height={24} sx={{ borderRadius: "6px" }} />
            </Box>
          </Box>
        ))}
      </Box>

      {/* Skeleton: Analytical Grid (Row 1 & Row 2) */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "repeat(12, 1fr)" },
          gap: { xs: 1.5, md: 2 },
          alignItems: "stretch",
        }}
      >
        {/* Row 1 Left: Pipeline Velocity */}
        <Box className="lg:col-span-8 p-4 sm:p-5 rounded-[16px] border border-[#E7EDF4] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_4px_16px_rgba(15,23,42,0.04)] space-y-4">
          <Box className="flex justify-between items-center pb-3 border-b border-[#F1F5F9] dark:border-slate-800">
            <Skeleton variant="text" width={200} height={22} />
            <Skeleton variant="rounded" width={90} height={24} sx={{ borderRadius: "8px" }} />
          </Box>
          <Box className="grid grid-cols-3 gap-3">
            <Skeleton variant="rounded" height={64} sx={{ borderRadius: "12px" }} />
            <Skeleton variant="rounded" height={64} sx={{ borderRadius: "12px" }} />
            <Skeleton variant="rounded" height={64} sx={{ borderRadius: "12px" }} />
          </Box>
          <Skeleton variant="rounded" height={70} sx={{ borderRadius: "12px" }} />
          <Skeleton variant="rounded" height={42} sx={{ borderRadius: "12px" }} />
        </Box>

        {/* Row 1 Right: Operations Launchpad */}
        <Box className="lg:col-span-4 p-4 sm:p-5 rounded-[16px] border border-[#E7EDF4] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_4px_16px_rgba(15,23,42,0.04)] space-y-3 flex flex-col justify-between">
          <Box className="flex justify-between items-center pb-3 border-b border-[#F1F5F9] dark:border-slate-800">
            <Skeleton variant="text" width={160} height={22} />
            <Skeleton variant="rounded" width={70} height={20} sx={{ borderRadius: "9999px" }} />
          </Box>
          <Skeleton variant="rounded" height={54} sx={{ borderRadius: "12px" }} />
          <Skeleton variant="rounded" height={54} sx={{ borderRadius: "12px" }} />
          <Skeleton variant="rounded" height={54} sx={{ borderRadius: "12px" }} />
          <Skeleton variant="rounded" height={54} sx={{ borderRadius: "12px" }} />
        </Box>

        {/* Row 2 Left: Recruitment Force */}
        <Box className="lg:col-span-8 p-4 sm:p-5 rounded-[16px] border border-[#E7EDF4] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_4px_16px_rgba(15,23,42,0.04)] space-y-3">
          <Box className="flex justify-between items-center pb-3 border-b border-[#F1F5F9] dark:border-slate-800">
            <Skeleton variant="text" width={220} height={20} />
            <Skeleton variant="rounded" width={70} height={20} sx={{ borderRadius: "6px" }} />
          </Box>
          <Box className="grid grid-cols-3 gap-3">
            <Skeleton variant="rounded" height={60} sx={{ borderRadius: "12px" }} />
            <Skeleton variant="rounded" height={60} sx={{ borderRadius: "12px" }} />
            <Skeleton variant="rounded" height={60} sx={{ borderRadius: "12px" }} />
          </Box>
          <Skeleton variant="rounded" width="100%" height={6} sx={{ borderRadius: "9999px" }} />
        </Box>

        {/* Row 2 Right: Legal & MSAs */}
        <Box className="lg:col-span-4 p-4 sm:p-5 rounded-[16px] border border-[#E7EDF4] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_4px_16px_rgba(15,23,42,0.04)] space-y-3 flex flex-col justify-between">
          <Box className="flex justify-between items-center pb-3 border-b border-[#F1F5F9] dark:border-slate-800">
            <Skeleton variant="text" width={140} height={20} />
            <Skeleton variant="rounded" width={70} height={20} sx={{ borderRadius: "6px" }} />
          </Box>
          <Skeleton variant="rounded" height={56} sx={{ borderRadius: "12px" }} />
          <Skeleton variant="text" width="70%" height={16} />
        </Box>
      </Box>
    </Box>
  );
}
