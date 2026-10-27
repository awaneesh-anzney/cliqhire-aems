"use client";

import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import WhatshotOutlinedIcon from "@mui/icons-material/WhatshotOutlined";
import { cn } from "@/lib/utils";
import { EngagementCounts } from "@/services/clientService";

interface ClientStatsBarProps {
  totalCount: number;
  clients?: Array<{
    clientStage: "Lead" | "Engaged" | "Signed";
    clientSubStage?: string;
    jobCount?: number;
    engagementCategory?: string;
  }>;
  moduleType?: "clients" | "leads";
  selectedStage?: string;
  selectedEngagementCategory?: string;
  engagementCounts?: EngagementCounts;
  onSelectStage?: (stage: string) => void;
  onSelectEngagementCategory?: (category: string) => void;
  className?: string;
}

export const ClientStatsBar: React.FC<ClientStatsBarProps> = ({
  totalCount,
  clients = [],
  moduleType = "clients",
  selectedStage = "All",
  selectedEngagementCategory = "All",
  engagementCounts,
  onSelectStage,
  onSelectEngagementCategory,
  className,
}) => {
  const isLeads = moduleType === "leads";

  // Calculate quick fallback metrics from loaded clients
  const stageCounts = React.useMemo(() => {
    let leadCount = 0;
    let engagedCount = 0;
    let signedCount = 0;
    let lowEngagedCount = 0;
    let earlyEngagedCount = 0;
    let highEngagedCount = 0;

    clients.forEach((c) => {
      if (c.clientStage === "Lead") leadCount++;
      else if (c.clientStage === "Engaged") engagedCount++;
      else if (c.clientStage === "Signed") signedCount++;

      const cat = c.engagementCategory?.toLowerCase() || "";
      if (cat.includes("low")) lowEngagedCount++;
      else if (cat.includes("early")) earlyEngagedCount++;
      else if (cat.includes("high")) highEngagedCount++;
    });

    return {
      leadCount,
      engagedCount,
      signedCount,
      lowEngagedCount,
      earlyEngagedCount,
      highEngagedCount,
    };
  }, [clients]);

  // Determine active state
  const isCategoryActive = selectedEngagementCategory && selectedEngagementCategory !== "All";
  const isAllActive = selectedStage === "All" && !isCategoryActive;
  const isLeadActive = selectedStage === "Lead" && !isCategoryActive;
  const isEngagedActive = selectedStage === "Engaged" && !isCategoryActive;
  const isLowActive = selectedEngagementCategory === "Low Engaged" || selectedEngagementCategory === "low-engaged";
  const isEarlyActive = selectedEngagementCategory === "Early Engaged" || selectedEngagementCategory === "early-engaged";
  const isHighActive = selectedEngagementCategory === "High Engaged" || selectedEngagementCategory === "high-engaged";

  // Handlers for stage and engagement filters
  const handleSelectAll = () => {
    onSelectStage?.("All");
    onSelectEngagementCategory?.("All");
  };

  const handleSelectLead = () => {
    onSelectStage?.("Lead");
    onSelectEngagementCategory?.("All");
  };

  const handleSelectEngaged = () => {
    onSelectStage?.("Engaged");
    onSelectEngagementCategory?.("All");
  };

  const handleSelectEngagementCategory = (cat: string) => {
    onSelectEngagementCategory?.(cat);
    onSelectStage?.("All");
  };

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
        onClick={handleSelectAll}
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
          bgcolor: isAllActive ? "rgba(37, 99, 235, 0.1)" : "background.paper",
          color: isAllActive ? "#2563EB" : "text.secondary",
          border: 1,
          borderColor: isAllActive ? "rgba(37, 99, 235, 0.3)" : "divider",
          "&:hover": {
            bgcolor: isAllActive ? "rgba(37, 99, 235, 0.15)" : "rgba(145, 158, 171, 0.08)",
            color: isAllActive ? "#1D4ED8" : "text.primary",
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
          label={engagementCounts?.total ?? totalCount}
          size="small"
          sx={{
            height: 16,
            fontSize: "0.625rem",
            fontWeight: 800,
            bgcolor: isAllActive ? "#2563EB" : "rgba(145, 158, 171, 0.16)",
            color: isAllActive ? "#FFFFFF" : "text.primary",
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
            onClick={handleSelectLead}
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
              bgcolor: isLeadActive ? "rgba(0, 184, 217, 0.12)" : "background.paper",
              color: isLeadActive ? "#00B8D9" : "text.secondary",
              border: 1,
              borderColor: isLeadActive ? "rgba(0, 184, 217, 0.35)" : "divider",
              "&:hover": {
                bgcolor: isLeadActive ? "rgba(0, 184, 217, 0.18)" : "rgba(145, 158, 171, 0.08)",
                color: isLeadActive ? "#00A3BF" : "text.primary",
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
                bgcolor: isLeadActive ? "#00B8D9" : "rgba(0, 184, 217, 0.12)",
                color: isLeadActive ? "#FFFFFF" : "#00B8D9",
                border: 0,
                "& .MuiChip-label": { px: 0.6 },
              }}
            />
          </Button>

          {/* Engaged Stage Pill */}
          <Button
            type="button"
            onClick={handleSelectEngaged}
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
              bgcolor: isEngagedActive ? "rgba(255, 171, 0, 0.12)" : "background.paper",
              color: isEngagedActive ? "#FFAB00" : "text.secondary",
              border: 1,
              borderColor: isEngagedActive ? "rgba(255, 171, 0, 0.35)" : "divider",
              "&:hover": {
                bgcolor: isEngagedActive ? "rgba(255, 171, 0, 0.18)" : "rgba(145, 158, 171, 0.08)",
                color: isEngagedActive ? "#E09700" : "text.primary",
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
                bgcolor: isEngagedActive ? "#FFAB00" : "rgba(255, 171, 0, 0.12)",
                color: isEngagedActive ? "#FFFFFF" : "#FFAB00",
                border: 0,
                "& .MuiChip-label": { px: 0.6 },
              }}
            />
          </Button>

          {/* Separator between Stages & Engagement Categories */}
          <Box
            sx={{
              width: "1px",
              height: 18,
              bgcolor: "divider",
              mx: 0.5,
              flexShrink: 0,
            }}
          />

          {/* ─── COLORFUL ENGAGEMENT CATEGORIES ─── */}

          {/* Low Engaged Pill */}
          <Button
            type="button"
            onClick={() => handleSelectEngagementCategory("Low Engaged")}
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
              bgcolor: isLowActive ? "rgba(239, 68, 68, 0.12)" : "background.paper",
              color: isLowActive ? "#EF4444" : "text.secondary",
              border: 1,
              borderColor: isLowActive ? "rgba(239, 68, 68, 0.4)" : "divider",
              "&:hover": {
                bgcolor: isLowActive ? "rgba(239, 68, 68, 0.18)" : "rgba(239, 68, 68, 0.06)",
                color: "#EF4444",
                borderColor: "rgba(239, 68, 68, 0.3)",
              },
            }}
          >
            <HourglassEmptyOutlinedIcon sx={{ fontSize: 13, color: isLowActive ? "#EF4444" : "#F87171" }} />
            <span>Low Engaged</span>
            <Chip
              label={engagementCounts?.lowEngaged ?? stageCounts.lowEngagedCount}
              size="small"
              sx={{
                height: 16,
                fontSize: "0.625rem",
                fontWeight: 800,
                bgcolor: isLowActive ? "#EF4444" : "rgba(239, 68, 68, 0.12)",
                color: isLowActive ? "#FFFFFF" : "#EF4444",
                border: 0,
                "& .MuiChip-label": { px: 0.6 },
              }}
            />
          </Button>

          {/* Early Engaged Pill */}
          <Button
            type="button"
            onClick={() => handleSelectEngagementCategory("Early Engaged")}
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
              bgcolor: isEarlyActive ? "rgba(99, 102, 241, 0.12)" : "background.paper",
              color: isEarlyActive ? "#6366F1" : "text.secondary",
              border: 1,
              borderColor: isEarlyActive ? "rgba(99, 102, 241, 0.4)" : "divider",
              "&:hover": {
                bgcolor: isEarlyActive ? "rgba(99, 102, 241, 0.18)" : "rgba(99, 102, 241, 0.06)",
                color: "#6366F1",
                borderColor: "rgba(99, 102, 241, 0.3)",
              },
            }}
          >
            <BoltOutlinedIcon sx={{ fontSize: 14, color: isEarlyActive ? "#6366F1" : "#818CF8" }} />
            <span>Early Engaged</span>
            <Chip
              label={engagementCounts?.earlyEngaged ?? stageCounts.earlyEngagedCount}
              size="small"
              sx={{
                height: 16,
                fontSize: "0.625rem",
                fontWeight: 800,
                bgcolor: isEarlyActive ? "#6366F1" : "rgba(99, 102, 241, 0.12)",
                color: isEarlyActive ? "#FFFFFF" : "#6366F1",
                border: 0,
                "& .MuiChip-label": { px: 0.6 },
              }}
            />
          </Button>

          {/* High Engaged Pill */}
          <Button
            type="button"
            onClick={() => handleSelectEngagementCategory("High Engaged")}
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
              bgcolor: isHighActive ? "rgba(16, 185, 129, 0.12)" : "background.paper",
              color: isHighActive ? "#10B981" : "text.secondary",
              border: 1,
              borderColor: isHighActive ? "rgba(16, 185, 129, 0.4)" : "divider",
              "&:hover": {
                bgcolor: isHighActive ? "rgba(16, 185, 129, 0.18)" : "rgba(16, 185, 129, 0.06)",
                color: "#10B981",
                borderColor: "rgba(16, 185, 129, 0.3)",
              },
            }}
          >
            <WhatshotOutlinedIcon sx={{ fontSize: 14, color: isHighActive ? "#10B981" : "#34D399" }} />
            <span>High Engaged</span>
            <Chip
              label={engagementCounts?.highEngaged ?? stageCounts.highEngagedCount}
              size="small"
              sx={{
                height: 16,
                fontSize: "0.625rem",
                fontWeight: 800,
                bgcolor: isHighActive ? "#10B981" : "rgba(16, 185, 129, 0.12)",
                color: isHighActive ? "#FFFFFF" : "#10B981",
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
    </Box>
  );
};

export default ClientStatsBar;
