"use client"

import { useState } from "react"
import { Settings, LayoutDashboard, Activity, Menu } from "lucide-react"
import { ConfigurationView } from "@/components/telemetry/configuration-view"
import { SessionDashboard } from "@/components/telemetry/session-dashboard"
import { DeepEngineeringView } from "@/components/telemetry/deep-engineering-view"
import { TelemetryProvider } from "@/context/TelemetryContext"

type View = "config" | "dashboard" | "engineering"

function TelemetryApp() {
  const [currentView, setCurrentView] = useState<View>("config")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)

  const handleInitialize = (newSessionId: string) => {
    setSessionId(newSessionId)
    setCurrentView("dashboard")
  }

  const handleGoToConfig = () => {
    setCurrentView("config")
  }

  // If we're on config view, show it full screen without sidebar
  if (currentView === "config") {
    return <ConfigurationView onInitialize={handleInitialize} />
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-56" : "w-16"
        } bg-[#18181b] border-r border-zinc-800 flex flex-col transition-all duration-300`}
      >
        {/* Logo */}
        <div className="h-14 border-b border-zinc-800 flex items-center px-4 gap-3">
          <div className="w-8 h-8 bg-cyan-400/10 rounded flex items-center justify-center flex-shrink-0">
            <div className="w-3 h-3 bg-cyan-400 rounded-sm" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <h1 className="text-white font-semibold text-sm truncate">FORMULA</h1>
              <p className="text-zinc-500 text-xs font-mono">v2.0</p>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-3 space-y-1">
          <button
            onClick={handleGoToConfig}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              currentView === "config"
                ? "bg-cyan-400/10 text-cyan-400"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Configuration</span>}
          </button>
          <button
            onClick={() => setCurrentView("dashboard")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              currentView === "dashboard"
                ? "bg-cyan-400/10 text-cyan-400"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Session Dashboard</span>}
          </button>
          <button
            onClick={() => setCurrentView("engineering")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              currentView === "engineering"
                ? "bg-cyan-400/10 text-cyan-400"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <Activity className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Deep Engineering</span>}
          </button>
        </nav>

        {/* Session Info */}
        {sessionId && sidebarOpen && (
          <div className="px-3 py-2 border-t border-zinc-800">
            <p className="text-zinc-500 text-xs uppercase mb-1">Session</p>
            <p className="text-zinc-400 text-xs font-mono truncate">{sessionId}</p>
          </div>
        )}

        {/* Toggle */}
        <div className="p-3 border-t border-zinc-800">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {currentView === "dashboard" && <SessionDashboard />}
        {currentView === "engineering" && <DeepEngineeringView />}
      </main>
    </div>
  )
}

export default function Page() {
  return (
    <TelemetryProvider>
      <TelemetryApp />
    </TelemetryProvider>
  )
}
