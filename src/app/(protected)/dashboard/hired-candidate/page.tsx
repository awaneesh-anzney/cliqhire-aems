"use client";

import React from "react";
import Box from "@mui/material/Box";
import { HiredCandidatesSection } from "@/components/dashboard/hired-candidates";

/**
 * Hired Candidates Page (`/dashboard/hired-candidate`).
 * Screen-fitted responsive layout where the outer page does not scroll,
 * and only the data table rows scroll within the available height.
 */
export default function HiredCandidatesPage() {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        height: "100%",
        maxHeight: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        overflow: "hidden",
        gap: { xs: 1, md: 1.25 },
        p: { xs: "8px 12px", sm: "10px 16px" },
        boxSizing: "border-box",
      }}
      className="font-sans h-full max-h-full overflow-hidden flex flex-col"
    >
      <HiredCandidatesSection />
    </Box>
  );
}
