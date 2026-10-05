"use client";

import React from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";

interface RecruitmentForceCardProps {
  usersTotal: number;
  usersActive: number;
  usersActivePercent: number;
}

export function RecruitmentForceCard({
  usersTotal,
  usersActive,
  usersActivePercent,
}: RecruitmentForceCardProps) {
  return (
    <Box
      className="w-full h-full flex flex-col justify-between rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1C252E] shadow-[0_0_2px_0_rgba(145,158,171,0.2),0_8px_16px_-4px_rgba(145,158,171,0.06)] p-3 sm:p-3.5 font-sans transition-all"
    >
      {/* Header Row */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "8px",
              bgcolor: "rgba(0, 167, 111, 0.1)",
              color: "#00A76F",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <PeopleOutlineOutlinedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "0.8125rem", fontWeight: 700, color: "text.primary", lineHeight: 1.2 }}>
              Recruitment Force & Staffing Capacity
            </Typography>
            <Typography sx={{ fontSize: "0.6875rem", color: "text.secondary", mt: 0.25 }}>
              Active talent acquisition specialists, recruiters & internal staff
            </Typography>
          </Box>
        </Box>

        <Button
          component={Link}
          href="/users"
          variant="text"
          size="small"
          endIcon={<ArrowForwardOutlinedIcon sx={{ fontSize: 13 }} />}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            fontSize: "11px",
            color: "#00A76F",
            p: "1px 6px",
            borderRadius: "6px",
            "&:hover": {
              backgroundColor: "rgba(0, 167, 111, 0.08)",
            },
          }}
        >
          View Team
        </Button>
      </Box>

      {/* 3 Metric Columns */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 1.5,
          py: 0.5,
        }}
      >
        <Box
          sx={{
            p: 1.5,
            borderRadius: "10px",
            bgcolor: "rgba(0, 167, 111, 0.04)",
            border: 1,
            borderColor: "rgba(0, 167, 111, 0.15)",
          }}
        >
          <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", color: "#00A76F", letterSpacing: "0.5px" }}>
            Total Force
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: 0.25 }}>
            <Typography sx={{ fontSize: "1.25rem", fontWeight: 800, color: "text.primary", lineHeight: 1 }}>
              {usersTotal}
            </Typography>
            <Typography sx={{ fontSize: "0.6875rem", color: "text.secondary" }}>
              accounts
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            p: 1.5,
            borderRadius: "10px",
            bgcolor: "rgba(0, 184, 217, 0.04)",
            border: 1,
            borderColor: "rgba(0, 184, 217, 0.15)",
          }}
        >
          <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", color: "#00B8D9", letterSpacing: "0.5px" }}>
            Active on Duty
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: 0.25 }}>
            <Typography sx={{ fontSize: "1.25rem", fontWeight: 800, color: "text.primary", lineHeight: 1 }}>
              {usersActive}
            </Typography>
            <Typography sx={{ fontSize: "0.6875rem", color: "text.secondary" }}>
              online
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            p: 1.5,
            borderRadius: "10px",
            bgcolor: "rgba(142, 51, 255, 0.04)",
            border: 1,
            borderColor: "rgba(142, 51, 255, 0.15)",
          }}
        >
          <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", color: "#8E33FF", letterSpacing: "0.5px" }}>
            Activity Rate
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: 0.25 }}>
            <Typography sx={{ fontSize: "1.25rem", fontWeight: 800, color: "text.primary", lineHeight: 1 }}>
              {usersActivePercent}%
            </Typography>
            <Chip
              label="Operational"
              size="small"
              sx={{
                height: 16,
                fontSize: "0.6rem",
                fontWeight: 700,
                color: "#8E33FF",
                bgcolor: "rgba(142, 51, 255, 0.12)",
                border: 0,
                "& .MuiChip-label": { px: 0.5 },
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Progress Strip */}
      <Box sx={{ mt: 1.25 }}>
        <Box sx={{ width: "100%", height: 5, bgcolor: "rgba(145, 158, 171, 0.16)", borderRadius: 9999, overflow: "hidden" }}>
          <Box
            sx={{
              height: "100%",
              width: `${Math.min(usersActivePercent, 100)}%`,
              bgcolor: "#00A76F",
              borderRadius: 9999,
              transition: "width 0.4s ease-in-out",
            }}
          />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 0.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 13, color: "#00A76F" }} />
            <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#00A76F" }}>
              {usersActive} of {usersTotal} staff currently engaged
            </Typography>
          </Box>
          <Typography sx={{ fontSize: "0.65rem", color: "text.secondary" }}>
            Staff capacity normal
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
