"use client";

import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

// Material UI Icons
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";

interface DashboardHeaderProps {
  userName?: string;
  companyName?: string;
  onOpenClient: () => void;
  onOpenJob: () => void;
  onOpenCandidate: () => void;
}

export function DashboardHeader({
  userName,
  companyName = "CliqHire",
  onOpenClient,
  onOpenJob,
  onOpenCandidate,
}: DashboardHeaderProps) {
  const firstName = userName ? userName.split(" ")[0] : "Executive";

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Format current day and full date dynamically
  const [dateInfo, setDateInfo] = useState<{ weekday: string; fullDate: string }>(() => {
    const now = new Date();
    return {
      weekday: now.toLocaleDateString("en-US", { weekday: "long" }),
      fullDate: now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    };
  });

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      setDateInfo({
        weekday: now.toLocaleDateString("en-US", { weekday: "long" }),
        fullDate: now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      });
    };
    updateDate();
  }, []);

  return (
    <Box
      component="section"
      className="flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans select-none p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-gradient-to-r from-white via-slate-50/50 to-blue-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)]"
    >
      {/* ─── Company & User Welcome Banner ─── */}
      <div className="flex items-center gap-3.5">
        {/* CliqHire Brand Logo / Icon */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#4F46E5] text-white flex items-center justify-center font-extrabold text-lg shadow-md shadow-blue-500/25 shrink-0 border border-white/20">
          <span>CH</span>
        </div>

        <div>
          {/* Company Badge */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <span>{companyName}</span>
              <span className="text-slate-400 font-semibold">• AEMS</span>
            </span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.2 rounded-full text-[10px] font-bold bg-blue-100/70 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300">
              <VerifiedOutlinedIcon sx={{ fontSize: 11 }} />
              Enterprise
            </span>
          </div>

          {/* Welcome User Heading */}
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mt-0.5">
            Welcome back, {firstName}!
          </h1>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {companyName} Executive Talent Intelligence & Operations Hub
          </p>
        </div>
      </div>

      {/* ─── Date Selector & Add Actions ─── */}
      <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center flex-wrap">
        {/* Dynamic Colorful Current Date Display */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <CalendarTodayOutlinedIcon sx={{ fontSize: 13 }} />
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span
              suppressHydrationWarning
              className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-bold text-[10.5px]"
            >
              {dateInfo.weekday}
            </span>
            <span
              suppressHydrationWarning
              className="font-semibold text-slate-700 dark:text-slate-200"
            >
              {dateInfo.fullDate}
            </span>
          </div>
        </div>

        {/* Primary "+ Add New" Dropdown Button */}
        <div>
          <Button
            variant="contained"
            onClick={handleOpenMenu}
            startIcon={<AddOutlinedIcon sx={{ fontSize: 17 }} />}
            endIcon={<KeyboardArrowDownOutlinedIcon sx={{ fontSize: 16 }} />}
            sx={{
              height: 38,
              px: 2,
              borderRadius: "11px",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "13px",
              backgroundColor: "#2563EB",
              boxShadow: "0 2px 8px rgba(37, 99, 235, 0.2)",
              "&:hover": {
                backgroundColor: "#1D4ED8",
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.28)",
              },
            }}
          >
            Add New
          </Button>

          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleCloseMenu}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            slotProps={{
              paper: {
                elevation: 4,
                className: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg",
                sx: {
                  width: 220,
                  mt: 1,
                  p: 0.5,
                  borderRadius: "12px",
                },
              },
            }}
          >
            <MenuItem
              onClick={() => {
                handleCloseMenu();
                onOpenCandidate();
              }}
              sx={{
                borderRadius: "8px",
                py: 1,
                px: 1.5,
                fontSize: "13px",
                fontWeight: 600,
                color: "#172033",
                "&:hover": {
                  bgcolor: "#EFF6FF",
                  color: "#2563EB",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 28, color: "#2563EB" }}>
                <PersonAddAlt1OutlinedIcon sx={{ fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText
                primary={<span className="text-[13px] font-semibold">New Candidate</span>}
              />
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleCloseMenu();
                onOpenJob();
              }}
              sx={{
                borderRadius: "8px",
                py: 1,
                px: 1.5,
                fontSize: "13px",
                fontWeight: 600,
                color: "#172033",
                "&:hover": {
                  bgcolor: "#EFF6FF",
                  color: "#2563EB",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 28, color: "#8B5CF6" }}>
                <WorkOutlineOutlinedIcon sx={{ fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText
                primary={<span className="text-[13px] font-semibold">New Job Requisition</span>}
              />
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleCloseMenu();
                onOpenClient();
              }}
              sx={{
                borderRadius: "8px",
                py: 1,
                px: 1.5,
                fontSize: "13px",
                fontWeight: 600,
                color: "#172033",
                "&:hover": {
                  bgcolor: "#EFF6FF",
                  color: "#2563EB",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 28, color: "#06B6D4" }}>
                <BusinessOutlinedIcon sx={{ fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText
                primary={<span className="text-[13px] font-semibold">New Client Account</span>}
              />
            </MenuItem>
          </Menu>
        </div>
      </div>
    </Box>
  );
}
