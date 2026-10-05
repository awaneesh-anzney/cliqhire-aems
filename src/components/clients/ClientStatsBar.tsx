"use client";

import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import { cn } from "@/lib/utils";

interface ClientStatsBarProps {
  totalCount: number;
  clients: Array<{
    clientStage: "Lead" | "Engaged" | "Signed";
    clientSubStage?: string;
    jobCount?: number;
  }>;
  moduleType?: "clients" | "leads";
  selectedStage?: string;
  onSelectStage?: (stage: string) => void;
  className?: string;
}

export const ClientStatsBar: React.FC<ClientStatsBarProps> = ({
  totalCount,
  clients = [],
  moduleType = "clients",
  selectedStage = "All",
  onSelectStage,
  className,
}) => {
  const isLeads = moduleType === "leads";

  // Calculate quick metrics from loaded clients
  const stageCounts = React.useMemo(() => {
    let leadCount = 0;
    let engagedCount = 0;
    let signedCount = 0;
    let totalJobs = 0;

    clients.forEach((c) => {
      if (c.clientStage === "Lead") leadCount++;
      else if (c.clientStage === "Engaged") engagedCount++;
      else if (c.clientStage === "Signed") signedCount++;
      totalJobs += c.jobCount || 0;
    });

    return { leadCount, engagedCount, signedCount, totalJobs };
  }, [clients]);

  return (
    <Box
      className={cn(
        "flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-0.5 select-none",
        className
      )}
    >
      {/* Total Records Button / Pill */}
      <Button
        type="button"
        onClick={() => onSelectStage && onSelectStage("All")}
        variant="text"
        size="small"
        sx={{
          height: 28,
          px: 1.25,
          borderRadius: "8px",
          textTransform: "none",
          fontWeight: 700,
          fontSize: "11px",
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexShrink: 0,
          bgcolor: selectedStage === "All" ? "rgba(37, 99, 235, 0.1)" : "background.paper",
          color: selectedStage === "All" ? "#2563EB" : "text.secondary",
          border: 1,
          borderColor: selectedStage === "All" ? "rgba(37, 99, 235, 0.3)" : "divider",
          "&:hover": {
            bgcolor: selectedStage === "All" ? "rgba(37, 99, 235, 0.15)" : "rgba(145, 158, 171, 0.08)",
            color: selectedStage === "All" ? "#1D4ED8" : "text.primary",
          },
        }}
      >
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            bgcolor: "#2563EB",
          }}
        />
        <span>All {isLeads ? "Leads" : "Clients"}</span>
        <Chip
          label={totalCount}
          size="small"
          sx={{
            height: 16,
            fontSize: "0.625rem",
            fontWeight: 800,
            bgcolor: selectedStage === "All" ? "#2563EB" : "rgba(145, 158, 171, 0.16)",
            color: selectedStage === "All" ? "#FFFFFF" : "text.primary",
            border: 0,
            "& .MuiChip-label": { px: 0.6 },
          }}
        />
      </Button>

      {isLeads ? (
        <>
          {/* Lead Stage Pill */}
          <Button
            type="button"
            onClick={() => onSelectStage && onSelectStage("Lead")}
            variant="text"
            size="small"
            sx={{
              height: 28,
              px: 1.25,
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "11px",
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexShrink: 0,
              bgcolor: selectedStage === "Lead" ? "rgba(0, 184, 217, 0.12)" : "background.paper",
              color: selectedStage === "Lead" ? "#00B8D9" : "text.secondary",
              border: 1,
              borderColor: selectedStage === "Lead" ? "rgba(0, 184, 217, 0.35)" : "divider",
              "&:hover": {
                bgcolor: selectedStage === "Lead" ? "rgba(0, 184, 217, 0.18)" : "rgba(145, 158, 171, 0.08)",
                color: selectedStage === "Lead" ? "#00A3BF" : "text.primary",
              },
            }}
          >
            <AccessTimeOutlinedIcon sx={{ fontSize: 14, color: "#00B8D9" }} />
            <span>New Leads</span>
            <Chip
              label={stageCounts.leadCount}
              size="small"
              sx={{
                height: 16,
                fontSize: "0.625rem",
                fontWeight: 800,
                bgcolor: selectedStage === "Lead" ? "#00B8D9" : "rgba(0, 184, 217, 0.12)",
                color: selectedStage === "Lead" ? "#FFFFFF" : "#00B8D9",
                border: 0,
                "& .MuiChip-label": { px: 0.6 },
              }}
            />
          </Button>

          {/* Engaged Stage Pill */}
          <Button
            type="button"
            onClick={() => onSelectStage && onSelectStage("Engaged")}
            variant="text"
            size="small"
            sx={{
              height: 28,
              px: 1.25,
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "11px",
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexShrink: 0,
              bgcolor: selectedStage === "Engaged" ? "rgba(255, 171, 0, 0.12)" : "background.paper",
              color: selectedStage === "Engaged" ? "#FFAB00" : "text.secondary",
              border: 1,
              borderColor: selectedStage === "Engaged" ? "rgba(255, 171, 0, 0.35)" : "divider",
              "&:hover": {
                bgcolor: selectedStage === "Engaged" ? "rgba(255, 171, 0, 0.18)" : "rgba(145, 158, 171, 0.08)",
                color: selectedStage === "Engaged" ? "#E09700" : "text.primary",
              },
            }}
          >
            <TrendingUpOutlinedIcon sx={{ fontSize: 14, color: "#FFAB00" }} />
            <span>Engaged</span>
            <Chip
              label={stageCounts.engagedCount}
              size="small"
              sx={{
                height: 16,
                fontSize: "0.625rem",
                fontWeight: 800,
                bgcolor: selectedStage === "Engaged" ? "#FFAB00" : "rgba(255, 171, 0, 0.12)",
                color: selectedStage === "Engaged" ? "#FFFFFF" : "#FFAB00",
                border: 0,
                "& .MuiChip-label": { px: 0.6 },
              }}
            />
          </Button>
        </>
      ) : (
        <>
          {/* Signed Clients Pill */}
          <Box
            sx={{
              height: 28,
              px: 1.25,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexShrink: 0,
              bgcolor: "rgba(0, 167, 111, 0.08)",
              border: 1,
              borderColor: "rgba(0, 167, 111, 0.25)",
            }}
          >
            <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 14, color: "#00A76F" }} />
            <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#00A76F" }}>
              Signed Contracts
            </Typography>
            <Chip
              label={totalCount}
              size="small"
              sx={{
                height: 16,
                fontSize: "0.625rem",
                fontWeight: 800,
                bgcolor: "#00A76F",
                color: "#FFFFFF",
                border: 0,
                "& .MuiChip-label": { px: 0.6 },
              }}
            />
          </Box>
        </>
      )}

      {/* Jobs Metric Pill */}
      <Box
        sx={{
          height: 28,
          px: 1.25,
          borderRadius: "8px",
          display: { xs: "none", sm: "flex" },
          alignItems: "center",
          gap: 1,
          flexShrink: 0,
          ml: "auto",
          bgcolor: "background.paper",
          border: 1,
          borderColor: "divider",
        }}
      >
        <WorkOutlineOutlinedIcon sx={{ fontSize: 13, color: "#8E33FF" }} />
        <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "text.secondary" }}>
          Page Requisitions:
        </Typography>
        <Chip
          label={stageCounts.totalJobs}
          size="small"
          sx={{
            height: 16,
            fontSize: "0.625rem",
            fontWeight: 800,
            bgcolor: "rgba(142, 51, 255, 0.1)",
            color: "#8E33FF",
            border: 0,
            "& .MuiChip-label": { px: 0.6 },
          }}
        />
      </Box>
    </Box>
  );
};

export default ClientStatsBar;
