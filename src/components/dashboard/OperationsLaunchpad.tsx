"use client";

import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

interface OperationsLaunchpadProps {
  onOpenCandidate: () => void;
  onOpenJob: () => void;
  onOpenClient: () => void;
}

export function OperationsLaunchpad({
  onOpenCandidate,
  onOpenJob,
  onOpenClient,
}: OperationsLaunchpadProps) {
  const launchActions = [
    {
      title: "Capture Talent",
      subtitle: "Add a candidate to system & parse resume",
      icon: <HowToRegOutlinedIcon sx={{ fontSize: 18, color: "#00A76F" }} />,
      bg: "rgba(0, 167, 111, 0.08)",
      hoverBorder: "rgba(0, 167, 111, 0.35)",
      badge: "Intake",
      badgeColor: "#00A76F",
      badgeBg: "rgba(0, 167, 111, 0.12)",
      onClick: onOpenCandidate,
    },
    {
      title: "Post Requisition",
      subtitle: "Open job requirement & assign recruiters",
      icon: <WorkOutlineOutlinedIcon sx={{ fontSize: 18, color: "#00B8D9" }} />,
      bg: "rgba(0, 184, 217, 0.08)",
      hoverBorder: "rgba(0, 184, 217, 0.35)",
      badge: "Requisition",
      badgeColor: "#00B8D9",
      badgeBg: "rgba(0, 184, 217, 0.12)",
      onClick: onOpenJob,
    },
    {
      title: "Onboard Client",
      subtitle: "Register enterprise client & set terms",
      icon: <BusinessOutlinedIcon sx={{ fontSize: 18, color: "#8E33FF" }} />,
      bg: "rgba(142, 51, 255, 0.08)",
      hoverBorder: "rgba(142, 51, 255, 0.35)",
      badge: "Account",
      badgeColor: "#8E33FF",
      badgeBg: "rgba(142, 51, 255, 0.12)",
      onClick: onOpenClient,
    },
  ];

  return (
    <Box
      className="w-full h-full flex flex-col justify-between rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1C252E] shadow-[0_0_2px_0_rgba(145,158,171,0.2),0_8px_16px_-4px_rgba(145,158,171,0.06)] overflow-hidden font-sans"
    >
      {/* Header Bar matching PipelineVelocityCard header */}
      <Box className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between shrink-0">
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: "6px",
              bgcolor: "rgba(255, 86, 48, 0.1)",
              color: "#FF5630",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <RocketLaunchOutlinedIcon sx={{ fontSize: 15 }} />
          </Box>
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 800, color: "text.primary", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Operations Launchpad
          </Typography>
        </Box>

        <Chip
          label="Quick Actions"
          size="small"
          sx={{
            height: 18,
            fontSize: "0.625rem",
            fontWeight: 700,
            color: "#FF5630",
            bgcolor: "rgba(255, 86, 48, 0.1)",
            border: 0,
            "& .MuiChip-label": { px: 0.75 },
          }}
        />
      </Box>

      {/* Main Body with 3 distributed action buttons */}
      <Box sx={{ p: { xs: 2, sm: 2.25 }, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 1.25 }}>
        {launchActions.map((action, idx) => (
          <Button
            key={idx}
            onClick={action.onClick}
            sx={{
              flex: 1,
              minHeight: 52,
              p: 1.25,
              borderRadius: "10px",
              border: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
              textTransform: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              textAlign: "left",
              transition: "all 0.18s ease-in-out",
              "&:hover": {
                bgcolor: action.bg,
                borderColor: action.hoverBorder,
                transform: "translateX(2px)",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  bgcolor: action.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {action.icon}
              </Box>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "text.primary" }}>
                    {action.title}
                  </Typography>
                  <Chip
                    label={action.badge}
                    size="small"
                    sx={{
                      height: 16,
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      color: action.badgeColor,
                      bgcolor: action.badgeBg,
                      border: 0,
                      "& .MuiChip-label": { px: 0.5 },
                    }}
                  />
                </Box>
                <Typography sx={{ fontSize: "0.6875rem", color: "text.secondary", mt: 0.15 }}>
                  {action.subtitle}
                </Typography>
              </Box>
            </Box>
            <ArrowForwardOutlinedIcon sx={{ fontSize: 14, color: "text.disabled", flexShrink: 0 }} />
          </Button>
        ))}
      </Box>
    </Box>
  );
}
