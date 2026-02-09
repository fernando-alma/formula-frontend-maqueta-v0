"use client"

import { useState, useCallback, useRef } from "react"
import { HardDriveDownload, CircleDot, Loader2, AlertCircle, FileCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTelemetryContext } from "@/context/TelemetryContext"

interface ConfigurationViewProps {
  onInitialize: (sessionId: string) => void
}

export function ConfigurationView({ onInitialize }: ConfigurationViewProps) {
  const { uploadFile, loading, error, clearError } = useTelemetryContext()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    clearError()

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (ext === 'ibt' || ext === 'ld') {
        setSelectedFile(file)
      } else {
        alert('Please upload a .ibt or .ld file')
      }
    }
  }, [clearError])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    clearError()
    const files = e.target.files
    if (files && files.length > 0) {
      setSelectedFile(files[0])
    }
  }, [clearError])

  const handleDropZoneClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleInitialize = useCallback(async () => {
    if (!selectedFile) {
      alert('Please select a file first')
      return
    }

    const session = await uploadFile(selectedFile)
    if (session) {
      onInitialize(session.session_id)
    }
  }, [selectedFile, uploadFile, onInitialize])

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        {/* Main Card */}
        <div className="bg-[#18181b] border border-zinc-800 rounded-lg overflow-hidden">
          {/* Header */}
          <div className="border-b border-zinc-800 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-cyan-400/10 rounded flex items-center justify-center">
                  <div className="w-3 h-3 bg-cyan-400 rounded-sm" />
                </div>
                <div>
                  <h1 className="text-white font-semibold tracking-wide">
                    TELEMETRY SYSTEM
                  </h1>
                  <p className="text-zinc-500 text-sm font-mono">v2.0.4</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded border border-zinc-800">
                <CircleDot className="w-3 h-3 text-red-500" />
                <span className="text-zinc-400 text-xs font-mono uppercase tracking-wider">
                  OFFLINE
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Drop Zone */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".ibt,.ld"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div
              onClick={handleDropZoneClick}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer group ${
                isDragOver
                  ? 'border-cyan-400 bg-cyan-400/10'
                  : selectedFile
                  ? 'border-green-500/50 bg-green-500/5'
                  : 'border-zinc-700 hover:border-cyan-400/50 hover:bg-cyan-400/5'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-12 h-12 text-cyan-400 mx-auto mb-4 animate-spin" />
                  <p className="text-cyan-400 font-mono text-sm mb-2">
                    PROCESSING FILE...
                  </p>
                  <p className="text-zinc-600 text-xs">
                    Parsing telemetry data
                  </p>
                </>
              ) : selectedFile ? (
                <>
                  <FileCheck className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-green-400 font-mono text-sm mb-2">
                    {selectedFile.name}
                  </p>
                  <p className="text-zinc-600 text-xs">
                    Click to change file or drop a new one
                  </p>
                </>
              ) : (
                <>
                  <HardDriveDownload className="w-12 h-12 text-zinc-600 mx-auto mb-4 group-hover:text-cyan-400 transition-colors" />
                  <p className="text-zinc-400 font-mono text-sm mb-2">
                    DROP .IBT OR .LD FILES HERE
                  </p>
                  <p className="text-zinc-600 text-xs">
                    Supported formats: .ibt (iRacing), .ld (MoTeC)
                  </p>
                </>
              )}
            </div>

            {/* Circuit Selector */}
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">
                Select Track Geometry
              </Label>
              <Select defaultValue="galvez">
                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="galvez">
                    Autódromo Oscar y Juan Gálvez - N°8
                  </SelectItem>
                  <SelectItem value="termas">
                    Autódromo Termas de Río Hondo
                  </SelectItem>
                  <SelectItem value="alta-gracia">
                    Autódromo Oscar Cabalén - Alta Gracia
                  </SelectItem>
                  <SelectItem value="rafaela">
                    Autódromo de Rafaela
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Session Metadata */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs uppercase tracking-wider">
                  Driver Name
                </Label>
                <Input
                  placeholder="Enter name"
                  defaultValue="Lautaro"
                  className="bg-zinc-900 border-zinc-800 text-white h-10 font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs uppercase tracking-wider">
                  Team
                </Label>
                <Input
                  placeholder="Team name"
                  defaultValue="Navix Racing"
                  className="bg-zinc-900 border-zinc-800 text-white h-10 font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs uppercase tracking-wider">
                  Track Condition
                </Label>
                <Select defaultValue="dry">
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="dry">Dry</SelectItem>
                    <SelectItem value="wet">Wet</SelectItem>
                    <SelectItem value="damp">Damp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Button */}
            <Button
              onClick={handleInitialize}
              disabled={loading || !selectedFile}
              className="w-full h-14 bg-cyan-400 hover:bg-cyan-500 text-zinc-950 font-semibold text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </span>
              ) : (
                'Initialize Session Analysis'
              )}
            </Button>
          </div>

          {/* Footer */}
          <div className="border-t border-zinc-800 px-6 py-3 flex items-center justify-between text-xs text-zinc-600">
            <span className="font-mono">SYS.MEM: 2.4GB FREE</span>
            <span className="font-mono">GPU: READY</span>
            <span className="font-mono">TEMP: 42°C</span>
          </div>
        </div>
      </div>
    </div>
  )
}
