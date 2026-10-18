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
  const firstName = userName ? userName.split(" ")[0] : "Abhi";

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
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans select-none"
    >
      {/* Welcome Title & Subtitle */}
      <div className="flex items-center gap-3">
        <span className="text-2xl select-none shrink-0" role="img" aria-label="Waving hand">
          👋
        </span>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#172033] dark:text-white tracking-tight leading-tight">
            Welcome back, {firstName}!
          </h1>
          <p className="text-xs sm:text-[13px] text-[#64748B] dark:text-[#94A3B8] font-normal mt-0.5">
            Here&apos;s what&apos;s happening with your recruitment today.
          </p>
        </div>
      </div>

      {/* Date Selector & Primary Action */}
      <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center flex-wrap">
        {/* Dynamic Colorful Current Date Display */}
        <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-[12px] bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-purple-50/50 dark:from-slate-800/95 dark:via-blue-950/50 dark:to-slate-800/95 border border-blue-200/80 dark:border-blue-700/50 shadow-[0_2px_8px_rgba(37,99,235,0.08)] hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200">
          <div className="w-6 h-6 rounded-[7px] bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-[0_2px_6px_rgba(37,99,235,0.3)]">
            <CalendarTodayOutlinedIcon sx={{ fontSize: 13, color: "#FFFFFF" }} />
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span
              suppressHydrationWarning
              className="px-1.5 py-0.5 rounded-[5px] bg-blue-500/12 dark:bg-blue-400/20 text-blue-700 dark:text-blue-300 font-bold text-[11px] tracking-tight"
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
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
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
                className: "bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl shadow-lg",
                sx: {
                  width: 210,
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
                fontWeight: 500,
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
                fontWeight: 500,
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
                fontWeight: 500,
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
