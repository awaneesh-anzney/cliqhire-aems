"use client";

import React from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

interface LegalAgreementsCardProps {
  contractsTotal: number;
}

export function LegalAgreementsCard({ contractsTotal }: LegalAgreementsCardProps) {
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
              bgcolor: "rgba(142, 51, 255, 0.1)",
              color: "#8E33FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <DescriptionOutlinedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "0.8125rem", fontWeight: 700, color: "text.primary", lineHeight: 1.2 }}>
              Legal & MSAs
            </Typography>
            <Typography sx={{ fontSize: "0.6875rem", color: "text.secondary", mt: 0.25 }}>
              Executed corporate agreements
            </Typography>
          </Box>
        </Box>

        <Button
          component={Link}
          href="/contracts"
          variant="text"
          size="small"
          endIcon={<ArrowForwardOutlinedIcon sx={{ fontSize: 13 }} />}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            fontSize: "11px",
            color: "#8E33FF",
            p: "1px 6px",
            borderRadius: "6px",
            "&:hover": {
              backgroundColor: "rgba(142, 51, 255, 0.08)",
            },
          }}
        >
          View MSAs
        </Button>
      </Box>

      {/* Main Metric Stat Box */}
      <Box
        sx={{
          p: 1.5,
          borderRadius: "10px",
          bgcolor: "rgba(142, 51, 255, 0.04)",
          border: 1,
          borderColor: "rgba(142, 51, 255, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", color: "#8E33FF", letterSpacing: "0.5px" }}>
            Active Contracts
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: 0.25 }}>
            <Typography sx={{ fontSize: "1.25rem", fontWeight: 800, color: "text.primary", lineHeight: 1 }}>
              {contractsTotal}
            </Typography>
            <Typography sx={{ fontSize: "0.6875rem", color: "text.secondary" }}>
              signed agreements
            </Typography>
          </Box>
        </Box>

        <Chip
          icon={<VerifiedUserOutlinedIcon sx={{ fontSize: "14px !important", color: "#8E33FF !important" }} />}
          label="Compliant"
          size="small"
          sx={{
            height: 22,
            fontSize: "0.6875rem",
            fontWeight: 700,
            color: "#8E33FF",
            bgcolor: "rgba(142, 51, 255, 0.12)",
            border: 0,
            "& .MuiChip-label": { px: 0.75 },
          }}
        />
      </Box>

      {/* Footer Info Strip */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1.25 }}>
        <Typography sx={{ fontSize: "0.65rem", color: "text.secondary" }}>
          Terms & Fee Schedules Verified
        </Typography>
        <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#8E33FF" }}>
          100% In Effect
        </Typography>
      </Box>
    </Box>
  );
}
