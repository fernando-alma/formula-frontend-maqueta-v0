"use client"

import { useState, useMemo, useEffect } from "react"
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
import { Loader2, AlertCircle } from "lucide-react"
import { useTelemetryContext } from "@/context/TelemetryContext"
import type { LapDetail, TelemetryPoint } from "@/lib/types/telemetry"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Transform API telemetry points to chart format
function transformTelemetryData(points: TelemetryPoint[]) {
  return points.map((point, index, arr) => {
    // Calculate delta (comparison with a "reference" - using smoothed version)
    const windowSize = 5
    const start = Math.max(0, index - windowSize)
    const end = Math.min(arr.length, index + windowSize)
    const avgSpeed = arr.slice(start, end).reduce((sum, p) => sum + p.speed, 0) / (end - start)
    const delta = (point.speed - avgSpeed) / 100 * -0.5

    return {
      distance: Math.round(point.lap_dist),
      distancePct: point.lap_dist_pct,
      time: point.time,
      currentSpeed: Math.round(point.speed),
      refSpeed: Math.round(avgSpeed),
      currentRPM: Math.round(point.rpm),
      refRPM: Math.round(point.rpm * 0.98),
      throttle: Math.round(point.throttle * 100),
      brake: Math.round(point.brake * 100),
      delta: Number(delta.toFixed(3)),
      lat: point.lat,
      lon: point.lon,
    }
  })
}

// Track map with car position
function TrackMapWithCar({ progress, points }: { progress: number; points?: TelemetryPoint[] }) {
  // Calculate position on track path based on progress (0-1)
  const getCarPosition = (p: number) => {
    if (points && points.length > 0) {
      const index = Math.floor(p * (points.length - 1))
      const point = points[index]
      if (point && point.lat !== 0 && point.lon !== 0) {
        // Normalize lat/lon to SVG coordinates
        const lats = points.map(pt => pt.lat).filter(l => l !== 0)
        const lons = points.map(pt => pt.lon).filter(l => l !== 0)
        if (lats.length > 0 && lons.length > 0) {
          const minLat = Math.min(...lats)
          const maxLat = Math.max(...lats)
          const minLon = Math.min(...lons)
          const maxLon = Math.max(...lons)
          const x = 50 + ((point.lon - minLon) / (maxLon - minLon || 1)) * 300
          const y = 50 + ((maxLat - point.lat) / (maxLat - minLat || 1)) * 200
          return { x, y }
        }
      }
    }
    // Fallback to figure-8 calculation
    const angle = p * Math.PI * 2
    const x = 200 + Math.sin(angle) * 100 + Math.sin(angle * 2) * 30
    const y = 150 + Math.cos(angle) * 80 - Math.cos(angle * 2) * 40
    return { x, y }
  }

  const carPos = getCarPosition(progress)

  // Generate track path from points if available
  const trackPath = useMemo(() => {
    if (points && points.length > 0) {
      const lats = points.map(pt => pt.lat).filter(l => l !== 0)
      const lons = points.map(pt => pt.lon).filter(l => l !== 0)
      if (lats.length > 10 && lons.length > 10) {
        const minLat = Math.min(...lats)
        const maxLat = Math.max(...lats)
        const minLon = Math.min(...lons)
        const maxLon = Math.max(...lons)

        const pathPoints = points
          .filter(p => p.lat !== 0 && p.lon !== 0)
          .map(p => {
            const x = 50 + ((p.lon - minLon) / (maxLon - minLon || 1)) * 300
            const y = 50 + ((maxLat - p.lat) / (maxLat - minLat || 1)) * 200
            return `${x},${y}`
          })
        return `M ${pathPoints.join(' L ')}`
      }
    }
    // Fallback path
    return `M 80 150
           C 80 80, 150 50, 200 50
           C 250 50, 320 80, 320 150
           C 320 180, 280 200, 250 200
           C 220 200, 200 220, 200 250
           C 200 280, 150 280, 120 250
           C 90 220, 80 200, 80 150`
  }, [points])

  return (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      {/* Track background */}
      <path
        d={trackPath}
        fill="none"
        stroke="#27272a"
        strokeWidth="20"
        strokeLinecap="round"
      />
      {/* Track colored */}
      <path
        d={trackPath}
        fill="none"
        stroke="#3f3f46"
        strokeWidth="16"
        strokeLinecap="round"
      />
      {/* Start/Finish */}
      <line x1="75" y1="150" x2="85" y2="150" stroke="white" strokeWidth="3" />

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
  const { session, fetchLapDetail, loading: contextLoading, error: contextError } = useTelemetryContext()
  const [scrubberPosition, setScrubberPosition] = useState(50)
  const [selectedLap, setSelectedLap] = useState<number>(1)
  const [lapDetail, setLapDetail] = useState<LapDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load lap detail when session or selected lap changes
  useEffect(() => {
    async function loadLapDetail() {
      if (!session) return

      setLoading(true)
      setError(null)

      const detail = await fetchLapDetail(session.session_id, selectedLap)
      if (detail) {
        setLapDetail(detail)
      } else {
        setError("Failed to load lap detail")
      }
      setLoading(false)
    }

    loadLapDetail()
  }, [session, selectedLap, fetchLapDetail])

  // Transform telemetry data for charts
  const telemetryData = useMemo(() => {
    if (!lapDetail || lapDetail.points.length === 0) {
      return []
    }
    return transformTelemetryData(lapDetail.points)
  }, [lapDetail])

  // Downsample data for performance (max 500 points for charts)
  const chartData = useMemo(() => {
    if (telemetryData.length <= 500) return telemetryData
    const step = Math.ceil(telemetryData.length / 500)
    return telemetryData.filter((_, i) => i % step === 0)
  }, [telemetryData])

  const currentDataIndex = Math.floor((scrubberPosition / 100) * (chartData.length - 1))
  const currentData = chartData[currentDataIndex]

  // Calculate time lost in current sector
  const timeLost = useMemo(() => {
    if (chartData.length === 0) return 0
    const sectorSize = Math.floor(chartData.length / 3)
    const sectorStart = Math.floor(currentDataIndex / sectorSize) * sectorSize
    const sectorEnd = Math.min(sectorStart + sectorSize, currentDataIndex)
    return chartData
      .slice(sectorStart, sectorEnd)
      .reduce((acc, d) => acc + d.delta, 0)
  }, [chartData, currentDataIndex])

  const maxDistance = chartData.length > 0 ? chartData[chartData.length - 1]?.distance || 0 : 0

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

  // Loading state
  if (loading || contextLoading) {
    return (
      <div className="h-full bg-[#09090b] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 mx-auto mb-4 animate-spin" />
          <p className="text-zinc-400">Loading lap telemetry...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || contextError) {
    return (
      <div className="h-full bg-[#09090b] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-400">{error || contextError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-[#09090b] p-4 flex flex-col">
      {/* Lap Selector */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-zinc-400 text-sm">Select Lap:</span>
          <Select value={selectedLap.toString()} onValueChange={(v) => setSelectedLap(parseInt(v))}>
            <SelectTrigger className="w-32 bg-zinc-900 border-zinc-800 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              {session.laps.map((lap) => (
                <SelectItem key={lap.lap_number} value={lap.lap_number.toString()}>
                  Lap {lap.lap_number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {lapDetail && (
          <span className="text-zinc-500 text-sm">
            {lapDetail.points.length.toLocaleString()} data points
          </span>
        )}
      </div>

      {/* Top Section - Telemetry Charts (60% height) */}
      <div className="h-[55%] flex flex-col gap-2 mb-4">
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
            <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="distance" hide />
              <YAxis domain={['auto', 'auto']} tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={false} width={35} />
              <Tooltip
                contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '4px' }}
                labelStyle={{ color: '#a1a1aa' }}
              />
              <Line type="monotone" dataKey="refSpeed" stroke="#22d3ee" strokeWidth={2} dot={false} name="Reference" />
              <Line type="monotone" dataKey="currentSpeed" stroke="#d946ef" strokeWidth={2} dot={false} name="Current" />
              {currentData && <ReferenceLine x={currentData.distance} stroke="white" strokeWidth={1} strokeDasharray="3 3" />}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* RPM Chart */}
        <div className="flex-1 bg-[#18181b] border border-zinc-800 rounded-lg p-3">
          <h3 className="text-zinc-400 text-xs uppercase tracking-wider mb-1">RPM</h3>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="distance" hide />
              <YAxis domain={['auto', 'auto']} tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={false} width={35} />
              <Line type="monotone" dataKey="refRPM" stroke="#22d3ee" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="currentRPM" stroke="#d946ef" strokeWidth={2} dot={false} />
              {currentData && <ReferenceLine x={currentData.distance} stroke="white" strokeWidth={1} strokeDasharray="3 3" />}
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
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="distance" hide />
              <YAxis domain={[0, 100]} tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={false} width={35} />
              <Area type="monotone" dataKey="throttle" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} strokeWidth={2} />
              <Area type="monotone" dataKey="brake" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} strokeWidth={2} />
              {currentData && <ReferenceLine x={currentData.distance} stroke="white" strokeWidth={1} strokeDasharray="3 3" />}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scrubber */}
      <div className="mb-4 bg-[#18181b] border border-zinc-800 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-zinc-400 text-xs uppercase tracking-wider">Distance Scrubber</span>
          <span className="text-white font-mono text-sm">{currentData?.distance || 0}m / {maxDistance}m</span>
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
              <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
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
                {currentData && <ReferenceLine x={currentData.distance} stroke="white" strokeWidth={1} strokeDasharray="3 3" />}
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
            <TrackMapWithCar progress={scrubberPosition / 100} points={lapDetail?.points} />
          </div>
        </div>

        {/* Live Data Panel */}
        <div className="col-span-3 bg-[#18181b] border border-zinc-800 rounded-lg p-4 flex flex-col">
          <h3 className="text-zinc-400 text-xs uppercase tracking-wider mb-3">Live Data</h3>
          <div className="space-y-4 flex-1">
            <div>
              <span className="text-zinc-500 text-xs block mb-1">Speed</span>
              <div className="flex items-baseline gap-2">
                <span className="text-fuchsia-400 font-mono text-2xl font-bold">{currentData?.currentSpeed || 0}</span>
                <span className="text-zinc-500 font-mono text-sm">km/h</span>
              </div>
            </div>
            <div>
              <span className="text-zinc-500 text-xs block mb-1">RPM</span>
              <div className="flex items-baseline gap-2">
                <span className="text-white font-mono text-2xl font-bold">{(currentData?.currentRPM || 0).toLocaleString()}</span>
              </div>
            </div>
            <div>
              <span className="text-zinc-500 text-xs block mb-1">Throttle</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-100"
                    style={{ width: `${currentData?.throttle || 0}%` }}
                  />
                </div>
                <span className="text-white font-mono text-sm w-10 text-right">{currentData?.throttle || 0}%</span>
              </div>
            </div>
            <div>
              <span className="text-zinc-500 text-xs block mb-1">Brake</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 transition-all duration-100"
                    style={{ width: `${currentData?.brake || 0}%` }}
                  />
                </div>
                <span className="text-white font-mono text-sm w-10 text-right">{currentData?.brake || 0}%</span>
              </div>
            </div>
            <div>
              <span className="text-zinc-500 text-xs block mb-1">Delta</span>
              <span className={`font-mono text-lg font-bold ${(currentData?.delta || 0) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {(currentData?.delta || 0) > 0 ? '+' : ''}{(currentData?.delta || 0).toFixed(3)}s
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
