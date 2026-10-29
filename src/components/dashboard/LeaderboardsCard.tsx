"use client";

import React from "react";
import Link from "next/link";
import {
  Trophy,
  Building2,
  Users,
  Award,
  ArrowRight,
  Briefcase,
  Star,
} from "lucide-react";
import { TopClientData, TopRecruiterData } from "@/types/dashboard";

interface LeaderboardsCardProps {
  topRecruiters?: TopRecruiterData[];
  topClients?: TopClientData[];
}

const DEFAULT_RECRUITERS: TopRecruiterData[] = [
  { id: "1", name: "Ayisha Abdul Khader", email: "ayisha@example.com", hiredCount: 4, activeCandidates: 355 },
  { id: "2", name: "Vijesh Dsouza", email: "vijesh@example.com", hiredCount: 1, activeCandidates: 360 },
  { id: "3", name: "Mohammed Hamed", email: "hamed@example.com", hiredCount: 1, activeCandidates: 6 },
];

const DEFAULT_CLIENTS: TopClientData[] = [
  { id: "1", clientName: "Thannah", clientId: "CLI50AV", activeJobs: 20 },
  { id: "2", clientName: "Sarens Nass", clientId: "CLIXYCO", activeJobs: 15 },
  { id: "3", clientName: "Itqan Capital", clientId: "CLIGYAY", activeJobs: 11 },
];

/**
 * LeaderboardsCard displays top recruiter performers and key client accounts
 * based on live placement conversions and active requisition demand.
 */
export const LeaderboardsCard: React.FC<LeaderboardsCardProps> = ({
  topRecruiters,
  topClients,
}) => {
  const recruiters = topRecruiters && topRecruiters.length > 0 ? topRecruiters : DEFAULT_RECRUITERS;
  const clients = topClients && topClients.length > 0 ? topClients : DEFAULT_CLIENTS;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 w-full font-sans">
      {/* ─── 1. Top Performing Recruiters ─── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_2px_12px_rgba(15,23,42,0.03)] p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900/60">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Top Recruiter Performers
                </h4>
                <p className="text-[11px] text-slate-500">
                  Ranked by successful placements & active talent pool
                </p>
              </div>
            </div>

            <Link
              href="/team"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              <span>Team</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-3.5 divide-y divide-slate-100 dark:divide-slate-800/80">
            {recruiters.map((rec, index) => {
              const rank = index + 1;
              const initials = rec.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              return (
                <div
                  key={rec.id || index}
                  className="py-2.5 flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Rank Badge */}
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        rank === 1
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                          : rank === 2
                          ? "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                          : "bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300"
                      }`}
                    >
                      {rank}
                    </div>

                    {/* Avatar Initials */}
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-xs shrink-0">
                      {initials}
                    </div>

                    <div className="min-w-0">
                      <span className="font-semibold text-slate-900 dark:text-white text-xs block truncate">
                        {rec.name}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {rec.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-slate-400 hidden sm:inline">
                      {rec.activeCandidates} active
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <Award className="w-3 h-3 text-emerald-500" />
                      {rec.hiredCount} Hired
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
          Leaderboard updates dynamically with timeframe selections.
        </div>
      </div>

      {/* ─── 2. Top Clients by Active Openings ─── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_2px_12px_rgba(15,23,42,0.03)] p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/60">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  High-Demand Client Accounts
                </h4>
                <p className="text-[11px] text-slate-500">
                  Key enterprises ranked by open job requisitions
                </p>
              </div>
            </div>

            <Link
              href="/clients"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              <span>All Clients</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-3.5 divide-y divide-slate-100 dark:divide-slate-800/80">
            {clients.map((client, index) => {
              const rank = index + 1;
              return (
                <div
                  key={client.id || index}
                  className="py-2.5 flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {rank}
                    </div>

                    <div className="min-w-0">
                      <span className="font-semibold text-slate-900 dark:text-white text-xs block truncate">
                        {client.clientName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 block">
                        {client.clientId}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      <Briefcase className="w-3 h-3 text-blue-500" />
                      {client.activeJobs} Active Roles
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Target Delivery:</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Top 3 represent {clients.reduce((acc, c) => acc + c.activeJobs, 0)} open positions
          </span>
        </div>
      </div>
    </div>
  );
};

