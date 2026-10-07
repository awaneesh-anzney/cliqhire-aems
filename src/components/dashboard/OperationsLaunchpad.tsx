"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

// Material UI Icons
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";

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
  const router = useRouter();

  const launchActions = [
    {
      title: "Capture Talent",
      subtitle: "Add a candidate to system & parse resume",
      icon: <PersonAddAlt1OutlinedIcon sx={{ fontSize: 18, color: "#10B981" }} />,
      bg: "#ECFDF5",
      badge: "Intake",
      badgeColor: "#10B981",
      badgeBg: "#ECFDF5",
      onClick: onOpenCandidate,
    },
    {
      title: "Post Requisition",
      subtitle: "Open job requirement & assign recruiters",
      icon: <WorkOutlineOutlinedIcon sx={{ fontSize: 18, color: "#0284C7" }} />,
      bg: "#E0F2FE",
      badge: "Requisition",
      badgeColor: "#0284C7",
      badgeBg: "#E0F2FE",
      onClick: onOpenJob,
    },
    {
      title: "Onboard Client",
      subtitle: "Register enterprise client & set terms",
      icon: <BusinessOutlinedIcon sx={{ fontSize: 18, color: "#8B5CF6" }} />,
      bg: "#F5F3FF",
      badge: "Account",
      badgeColor: "#8B5CF6",
      badgeBg: "#F5F3FF",
      onClick: onOpenClient,
    },
    {
      title: "Create Agreement",
      subtitle: "Generate and send contract",
      icon: <DescriptionOutlinedIcon sx={{ fontSize: 18, color: "#F43F5E" }} />,
      bg: "#FFF1F2",
      badge: "Legal",
      badgeColor: "#F43F5E",
      badgeBg: "#FFF1F2",
      onClick: () => router.push("/contracts"),
    },
  ];

  return (
    <Box className="w-full h-full flex flex-col justify-between rounded-[16px] border border-[#E7EDF4] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_4px_16px_rgba(15,23,42,0.04)] p-4 sm:p-5 font-sans transition-all">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FFF1F2] dark:bg-rose-950/30 text-[#F43F5E] flex items-center justify-center shrink-0">
            <RocketLaunchOutlinedIcon sx={{ fontSize: 18 }} />
          </div>
          <h2 className="text-sm sm:text-base font-bold text-[#172033] dark:text-white tracking-tight leading-tight">
            Operations Launchpad
          </h2>
        </div>

        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FFF1F2] text-[#F43F5E] text-[10.5px] font-bold">
          Quick Actions
        </span>
      </div>

      {/* 4 Interactive Action Cards */}
      <div className="py-2.5 flex-1 flex flex-col justify-between gap-2.5">
        {launchActions.map((action, idx) => (
          <Button
            key={idx}
            onClick={action.onClick}
            sx={{
              width: "100%",
              p: 1.5,
              borderRadius: "12px",
              border: "1px solid #E7EDF4",
              bgcolor: "#FFFFFF",
              textTransform: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              textAlign: "left",
              transition: "all 0.18s ease-in-out",
              "&:hover": {
                bgcolor: "#F8FAFC",
                borderColor: "#CBD5E1",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(15, 23, 42, 0.04)",
              },
            }}
            className="group dark:!bg-slate-800/60 dark:!border-slate-700/80 dark:hover:!bg-slate-800"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                style={{ backgroundColor: action.bg }}
              >
                {action.icon}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#172033", lineHeight: 1.2 }} className="dark:!text-white">
                    {action.title}
                  </Typography>
                  <span
                    className="text-[9.5px] font-bold px-1.5 py-0.2 rounded"
                    style={{
                      color: action.badgeColor,
                      backgroundColor: action.badgeBg,
                    }}
                  >
                    {action.badge}
                  </span>
                </div>
                <Typography sx={{ fontSize: "11px", color: "#64748B", mt: 0.25 }} className="dark:!text-[#94A3B8] truncate">
                  {action.subtitle}
                </Typography>
              </div>
            </div>

            <ChevronRightOutlinedIcon
              sx={{ fontSize: 18 }}
              className="text-[#94A3B8] group-hover:text-[#2563EB] group-hover:translate-x-0.5 transition-all shrink-0 ml-1"
            />
          </Button>
        ))}
      </div>
    </Box>
  );
}
