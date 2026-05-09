"use client"

import { Line, Bar, Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export function AdminDashboardCharts() {
  // Using pure standard colors instead of custom hsl tracking
  const colors = {
    primary: '#4f46e5', // indigo-600
    primaryLight: 'rgba(79, 70, 229, 0.1)',
    secondary: '#0ea5e9', // sky-500
    secondaryLight: 'rgba(14, 165, 233, 0.1)',
    muted: '#94a3b8',
    grid: 'rgba(0, 0, 0, 0.05)'
  }

  const lineData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Candidates Sourced',
        data: [42, 58, 45, 82, 91, 32, 28],
        borderColor: colors.primary,
        backgroundColor: colors.primaryLight,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
      },
      {
        label: 'Placements',
        data: [12, 19, 22, 14, 28, 9, 11],
        borderColor: colors.secondary,
        backgroundColor: colors.secondaryLight,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
      }
    ],
  }

  const barData = {
    labels: ['LinkedIn', 'Indeed', 'Internal', 'Social'],
    datasets: [
      {
        label: 'Performance by Channel',
        data: [320, 190, 480, 150],
        backgroundColor: [
          colors.primary,
          '#6366f1',
          '#818cf8',
          '#a5b4fc',
        ],
        borderRadius: 4,
      }
    ],
  }

  const doughnutData = {
    labels: ['Engineering', 'Design', 'Marketing', 'Sales'],
    datasets: [
      {
        data: [45, 15, 12, 28],
        backgroundColor: [
            colors.primary,
            '#6366f1',
            '#818cf8',
            '#a5b4fc',
        ],
        borderWidth: 0,
      }
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 20,
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: colors.grid,
        },
        border: { display: false }
      },
      x: {
        grid: {
          display: false,
        },
        border: { display: false }
      }
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="border border-[hsl(var(--border))] rounded-xl bg-card p-6">
        <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-6">Activity Overview</h3>
        <div className="h-[300px]">
          <Line options={chartOptions as any} data={lineData} />
        </div>
      </div>

      <div className="border border-[hsl(var(--border))] rounded-xl bg-card p-6">
        <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-6">Sourcing Channels</h3>
        <div className="h-[300px]">
          <Bar options={chartOptions as any} data={barData} />
        </div>
      </div>

      <div className="lg:col-span-2 border border-[hsl(var(--border))] rounded-xl bg-card p-6">
        <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-6">Department Distribution</h3>
        <div className="h-[300px] w-full max-w-[500px] mx-auto">
           <Doughnut 
              options={{
                ...chartOptions,
                cutout: '70%',
              } as any} 
              data={doughnutData} 
           />
        </div>
      </div>
    </div>
  )
}
