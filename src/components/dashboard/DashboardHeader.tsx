"use client";

import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";

// Material UI Icons
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";

interface DashboardHeaderProps {
  userName?: string;
  onOpenClient: () => void;
  onOpenJob: () => void;
  onOpenCandidate: () => void;
}

export function DashboardHeader({
  userName,
  onOpenClient,
  onOpenJob,
  onOpenCandidate,
}: DashboardHeaderProps) {
  const firstName = userName ? userName.split(" ")[0] : "Partner";

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <Box
      component="header"
      className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#1C252E] border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-[0_0_2px_0_rgba(145,158,171,0.2),0_12px_24px_-4px_rgba(145,158,171,0.08)] shrink-0 font-sans transition-all duration-300"
    >
      {/* Top Subtle Brand Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-80 pointer-events-none" />

      {/* Ambient Radial Glows */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute left-1/3 -bottom-10 h-32 w-48 rounded-full bg-indigo-500/10 blur-2xl" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Welcome & Context Strip */}
        <div className="flex items-center gap-3.5 flex-wrap">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20 text-white border border-white/20">
            <AutoAwesomeOutlinedIcon sx={{ fontSize: 22 }} />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-xl font-extrabold tracking-tight text-[#1C252E] dark:text-white leading-tight">
                Welcome back,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                  {firstName}
                </span>
              </h1>

              {/* Workspace Live Indicator */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Workspace Live</span>
              </div>
            </div>

            <p className="text-xs text-[#637381] dark:text-[#919EAB] font-medium mt-1">
              Talent Operations & Sourcing Hub • Real-time Requisition & Pipeline Analytics
            </p>
          </div>
        </div>

        {/* Action Bar & Date Badge */}
        <div className="flex items-center gap-2 shrink-0 self-start md:self-auto flex-wrap">
          {/* Current Date Badge */}
          <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs font-bold text-[#1C252E] dark:text-slate-200 shadow-2xs">
            <CalendarTodayOutlinedIcon sx={{ fontSize: 15, color: "#2563EB" }} />
            <span>{currentDate}</span>
          </div>

          {/* Quick Action: Client */}
          <Button
            variant="outlined"
            size="small"
            onClick={onOpenClient}
            startIcon={<BusinessOutlinedIcon sx={{ fontSize: 16 }} />}
            sx={{
              height: 36,
              px: 1.8,
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "12px",
              borderColor: "rgba(145, 158, 171, 0.32)",
              color: "text.primary",
              backgroundColor: "background.paper",
              "&:hover": {
                borderColor: "#2563EB",
                backgroundColor: "rgba(37, 99, 235, 0.04)",
              },
            }}
          >
            + Client
          </Button>

          {/* Quick Action: Jobs (Royal Blue CTA) */}
          <Button
            variant="contained"
            size="small"
            onClick={onOpenJob}
            startIcon={<WorkOutlineOutlinedIcon sx={{ fontSize: 16 }} />}
            sx={{
              height: 36,
              px: 2,
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "12px",
              backgroundColor: "#2563EB",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.24)",
              "&:hover": {
                backgroundColor: "#1D4ED8",
                boxShadow: "0 6px 16px rgba(37, 99, 235, 0.32)",
              },
            }}
          >
            + Jobs
          </Button>

          {/* Quick Action: Candidate (Indigo CTA) */}
          <Button
            variant="contained"
            size="small"
            onClick={onOpenCandidate}
            startIcon={<PersonAddAlt1OutlinedIcon sx={{ fontSize: 16 }} />}
            sx={{
              height: 36,
              px: 2,
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "12px",
              backgroundColor: "#4F46E5",
              boxShadow: "0 4px 12px rgba(79, 70, 229, 0.24)",
              "&:hover": {
                backgroundColor: "#4338CA",
                boxShadow: "0 6px 16px rgba(79, 70, 229, 0.32)",
              },
            }}
          >
            + Candidate
          </Button>
        </div>
      </div>
    </Box>
  );
}
