"use client"

import React, { useMemo } from "react"
import { Clock, Gauge, Activity, TrendingUp, Loader2, AlertCircle } from "lucide-react"
import { useTelemetryContext } from "@/context/TelemetryContext"
import { formatLapTime, formatDistance } from "@/lib/utils/formatters"

// Track SVG path (figure-8 style circuit)
function TrackMap() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      {/* Track outline */}
      <path
        d="M 80 150
           C 80 80, 150 50, 200 50
           C 250 50, 320 80, 320 150
           C 320 180, 280 200, 250 200
           C 220 200, 200 220, 200 250
           C 200 280, 150 280, 120 250
           C 90 220, 80 200, 80 150"
        fill="none"
        stroke="#3f3f46"
        strokeWidth="24"
        strokeLinecap="round"
      />
      {/* Track segments with heat colors */}
      <path
        d="M 80 150 C 80 80, 150 50, 200 50"
        fill="none"
        stroke="#22c55e"
        strokeWidth="20"
        strokeLinecap="round"
      />
      <path
        d="M 200 50 C 250 50, 320 80, 320 150"
        fill="none"
        stroke="#84cc16"
        strokeWidth="20"
        strokeLinecap="round"
      />
      <path
        d="M 320 150 C 320 180, 280 200, 250 200"
        fill="none"
        stroke="#ef4444"
        strokeWidth="20"
        strokeLinecap="round"
      />
      <path
        d="M 250 200 C 220 200, 200 220, 200 250"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="20"
        strokeLinecap="round"
      />
      <path
        d="M 200 250 C 200 280, 150 280, 120 250"
        fill="none"
        stroke="#22c55e"
        strokeWidth="20"
        strokeLinecap="round"
      />
      <path
        d="M 120 250 C 90 220, 80 200, 80 150"
        fill="none"
        stroke="#ef4444"
        strokeWidth="20"
        strokeLinecap="round"
      />
      {/* Start/Finish line */}
      <line x1="75" y1="150" x2="85" y2="150" stroke="white" strokeWidth="4" />
      {/* Sector markers */}
      <circle cx="200" cy="50" r="6" fill="#22d3ee" />
      <circle cx="250" cy="200" r="6" fill="#22d3ee" />
      <text x="195" y="35" fill="#a1a1aa" className="text-[10px] font-mono">S1</text>
      <text x="265" y="205" fill="#a1a1aa" className="text-[10px] font-mono">S2</text>
      <text x="105" y="265" fill="#a1a1aa" className="text-[10px] font-mono">S3</text>
    </svg>
  )
}

interface KPICardProps {
  label: string
  value: string
  unit?: string
  icon: React.ReactNode
  highlight?: boolean
}

function KPICard({ label, value, unit, icon, highlight }: KPICardProps) {
  return (
    <div className={`bg-zinc-900 border rounded-lg p-4 ${highlight ? 'border-cyan-400/50' : 'border-zinc-800'}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`${highlight ? 'text-cyan-400' : 'text-zinc-500'}`}>
          {icon}
        </div>
        <span className="text-zinc-400 text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`font-mono text-2xl font-bold ${highlight ? 'text-cyan-400' : 'text-white'}`}>
          {value}
        </span>
        {unit && <span className="text-zinc-500 text-sm font-mono">{unit}</span>}
      </div>
    </div>
  )
}

export function SessionDashboard() {
  const { session, loading, error } = useTelemetryContext()

  // Calculate stats from session data
  const stats = useMemo(() => {
    if (!session || session.laps.length === 0) {
      return {
        bestLap: null,
        bestLapTime: '--:--.---',
        topSpeed: 0,
        avgRPM: 0,
        totalDistance: 0,
        totalFuel: 0,
      }
    }

    const bestLap = session.laps.reduce((best, lap) =>
      lap.lap_time < best.lap_time ? lap : best
    )

    const topSpeed = Math.max(...session.laps.map(l => l.max_speed))
    const avgRPM = session.laps.reduce((sum, l) => sum + l.avg_rpm, 0) / session.laps.length
    const totalDistance = session.laps.reduce((sum, l) => sum + l.distance, 0)
    const totalFuel = session.laps.reduce((sum, l) => sum + l.fuel_used, 0)

    return {
      bestLap,
      bestLapTime: formatLapTime(bestLap.lap_time),
      topSpeed: Math.round(topSpeed),
      avgRPM: Math.round(avgRPM),
      totalDistance,
      totalFuel,
    }
  }, [session])

  // Loading state
  if (loading) {
    return (
      <div className="h-full bg-[#09090b] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 mx-auto mb-4 animate-spin" />
          <p className="text-zinc-400">Loading session data...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="h-full bg-[#09090b] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  // No session state
  if (!session) {
    return (
      <div className="h-full bg-[#09090b] flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400">No session loaded. Please upload a telemetry file.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-[#09090b] p-4">
      {/* Top Bar */}
      <div className="bg-[#18181b] border border-zinc-800 rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-xs uppercase">Driver</span>
            <span className="text-white font-mono font-semibold">{session.driver}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-xs uppercase">Car</span>
            <span className="text-white font-mono">{session.vehicle}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-xs uppercase">Track</span>
            <span className="text-white font-mono">{session.track}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-xs uppercase">Date</span>
            <span className="text-white font-mono">{session.date}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-green-400 text-xs font-mono">LOADED</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-4 h-[calc(100%-72px)]">
        {/* Left Panel - Lap Table */}
        <div className="col-span-4 bg-[#18181b] border border-zinc-800 rounded-lg overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-zinc-800">
            <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Lap Times</h2>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead className="bg-zinc-900/50 sticky top-0">
                <tr className="text-zinc-500 text-xs uppercase">
                  <th className="px-3 py-2 text-left font-medium">Lap</th>
                  <th className="px-3 py-2 text-left font-medium">Time</th>
                  <th className="px-3 py-2 text-left font-medium">Max Speed</th>
                  <th className="px-3 py-2 text-left font-medium">Avg RPM</th>
                </tr>
              </thead>
              <tbody>
                {session.laps.map((lap) => {
                  const isBest = stats.bestLap?.lap_number === lap.lap_number
                  return (
                    <tr
                      key={lap.lap_number}
                      className={`border-b border-zinc-800/50 ${
                        isBest ? 'bg-fuchsia-500/10' : 'hover:bg-zinc-800/30'
                      }`}
                    >
                      <td className={`px-3 py-2 font-mono text-sm ${isBest ? 'text-fuchsia-400' : 'text-white'}`}>
                        {lap.lap_number}
                      </td>
                      <td className={`px-3 py-2 font-mono text-sm font-semibold ${isBest ? 'text-fuchsia-400' : 'text-white'}`}>
                        {formatLapTime(lap.lap_time)}
                      </td>
                      <td className="px-3 py-2 font-mono text-sm text-zinc-400">
                        {Math.round(lap.max_speed)} km/h
                      </td>
                      <td className="px-3 py-2 font-mono text-sm text-zinc-400">
                        {Math.round(lap.avg_rpm).toLocaleString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Center Panel - Track Map */}
        <div className="col-span-5 bg-[#18181b] border border-zinc-800 rounded-lg overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Track Heatmap</h2>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-green-500" />
                <span className="text-zinc-400">Fast</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-yellow-500" />
                <span className="text-zinc-400">Mid</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-red-500" />
                <span className="text-zinc-400">Slow</span>
              </div>
            </div>
          </div>
          <div className="flex-1 p-4">
            <TrackMap />
          </div>
        </div>

        {/* Right Panel - KPIs */}
        <div className="col-span-3 flex flex-col gap-4">
          <KPICard
            label="Best Lap"
            value={stats.bestLapTime}
            icon={<Clock className="w-4 h-4" />}
            highlight
          />
          <KPICard
            label="Top Speed"
            value={stats.topSpeed.toString()}
            unit="km/h"
            icon={<Gauge className="w-4 h-4" />}
          />
          <KPICard
            label="Avg RPM"
            value={stats.avgRPM.toLocaleString()}
            icon={<Activity className="w-4 h-4" />}
          />
          <KPICard
            label="Sample Rate"
            value={session.sample_rate_hz.toString()}
            unit="Hz"
            icon={<TrendingUp className="w-4 h-4" />}
          />

          {/* Mini Stats */}
          <div className="bg-[#18181b] border border-zinc-800 rounded-lg p-4 flex-1">
            <h3 className="text-zinc-400 text-xs uppercase tracking-wider mb-3">Session Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 text-sm">Total Laps</span>
                <span className="text-white font-mono font-semibold">{session.lap_count}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 text-sm">Distance</span>
                <span className="text-white font-mono font-semibold">{formatDistance(stats.totalDistance)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 text-sm">Fuel Used</span>
                <span className="text-white font-mono font-semibold">{stats.totalFuel.toFixed(1)} L</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 text-sm">Session ID</span>
                <span className="text-zinc-400 font-mono text-xs">{session.session_id.slice(0, 8)}...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
