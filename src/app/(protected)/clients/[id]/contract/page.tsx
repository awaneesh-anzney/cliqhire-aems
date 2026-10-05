"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MuiButton from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";

import { ContractSection } from "@/components/clients/contract/contract-section";
import { useClientById } from "@/hooks/useClient";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/contexts/PermissionContext";
import { toast } from "sonner";

interface PageProps {
  params: { id: string };
}

export default function ClientContractPage({ params }: PageProps) {
  const { id } = params;
  const router = useRouter();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const [copiedId, setCopiedId] = useState(false);

  const isAdmin = user?.role === "ADMIN";
  const canViewClients = isAdmin || hasPermission("clients", "view");
  const canModifyClients =
    isAdmin ||
    hasPermission("clients", "create") ||
    hasPermission("clients", "edit");

  const { data: client, isLoading, isError, isFetching, refetch } = useClientById(id);

  const handleCopyId = () => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    toast.success("Client ID copied to clipboard");
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Error State
  if (isError) {
    return (
      <Box className="flex min-h-[70vh] flex-col items-center justify-center p-4 sm:p-6 bg-background">
        <Box className="mx-auto max-w-md w-full rounded-2xl border border-destructive/20 bg-destructive/5 p-6 sm:p-8 text-center shadow-lg">
          <Box className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <ErrorOutlineOutlinedIcon sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
            Unable to Load Contract Information
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: "text.secondary", fontSize: "0.8125rem", lineHeight: 1.5 }}>
            We encountered an issue fetching details for this client. Please check your connection or try refreshing.
          </Typography>
          <Box className="mt-5 flex justify-center gap-2.5">
            <MuiButton
              variant="outlined"
              size="small"
              onClick={() => router.back()}
              sx={{ textTransform: "none", fontWeight: 600, borderRadius: "10px", fontSize: "0.75rem" }}
            >
              Go Back
            </MuiButton>
            <MuiButton
              variant="contained"
              size="small"
              onClick={() => refetch()}
              startIcon={<RefreshOutlinedIcon sx={{ fontSize: 16 }} />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "10px",
                fontSize: "0.75rem",
                bgcolor: "primary.main",
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              Retry
            </MuiButton>
          </Box>
        </Box>
      </Box>
    );
  }

  // Loading State
  if (isLoading || !client) {
    return (
      <Box className="flex min-h-[70vh] flex-col items-center justify-center p-6 bg-background">
        <Box className="flex flex-col items-center gap-3 p-8 rounded-2xl border border-border/60 bg-card/80 shadow-xs">
          <CircularProgress size={36} thickness={4} sx={{ color: "primary.main" }} />
          <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary", fontSize: "0.875rem" }}>
            Loading Contract Details...
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.75rem" }}>
            Preparing client agreement summaries and commercial structures
          </Typography>
        </Box>
      </Box>
    );
  }

  // Unauthorized State
  if (!canViewClients) {
    return (
      <Box className="flex min-h-[70vh] flex-col items-center justify-center p-4 sm:p-6 bg-background">
        <Box className="mx-auto max-w-md w-full rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 sm:p-8 text-center shadow-lg">
          <Box className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <SecurityOutlinedIcon sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
            Access Restricted
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: "text.secondary", fontSize: "0.8125rem", lineHeight: 1.5 }}>
            You do not have the required permissions to view contract details for this client. Contact your administrator if you require access.
          </Typography>
          <MuiButton
            variant="outlined"
            size="small"
            className="mt-5"
            onClick={() => router.back()}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: "10px", fontSize: "0.75rem" }}
          >
            Return to Previous Page
          </MuiButton>
        </Box>
      </Box>
    );
  }

  const clientInitial = client.name ? client.name.charAt(0).toUpperCase() : "C";
  const avatarSrc = (client as any).avatarUrl || (client as any).logo;

  return (
    <Box className="flex flex-col min-h-screen w-full max-w-full overflow-hidden bg-background">
      {/* 1. Sleek Compact Header Bar (Breadcrumb & Action Bar) */}
      <Box className="bg-card/80 border-b border-border/70 backdrop-blur-md sticky top-0 z-20">
        <Box className="px-3 sm:px-4 md:px-5 py-1.5 flex items-center justify-between gap-2">
          {/* Breadcrumb Navigation */}
          <Box className="flex items-center gap-1.5 min-w-0">
            <MuiButton
              variant="text"
              size="small"
              onClick={() => router.push("/clients")}
              startIcon={<ArrowBackOutlinedIcon sx={{ fontSize: 16 }} />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.75rem",
                color: "text.secondary",
                px: 1,
                py: 0.25,
                borderRadius: "8px",
                minWidth: "auto",
                "&:hover": { bgcolor: "action.hover", color: "text.primary" },
              }}
            >
              Clients
            </MuiButton>

            <Typography variant="caption" sx={{ color: "text.disabled", mx: 0.25 }}>
              /
            </Typography>

            <MuiButton
              variant="text"
              size="small"
              onClick={() => router.push(`/clients/${id}`)}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.75rem",
                color: "text.secondary",
                px: 1,
                py: 0.25,
                borderRadius: "8px",
                minWidth: "auto",
                maxWidth: { xs: 120, sm: 200, md: 300 },
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                "&:hover": { bgcolor: "action.hover", color: "text.primary" },
              }}
            >
              {client.name || "Client"}
            </MuiButton>

            <Typography variant="caption" sx={{ color: "text.disabled", mx: 0.25 }}>
              /
            </Typography>

            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                fontSize: "0.8125rem",
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <DescriptionOutlinedIcon sx={{ fontSize: 15, color: "primary.main" }} />
              <span>Contracts</span>
            </Typography>

            {/* ID Chip with Copy */}
            <Tooltip title={copiedId ? "Copied!" : "Click to copy ID"} arrow>
              <Chip
                label={id.slice(-6).toUpperCase()}
                size="small"
                onClick={handleCopyId}
                icon={
                  copiedId ? (
                    <CheckOutlinedIcon sx={{ fontSize: "14px !important", color: "#10b981 !important" }} />
                  ) : (
                    <ContentCopyOutlinedIcon sx={{ fontSize: "13px !important" }} />
                  )
                }
                sx={{
                  height: 22,
                  fontSize: "0.6875rem",
                  fontFamily: "monospace",
                  fontWeight: 600,
                  bgcolor: "action.selected",
                  border: "1px solid",
                  borderColor: "divider",
                  cursor: "pointer",
                  ml: 0.5,
                  "& .MuiChip-label": { px: 0.75 },
                  "&:hover": { bgcolor: "action.hover" },
                }}
              />
            </Tooltip>
          </Box>

          {/* Right Action & Permission Meta */}
          <Box className="flex items-center gap-2 shrink-0">
            {/* Permission Badge */}
            <Chip
              label={canModifyClients ? "Full Edit Access" : "Read-only"}
              size="small"
              icon={
                canModifyClients ? (
                  <EditOutlinedIcon sx={{ fontSize: "14px !important", color: "#10b981 !important" }} />
                ) : (
                  <LockOutlinedIcon sx={{ fontSize: "14px !important" }} />
                )
              }
              sx={{
                height: 24,
                fontSize: "0.6875rem",
                fontWeight: 600,
                bgcolor: canModifyClients ? "rgba(16, 185, 129, 0.08)" : "action.selected",
                color: canModifyClients ? "#10b981" : "text.secondary",
                border: "1px solid",
                borderColor: canModifyClients ? "rgba(16, 185, 129, 0.2)" : "divider",
                display: { xs: "none", sm: "inline-flex" },
              }}
            />

            {/* Refresh Button */}
            <Tooltip title="Refresh Contract Data" arrow>
              <IconButton
                size="small"
                onClick={() => refetch()}
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "8px",
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <RefreshOutlinedIcon
                  sx={{
                    fontSize: 16,
                    color: isFetching ? "primary.main" : "text.secondary",
                    animation: isFetching ? "spin 1s linear infinite" : "none",
                    "@keyframes spin": {
                      "0%": { transform: "rotate(0deg)" },
                      "100%": { transform: "rotate(360deg)" },
                    },
                  }}
                />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* 2. Executive Hero Banner (Compact & Polished) */}
        <Box className="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 border-t border-border/50 bg-muted/15">
          <Box className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Identity Column */}
            <Box className="flex items-center gap-3 min-w-0 flex-1">
              <Box className="relative shrink-0">
                {avatarSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarSrc}
                    alt={client.name || "Client"}
                    className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl object-cover border border-border shadow-xs"
                  />
                ) : (
                  <Box className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-[#1C252E] to-[#2563EB] text-white flex items-center justify-center font-bold text-sm sm:text-base shadow-xs border border-border/80">
                    {clientInitial}
                  </Box>
                )}
              </Box>

              <Box className="min-w-0 flex-1 space-y-0.5">
                <Box className="flex flex-wrap items-center gap-2">
                  <Typography
                    variant="h6"
                    component="h1"
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: "1.0625rem", sm: "1.1875rem" },
                      color: "text.primary",
                      lineHeight: 1.2,
                    }}
                    className="truncate max-w-[260px] sm:max-w-md"
                  >
                    {client.name || "Client Contracts"}
                  </Typography>

                  {client.clientId && (
                    <Chip
                      label={client.clientId}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.625rem",
                        fontFamily: "monospace",
                        fontWeight: 700,
                        bgcolor: "action.selected",
                        color: "text.secondary",
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    />
                  )}
                </Box>

                <Box className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <ApartmentOutlinedIcon sx={{ fontSize: 14, opacity: 0.7 }} />
                    {client.industry || "Client Contract Management & Commercial Terms"}
                  </span>
                </Box>
              </Box>
            </Box>

            {/* Quick Add Contract CTA */}
            {canModifyClients && (
              <Box className="flex items-center gap-2 self-start sm:self-center shrink-0">
                <MuiButton
                  variant="contained"
                  size="small"
                  onClick={() => router.push(`/clients/${id}/contract/new`)}
                  startIcon={<AddOutlinedIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    px: 1.75,
                    py: 0.75,
                    borderRadius: "9px",
                    boxShadow: "0 2px 4px rgba(37,99,235,0.2)",
                    "&:hover": {
                      bgcolor: "primary.dark",
                      boxShadow: "0 4px 8px rgba(37,99,235,0.3)",
                    },
                  }}
                >
                  New Contract
                </MuiButton>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* 3. Main Content Viewport (Fluid full width, zero excess margins) */}
      <Box className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 md:px-5 py-3 w-full">
        <ContractSection
          clientId={id}
          clientData={client}
          canModify={canModifyClients}
        />
      </Box>
    </Box>
  );
}
