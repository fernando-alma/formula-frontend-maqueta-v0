"use client"

import React from "react"

import { Clock, Gauge, Activity, TrendingUp } from "lucide-react"

// Mock lap data
const lapData = [
  { lap: 1, time: "1:35.234", s1: "32.456", s2: "28.122", s3: "34.656", best: false },
  { lap: 2, time: "1:34.012", s1: "31.890", s2: "27.844", s3: "34.278", best: false },
  { lap: 3, time: "1:33.567", s1: "31.456", s2: "27.556", s3: "34.555", best: false },
  { lap: 4, time: "1:32.890", s1: "31.234", s2: "27.334", s3: "34.322", best: false },
  { lap: 5, time: "1:32.450", s1: "30.890", s2: "27.112", s3: "34.448", best: true },
  { lap: 6, time: "1:33.123", s1: "31.567", s2: "27.678", s3: "33.878", best: false },
  { lap: 7, time: "1:32.789", s1: "31.123", s2: "27.222", s3: "34.444", best: false },
  { lap: 8, time: "1:33.456", s1: "31.789", s2: "27.445", s3: "34.222", best: false },
]

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
  return (
    <div className="h-full bg-[#09090b] p-4">
      {/* Top Bar */}
      <div className="bg-[#18181b] border border-zinc-800 rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-xs uppercase">Driver</span>
            <span className="text-white font-mono font-semibold">Lautaro (LAU)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-xs uppercase">Car</span>
            <span className="text-white font-mono">Fórmula 2.0 - Renault F4R</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-xs uppercase">Session</span>
            <span className="text-white font-mono">FP1 - 10:30 AM</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-green-400 text-xs font-mono">LIVE</span>
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
                  <th className="px-3 py-2 text-left font-medium">S1</th>
                  <th className="px-3 py-2 text-left font-medium">S2</th>
                  <th className="px-3 py-2 text-left font-medium">S3</th>
                </tr>
              </thead>
              <tbody>
                {lapData.map((lap) => (
                  <tr
                    key={lap.lap}
                    className={`border-b border-zinc-800/50 ${
                      lap.best ? 'bg-fuchsia-500/10' : 'hover:bg-zinc-800/30'
                    }`}
                  >
                    <td className={`px-3 py-2 font-mono text-sm ${lap.best ? 'text-fuchsia-400' : 'text-white'}`}>
                      {lap.lap}
                    </td>
                    <td className={`px-3 py-2 font-mono text-sm font-semibold ${lap.best ? 'text-fuchsia-400' : 'text-white'}`}>
                      {lap.time}
                    </td>
                    <td className="px-3 py-2 font-mono text-sm text-zinc-400">{lap.s1}</td>
                    <td className="px-3 py-2 font-mono text-sm text-zinc-400">{lap.s2}</td>
                    <td className="px-3 py-2 font-mono text-sm text-zinc-400">{lap.s3}</td>
                  </tr>
                ))}
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
            value="1:32.450"
            icon={<Clock className="w-4 h-4" />}
            highlight
          />
          <KPICard
            label="Top Speed"
            value="242"
            unit="km/h"
            icon={<Gauge className="w-4 h-4" />}
          />
          <KPICard
            label="Avg RPM"
            value="5,800"
            icon={<Activity className="w-4 h-4" />}
          />
          <KPICard
            label="Gap to Reference"
            value="+0.240"
            unit="s"
            icon={<TrendingUp className="w-4 h-4" />}
          />
          
          {/* Mini Stats */}
          <div className="bg-[#18181b] border border-zinc-800 rounded-lg p-4 flex-1">
            <h3 className="text-zinc-400 text-xs uppercase tracking-wider mb-3">Session Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 text-sm">Total Laps</span>
                <span className="text-white font-mono font-semibold">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 text-sm">Distance</span>
                <span className="text-white font-mono font-semibold">32.4 km</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 text-sm">Fuel Used</span>
                <span className="text-white font-mono font-semibold">4.2 L</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 text-sm">Tire Deg</span>
                <span className="text-yellow-400 font-mono font-semibold">12%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
