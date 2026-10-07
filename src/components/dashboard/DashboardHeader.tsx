"use client";

import React, { useState } from "react";
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

  // Format current month date range string
  const now = new Date();
  const monthName = now.toLocaleDateString("en-US", { month: "short" });
  const year = now.getFullYear();
  const dateRangeStr = `${monthName} 1, ${year} – ${monthName} 31, ${year}`;

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
        {/* Date Selector Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[10px] bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 text-xs font-medium text-[#172033] dark:text-slate-200 shadow-[0_1px_3px_rgba(15,23,42,0.03)] cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
          <CalendarTodayOutlinedIcon sx={{ fontSize: 14, color: "#64748B" }} />
          <span>{dateRangeStr}</span>
          <KeyboardArrowDownOutlinedIcon sx={{ fontSize: 16, color: "#94A3B8" }} />
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
