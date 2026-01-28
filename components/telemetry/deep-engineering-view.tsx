"use client"

import { useState, useMemo } from "react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
} from "recharts"

// Generate mock telemetry data
function generateTelemetryData() {
  const data = []
  for (let i = 0; i <= 4050; i += 50) {
    const distance = i
    const phase = (i / 4050) * Math.PI * 4

    // Speed simulation with realistic variations
    const baseSpeed = 180 + Math.sin(phase) * 60
    const refSpeed = Math.max(80, Math.min(260, baseSpeed + Math.sin(phase * 2) * 20))
    const currentSpeed = Math.max(80, Math.min(255, baseSpeed + Math.sin(phase * 2 + 0.3) * 18))

    // RPM correlated with speed
    const refRPM = Math.max(4000, Math.min(8000, 4500 + (refSpeed / 260) * 3500 + Math.random() * 200))
    const currentRPM = Math.max(4000, Math.min(8000, 4500 + (currentSpeed / 260) * 3400 + Math.random() * 200))

    // Throttle and brake (inverse relationship)
    const isCorner = Math.sin(phase * 2) < -0.3
    const throttle = isCorner ? Math.max(0, 30 + Math.random() * 30) : Math.min(100, 85 + Math.random() * 15)
    const brake = isCorner ? Math.max(0, 60 + Math.random() * 40) : 0

    // Delta time (positive = slower, negative = faster)
    const delta = (currentSpeed - refSpeed) / 100 * -0.5 + (Math.random() - 0.5) * 0.1

    data.push({
      distance,
      refSpeed: Math.round(refSpeed),
      currentSpeed: Math.round(currentSpeed),
      refRPM: Math.round(refRPM),
      currentRPM: Math.round(currentRPM),
      throttle: Math.round(throttle),
      brake: Math.round(brake),
      delta: Number(delta.toFixed(3)),
    })
  }
  return data
}

// Track map with car position
function TrackMapWithCar({ progress }: { progress: number }) {
  // Calculate position on track path based on progress (0-1)
  const getCarPosition = (p: number) => {
    // Simplified path calculation for figure-8 track
    const angle = p * Math.PI * 2
    const x = 200 + Math.sin(angle) * 100 + Math.sin(angle * 2) * 30
    const y = 150 + Math.cos(angle) * 80 - Math.cos(angle * 2) * 40
    return { x, y }
  }

  const carPos = getCarPosition(progress)

  return (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      {/* Track background */}
      <path
        d="M 80 150 
           C 80 80, 150 50, 200 50 
           C 250 50, 320 80, 320 150 
           C 320 180, 280 200, 250 200 
           C 220 200, 200 220, 200 250 
           C 200 280, 150 280, 120 250 
           C 90 220, 80 200, 80 150"
        fill="none"
        stroke="#27272a"
        strokeWidth="20"
        strokeLinecap="round"
      />
      {/* Track colored */}
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
        strokeWidth="16"
        strokeLinecap="round"
      />
      {/* Start/Finish */}
      <line x1="75" y1="150" x2="85" y2="150" stroke="white" strokeWidth="3" />
      
      {/* Sector markers */}
      <circle cx="200" cy="50" r="4" fill="#22d3ee" opacity={0.5} />
      <circle cx="250" cy="200" r="4" fill="#22d3ee" opacity={0.5} />
      
      {/* Ghost car trail */}
      <circle cx={carPos.x} cy={carPos.y} r="16" fill="#d946ef" opacity={0.15} />
      <circle cx={carPos.x} cy={carPos.y} r="10" fill="#d946ef" opacity={0.3} />
      
      {/* Car position (neon dot) */}
      <circle
        cx={carPos.x}
        cy={carPos.y}
        r="6"
        fill="#d946ef"
        filter="url(#glow)"
      />
      
      {/* Glow filter */}
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  )
}

export function DeepEngineeringView() {
  const [scrubberPosition, setScrubberPosition] = useState(50)
  const telemetryData = useMemo(() => generateTelemetryData(), [])

  const currentDataIndex = Math.floor((scrubberPosition / 100) * (telemetryData.length - 1))
  const currentData = telemetryData[currentDataIndex]

  // Calculate time lost in current sector
  const sectorStart = Math.floor(currentDataIndex / (telemetryData.length / 3)) * (telemetryData.length / 3)
  const sectorEnd = Math.min(sectorStart + telemetryData.length / 3, currentDataIndex)
  const timeLost = telemetryData
    .slice(sectorStart, sectorEnd)
    .reduce((acc, d) => acc + d.delta, 0)

  return (
    <div className="h-full bg-[#09090b] p-4 flex flex-col">
      {/* Top Section - Telemetry Charts (60% height) */}
      <div className="h-[60%] flex flex-col gap-2 mb-4">
        {/* Speed Chart */}
        <div className="flex-1 bg-[#18181b] border border-zinc-800 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-zinc-400 text-xs uppercase tracking-wider">Speed (km/h)</h3>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="text-zinc-400">Reference</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-fuchsia-500" />
                <span className="text-zinc-400">Current</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={telemetryData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="distance" hide />
              <YAxis domain={[60, 280]} tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={false} width={35} />
              <Tooltip
                contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '4px' }}
                labelStyle={{ color: '#a1a1aa' }}
              />
              <Line type="monotone" dataKey="refSpeed" stroke="#22d3ee" strokeWidth={2} dot={false} name="Reference" />
              <Line type="monotone" dataKey="currentSpeed" stroke="#d946ef" strokeWidth={2} dot={false} name="Current" />
              <ReferenceLine x={currentData?.distance} stroke="white" strokeWidth={1} strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* RPM Chart */}
        <div className="flex-1 bg-[#18181b] border border-zinc-800 rounded-lg p-3">
          <h3 className="text-zinc-400 text-xs uppercase tracking-wider mb-1">RPM</h3>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={telemetryData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="distance" hide />
              <YAxis domain={[3500, 8500]} tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={false} width={35} />
              <Line type="monotone" dataKey="refRPM" stroke="#22d3ee" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="currentRPM" stroke="#d946ef" strokeWidth={2} dot={false} />
              <ReferenceLine x={currentData?.distance} stroke="white" strokeWidth={1} strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pedals Chart */}
        <div className="flex-1 bg-[#18181b] border border-zinc-800 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-zinc-400 text-xs uppercase tracking-wider">Pedals</h3>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-zinc-400">Throttle</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-zinc-400">Brake</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={telemetryData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="distance" hide />
              <YAxis domain={[0, 100]} tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={false} width={35} />
              <Area type="monotone" dataKey="throttle" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} strokeWidth={2} />
              <Area type="monotone" dataKey="brake" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} strokeWidth={2} />
              <ReferenceLine x={currentData?.distance} stroke="white" strokeWidth={1} strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scrubber */}
      <div className="mb-4 bg-[#18181b] border border-zinc-800 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-zinc-400 text-xs uppercase tracking-wider">Distance Scrubber</span>
          <span className="text-white font-mono text-sm">{currentData?.distance}m / 4050m</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={scrubberPosition}
          onChange={(e) => setScrubberPosition(Number(e.target.value))}
          className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
      </div>

      {/* Bottom Section (40% height) */}
      <div className="flex-1 grid grid-cols-12 gap-4">
        {/* Delta Panel */}
        <div className="col-span-5 bg-[#18181b] border border-zinc-800 rounded-lg p-4 flex flex-col">
          <h3 className="text-zinc-400 text-xs uppercase tracking-wider mb-2">Time Delta</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryData} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis 
                  dataKey="distance" 
                  tick={{ fill: '#71717a', fontSize: 10 }} 
                  tickLine={false} 
                  axisLine={{ stroke: '#27272a' }}
                  label={{ value: 'Distance (m)', position: 'bottom', fill: '#71717a', fontSize: 10 }}
                />
                <YAxis domain={[-0.5, 0.5]} tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={false} width={35} />
                <ReferenceLine y={0} stroke="#3f3f46" />
                <Area
                  type="monotone"
                  dataKey="delta"
                  stroke="#d946ef"
                  fill="#d946ef"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <ReferenceLine x={currentData?.distance} stroke="white" strokeWidth={1} strokeDasharray="3 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 pt-2 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-zinc-500 text-sm">Time Lost in Sector</span>
            <span className={`font-mono text-lg font-bold ${timeLost > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {timeLost > 0 ? '+' : ''}{timeLost.toFixed(3)}s
            </span>
          </div>
        </div>

        {/* Track Map */}
        <div className="col-span-4 bg-[#18181b] border border-zinc-800 rounded-lg p-4 flex flex-col">
          <h3 className="text-zinc-400 text-xs uppercase tracking-wider mb-2">Track Position</h3>
          <div className="flex-1">
            <TrackMapWithCar progress={scrubberPosition / 100} />
          </div>
        </div>

        {/* Live Data Panel */}
        <div className="col-span-3 bg-[#18181b] border border-zinc-800 rounded-lg p-4 flex flex-col">
          <h3 className="text-zinc-400 text-xs uppercase tracking-wider mb-3">Live Data</h3>
          <div className="space-y-4 flex-1">
            <div>
              <span className="text-zinc-500 text-xs block mb-1">Speed</span>
              <div className="flex items-baseline gap-2">
                <span className="text-fuchsia-400 font-mono text-2xl font-bold">{currentData?.currentSpeed}</span>
                <span className="text-zinc-500 font-mono text-sm">km/h</span>
              </div>
            </div>
            <div>
              <span className="text-zinc-500 text-xs block mb-1">RPM</span>
              <div className="flex items-baseline gap-2">
                <span className="text-white font-mono text-2xl font-bold">{currentData?.currentRPM.toLocaleString()}</span>
              </div>
            </div>
            <div>
              <span className="text-zinc-500 text-xs block mb-1">Throttle</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-100"
                    style={{ width: `${currentData?.throttle}%` }}
                  />
                </div>
                <span className="text-white font-mono text-sm w-10 text-right">{currentData?.throttle}%</span>
              </div>
            </div>
            <div>
              <span className="text-zinc-500 text-xs block mb-1">Brake</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 transition-all duration-100"
                    style={{ width: `${currentData?.brake}%` }}
                  />
                </div>
                <span className="text-white font-mono text-sm w-10 text-right">{currentData?.brake}%</span>
              </div>
            </div>
            <div>
              <span className="text-zinc-500 text-xs block mb-1">Delta</span>
              <span className={`font-mono text-lg font-bold ${currentData?.delta > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {currentData?.delta > 0 ? '+' : ''}{currentData?.delta.toFixed(3)}s
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
