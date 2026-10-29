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
  const displayName = userName?.trim() || "Executive";

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
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 font-sans select-none px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
    >
      {/* ─── User Welcome & Company Info ─── */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
            Welcome back, <span className="text-blue-600 dark:text-blue-400 font-extrabold">{displayName}</span>!
          </h1>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/50">
            <VerifiedOutlinedIcon sx={{ fontSize: 11 }} />
            Enterprise
          </span>
        </div>

        <p className="text-[11.5px] sm:text-xs text-slate-500 dark:text-slate-400 leading-tight">
          <span className="font-semibold text-slate-700 dark:text-slate-300">{companyName}</span>
          <span className="mx-1.5 text-slate-300 dark:text-slate-600">•</span>
          Executive Talent Intelligence & Operations Hub
        </p>
      </div>

      {/* ─── Date Display & Quick Action ─── */}
      <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
        {/* Dynamic Compact Current Date Display */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 text-xs">
          <CalendarTodayOutlinedIcon sx={{ fontSize: 13, color: "#2563EB" }} />
          <span
            suppressHydrationWarning
            className="px-1.5 py-0.5 rounded bg-blue-100/70 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold text-[10px]"
          >
            {dateInfo.weekday}
          </span>
          <span
            suppressHydrationWarning
            className="font-medium text-slate-700 dark:text-slate-200 text-[11.5px]"
          >
            {dateInfo.fullDate}
          </span>
        </div>

        {/* Primary "+ Add New" Dropdown Button */}
        <div>
          <Button
            variant="contained"
            onClick={handleOpenMenu}
            startIcon={<AddOutlinedIcon sx={{ fontSize: 16 }} />}
            endIcon={<KeyboardArrowDownOutlinedIcon sx={{ fontSize: 15 }} />}
            sx={{
              height: 32,
              px: 1.5,
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "12px",
              backgroundColor: "#2563EB",
              boxShadow: "0 1px 3px rgba(37, 99, 235, 0.2)",
              "&:hover": {
                backgroundColor: "#1D4ED8",
                boxShadow: "0 2px 6px rgba(37, 99, 235, 0.25)",
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
                  mt: 0.75,
                  p: 0.5,
                  borderRadius: "10px",
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
                borderRadius: "6px",
                py: 0.75,
                px: 1.25,
                fontSize: "12.5px",
                fontWeight: 600,
                color: "#172033",
                "&:hover": {
                  bgcolor: "#EFF6FF",
                  color: "#2563EB",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 26, color: "#2563EB" }}>
                <PersonAddAlt1OutlinedIcon sx={{ fontSize: 17 }} />
              </ListItemIcon>
              <ListItemText
                primary={<span className="text-[12.5px] font-semibold">New Candidate</span>}
              />
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleCloseMenu();
                onOpenJob();
              }}
              sx={{
                borderRadius: "6px",
                py: 0.75,
                px: 1.25,
                fontSize: "12.5px",
                fontWeight: 600,
                color: "#172033",
                "&:hover": {
                  bgcolor: "#EFF6FF",
                  color: "#2563EB",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 26, color: "#8B5CF6" }}>
                <WorkOutlineOutlinedIcon sx={{ fontSize: 17 }} />
              </ListItemIcon>
              <ListItemText
                primary={<span className="text-[12.5px] font-semibold">New Job Requisition</span>}
              />
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleCloseMenu();
                onOpenClient();
              }}
              sx={{
                borderRadius: "6px",
                py: 0.75,
                px: 1.25,
                fontSize: "12.5px",
                fontWeight: 600,
                color: "#172033",
                "&:hover": {
                  bgcolor: "#EFF6FF",
                  color: "#2563EB",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 26, color: "#06B6D4" }}>
                <BusinessOutlinedIcon sx={{ fontSize: 17 }} />
              </ListItemIcon>
              <ListItemText
                primary={<span className="text-[12.5px] font-semibold">New Client Account</span>}
              />
            </MenuItem>
          </Menu>
        </div>
      </div>
    </Box>
  );
}
