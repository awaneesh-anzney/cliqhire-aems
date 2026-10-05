"use client";

import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import NavigateBeforeOutlinedIcon from "@mui/icons-material/NavigateBeforeOutlined";
import NavigateNextOutlinedIcon from "@mui/icons-material/NavigateNextOutlined";

interface ClientPaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalClients: number;
  pageSize: number;
  setPageSize: (size: number) => void;
  handlePageChange: (page: number) => void;
  clientsLength: number;
  entityName?: string;
}

export const ClientPaginationControls: React.FC<ClientPaginationControlsProps> = ({
  currentPage,
  totalPages,
  totalClients,
  pageSize,
  setPageSize,
  handlePageChange,
  clientsLength,
  entityName = "records",
}) => {
  const startItem = clientsLength > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalClients);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.5,
        px: 2,
        py: 1.25,
        userSelect: "none",
      }}
    >
      {/* Left: Summary & Per Page */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
        <Typography sx={{ fontSize: "11px", color: "text.secondary" }}>
          Showing <Typography component="span" sx={{ fontWeight: 700, color: "text.primary", fontSize: "11px" }}>{startItem}-{endItem}</Typography> of{" "}
          <Typography component="span" sx={{ fontWeight: 700, color: "text.primary", fontSize: "11px" }}>{totalClients}</Typography> {entityName}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, pl: 1.5, borderLeft: 1, borderColor: "divider" }}>
          <Typography sx={{ fontSize: "11px", color: "text.secondary" }}>Rows:</Typography>
          <Select
            value={pageSize}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              setPageSize(newSize);
              handlePageChange(1);
            }}
            size="small"
            sx={{
              height: 26,
              fontSize: "11px",
              fontWeight: 700,
              borderRadius: "6px",
              bgcolor: "background.paper",
              "& .MuiSelect-select": { py: 0.25, px: 1 },
            }}
          >
            {[10, 25, 50, 100, 200].map((item) => (
              <MenuItem key={item} value={item} sx={{ fontSize: "11px" }}>
                {item}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      {/* Right: Navigation Controls */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          startIcon={<NavigateBeforeOutlinedIcon sx={{ fontSize: 16 }} />}
          sx={{
            height: 28,
            px: 1.25,
            fontSize: "11px",
            fontWeight: 700,
            borderRadius: "6px",
            textTransform: "none",
            borderColor: "divider",
            color: "text.primary",
            "&:disabled": { opacity: 0.4 },
          }}
        >
          Previous
        </Button>

        <Box
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: "6px",
            bgcolor: "background.paper",
            border: 1,
            borderColor: "divider",
          }}
        >
          <Typography sx={{ fontSize: "11px", color: "text.secondary" }}>
            Page <Typography component="span" sx={{ fontWeight: 800, color: "text.primary", fontSize: "11px" }}>{currentPage}</Typography> of{" "}
            <Typography component="span" sx={{ fontWeight: 800, color: "text.primary", fontSize: "11px" }}>{Math.max(totalPages, 1)}</Typography>
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="small"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          endIcon={<NavigateNextOutlinedIcon sx={{ fontSize: 16 }} />}
          sx={{
            height: 28,
            px: 1.25,
            fontSize: "11px",
            fontWeight: 700,
            borderRadius: "6px",
            textTransform: "none",
            borderColor: "divider",
            color: "text.primary",
            "&:disabled": { opacity: 0.4 },
          }}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default ClientPaginationControls;
