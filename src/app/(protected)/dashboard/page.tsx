"use client";

import { Building2, Briefcase, UserPlus, ArrowRight, TrendingUp, Calendar, Clock, CheckCircle2, TrendingDown, Users } from 'lucide-react'
import { useRouter } from "next/navigation"
import { CreateCandidateButton } from "@/components/candidates/create-candidate-button"
import { useState } from "react"
import { CreateClientModal } from "@/components/create-client-modal/create-client-modal"
import { CreateJobRequirementForm } from "@/components/new-jobs/create-jobs-form";
import { useAuth } from "@/contexts/AuthContext"
import { DashboardKpiCards } from "@/components/dashboard/dashboard-kpi-cards";

export default function DashboardPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [openJobModal, setJobModal] = useState(false);

    const firstName = user?.name ? user.name.split(' ')[0] : 'there';

    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <>
            <div className="flex flex-col w-full h-full py-2 px-2 space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="relative overflow-hidden rounded-[2rem] bg-brand text-white p-6 shadow-xl shadow-brand/20">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 opacity-20 pointer-events-none">
                        <svg width="300" height="300" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 0C44.7715 0 0 44.7715 0 100C0 155.228 44.7715 200 100 200C155.228 200 200 155.228 200 100C200 44.7715 155.228 0 100 0ZM100 190C50.2944 190 10 149.706 10 100C10 50.2944 50.2944 10 100 10C149.706 10 190 50.2944 190 100C190 149.706 149.706 190 100 190Z" fill="currentColor" />
                        </svg>
                    </div>
                    <div className="absolute -bottom-20 right-40 opacity-20 pointer-events-none">
                        <svg width="200" height="200" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="75" cy="75" r="75" fill="currentColor" />
                        </svg>
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold tracking-tight">Welcome back, {firstName}!</h3>
                            <p className="text-white/80 max-w-lg text-lg">
                                Here are the quick actions to get your recruitment workflow started for today.
                            </p>
                        </div>
                        <div className="flex-shrink-0 self-start md:self-auto">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-medium backdrop-blur-sm shadow-sm hover:bg-white/20 transition-colors">
                                <Calendar className="w-4 h-4" />
                                {currentDate}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard KPI Metrics */}
                <DashboardKpiCards />

                {/* Quick Actions */}
                <div className="grid md:grid-cols-3 gap-6">
                    <button
                        onClick={() => setOpen(true)}
                        className="group flex flex-col items-start p-8 rounded-[1.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-brand/5 hover:border-brand/20 transition-all duration-300 text-left h-full"
                    >
                        <div className="p-4 bg-brand/10 rounded-2xl text-brand group-hover:scale-110 group-hover:bg-brand group-hover:text-white transition-all duration-300 mb-6">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-[#2B3674] mb-3">Create a Client</h2>
                        <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-1">
                            Clients host the different jobs under your agency&apos;s account. Setup a new client workspace.
                        </p>
                        <div className="flex items-center text-sm font-semibold text-brand mt-auto">
                            Get started <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1.5 transition-transform" />
                        </div>
                    </button>

                    <button
                        onClick={() => setJobModal(true)}
                        className="group flex flex-col items-start p-8 rounded-[1.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-brand/5 hover:border-brand/20 transition-all duration-300 text-left h-full"
                    >
                        <div className="p-4 bg-brand/10 rounded-2xl text-brand group-hover:scale-110 group-hover:bg-brand group-hover:text-white transition-all duration-300 mb-6">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-[#2B3674] mb-3">Create Job Requirement</h2>
                        <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-1">
                            A new position opened up? Add it to the job list and start sourcing candidates immediately.
                        </p>
                        <div className="flex items-center text-sm font-semibold text-brand mt-auto">
                            Get started <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1.5 transition-transform" />
                        </div>
                    </button>

                    <div className="group flex flex-col items-start p-8 rounded-[1.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-brand/5 hover:border-brand/20 transition-all duration-300 text-left relative overflow-hidden h-full">
                        <div className="p-4 bg-brand/10 rounded-2xl text-brand group-hover:scale-110 group-hover:bg-brand group-hover:text-white transition-all duration-300 mb-6">
                            <UserPlus className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-[#2B3674] mb-3">Create a Candidate</h2>
                        <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-1">
                            Add a new candidate profile to your database and manage their recruitment journey.
                        </p>
                        <div className="mt-auto w-full">
                            <CreateCandidateButton className="w-full h-11 bg-brand/10 text-brand hover:bg-brand hover:text-white font-medium rounded-xl transition-all shadow-none flex items-center justify-center border-none">
                                Create Candidate
                            </CreateCandidateButton>
                        </div>
                    </div>
                </div>

            </div>

            <CreateClientModal
                open={open}
                onOpenChange={setOpen}
            />
            <CreateJobRequirementForm
                open={openJobModal}
                onOpenChange={setJobModal}
            />
        </>
    )
}
