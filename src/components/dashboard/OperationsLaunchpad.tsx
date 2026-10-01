"use client";

import React from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import ArrowOutwardOutlinedIcon from "@mui/icons-material/ArrowOutwardOutlined";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";

interface OperationsLaunchpadProps {
  onOpenCandidate: () => void;
  onOpenJob: () => void;
  onOpenClient: () => void;
  usersTotal: number;
  usersActive: number;
  usersActivePercent: number;
  contractsTotal: number;
}

export function OperationsLaunchpad({
  onOpenCandidate,
  onOpenJob,
  onOpenClient,
  usersTotal,
  usersActive,
  usersActivePercent,
  contractsTotal,
}: OperationsLaunchpadProps) {
  const launchActions = [
    {
      title: "Capture Talent",
      subtitle: "Add a candidate to system & parse resume",
      icon: <HowToRegOutlinedIcon sx={{ fontSize: 20, color: "#00A76F" }} />,
      bg: "rgba(0, 167, 111, 0.08)",
      hoverBorder: "rgba(0, 167, 111, 0.3)",
      badge: "Intake",
      badgeColor: "#00A76F",
      badgeBg: "rgba(0, 167, 111, 0.12)",
      onClick: onOpenCandidate,
    },
    {
      title: "Post Requisition",
      subtitle: "Open job requirement & assign recruiters",
      icon: <WorkOutlineOutlinedIcon sx={{ fontSize: 20, color: "#00B8D9" }} />,
      bg: "rgba(0, 184, 217, 0.08)",
      hoverBorder: "rgba(0, 184, 217, 0.3)",
      badge: "Requisition",
      badgeColor: "#00B8D9",
      badgeBg: "rgba(0, 184, 217, 0.12)",
      onClick: onOpenJob,
    },
    {
      title: "Onboard Client",
      subtitle: "Register enterprise client & set terms",
      icon: <BusinessOutlinedIcon sx={{ fontSize: 20, color: "#8E33FF" }} />,
      bg: "rgba(142, 51, 255, 0.08)",
      hoverBorder: "rgba(142, 51, 255, 0.3)",
      badge: "Account",
      badgeColor: "#8E33FF",
      badgeBg: "rgba(142, 51, 255, 0.12)",
      onClick: onOpenClient,
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {/* Quick Launch Panel */}
      <Box
        sx={{
          bgcolor: "background.paper",
          borderRadius: "12px",
          border: 1,
          borderColor: "divider",
          p: 2,
          boxShadow: "0px 1px 3px 0px rgba(0, 0, 0, 0.04), 0px 1px 2px -1px rgba(0, 0, 0, 0.03)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: "8px",
                bgcolor: "rgba(255, 86, 48, 0.1)",
                color: "#FF5630",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <RocketLaunchOutlinedIcon sx={{ fontSize: 16 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "0.8125rem", fontWeight: 700, color: "text.primary", lineHeight: 1.2 }}>
                Operations Launchpad
              </Typography>
              <Typography sx={{ fontSize: "0.6875rem", color: "text.secondary" }}>
                Execute high-frequency recruitment tasks
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {launchActions.map((action, idx) => (
            <Button
              key={idx}
              onClick={action.onClick}
              sx={{
                p: 1,
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
                    width: 30,
                    height: 30,
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
                    <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "text.primary" }}>
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
                  <Typography sx={{ fontSize: "0.65rem", color: "text.secondary", mt: 0.15 }}>
                    {action.subtitle}
                  </Typography>
                </Box>
              </Box>
              <ArrowForwardOutlinedIcon sx={{ fontSize: 14, color: "text.disabled", flexShrink: 0 }} />
            </Button>
          ))}
        </Box>
      </Box>

      {/* Organization Health Stats (Users & Contracts) */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr" }, gap: 1.5 }}>
        {/* Team Members Card */}
        <Box
          component={Link}
          href="/users"
          sx={{
            textDecoration: "none",
            bgcolor: "background.paper",
            borderRadius: "12px",
            border: 1,
            borderColor: "divider",
            p: 1.5,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              borderColor: "rgba(0, 167, 111, 0.4)",
              boxShadow: "0 4px 12px rgba(0, 167, 111, 0.08)",
              transform: "translateY(-1px)",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "7px",
                  bgcolor: "rgba(0, 167, 111, 0.1)",
                  color: "#00A76F",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PeopleOutlineOutlinedIcon sx={{ fontSize: 16 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "text.primary" }}>
                  Recruitment Force
                </Typography>
                <Typography sx={{ fontSize: "0.65rem", color: "text.secondary" }}>
                  Staff accounts & recruiters
                </Typography>
              </Box>
            </Box>
            <ArrowOutwardOutlinedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
          </Box>

          <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <Box>
              <Typography sx={{ fontSize: "1.25rem", fontWeight: 800, color: "text.primary", lineHeight: 1 }}>
                {usersTotal}
              </Typography>
              <Typography sx={{ fontSize: "0.65rem", color: "text.secondary", mt: 0.25 }}>
                {usersActive} active on platform
              </Typography>
            </Box>
            <Chip
              label={`${usersActivePercent}% active`}
              size="small"
              sx={{
                height: 18,
                fontSize: "0.625rem",
                fontWeight: 700,
                color: "#00A76F",
                bgcolor: "rgba(0, 167, 111, 0.1)",
                border: 0,
              }}
            />
          </Box>
        </Box>

        {/* Legal Agreements / Contracts Card */}
        <Box
          component={Link}
          href="/contracts"
          sx={{
            textDecoration: "none",
            bgcolor: "background.paper",
            borderRadius: "12px",
            border: 1,
            borderColor: "divider",
            p: 1.5,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              borderColor: "rgba(142, 51, 255, 0.4)",
              boxShadow: "0 4px 12px rgba(142, 51, 255, 0.08)",
              transform: "translateY(-1px)",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "7px",
                  bgcolor: "rgba(142, 51, 255, 0.1)",
                  color: "#8E33FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <DescriptionOutlinedIcon sx={{ fontSize: 16 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "text.primary" }}>
                  Legal & MSAs
                </Typography>
                <Typography sx={{ fontSize: "0.65rem", color: "text.secondary" }}>
                  Executed client agreements
                </Typography>
              </Box>
            </Box>
            <ArrowOutwardOutlinedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
          </Box>

          <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <Box>
              <Typography sx={{ fontSize: "1.25rem", fontWeight: 800, color: "text.primary", lineHeight: 1 }}>
                {contractsTotal}
              </Typography>
              <Typography sx={{ fontSize: "0.65rem", color: "text.secondary", mt: 0.25 }}>
                Total contracts recorded
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <VerifiedUserOutlinedIcon sx={{ fontSize: 15, color: "#8E33FF" }} />
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#8E33FF" }}>
                Compliant
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
