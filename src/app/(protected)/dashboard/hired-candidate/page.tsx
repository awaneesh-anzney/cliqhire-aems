"use client";

import React from "react";
import Box from "@mui/material/Box";
import { HiredCandidatesSection } from "@/components/dashboard/hired-candidates";

/**
 * Hired Candidates Page (`/dashboard/hired-candidate`).
 * Compact, screen-fitted layout tracking placements, dynamic team members,
 * probation lifecycles, and Excel exports.
 */
export default function HiredCandidatesPage() {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        display: "flex",
        flexDirection: "column",
        gap: { xs: 1.25, md: 1.5 },
        p: { xs: "8px 12px 12px", sm: "10px 16px 14px" },
      }}
      className="font-sans"
    >
      <HiredCandidatesSection />
    </Box>
  );
}
