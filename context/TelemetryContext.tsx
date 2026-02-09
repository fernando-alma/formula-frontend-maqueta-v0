"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useTelemetry } from "@/hooks/use-telemetry";
import type { Session, LapDetail } from "@/lib/types/telemetry";

interface TelemetryContextValue {
  session: Session | null;
  loading: boolean;
  error: string | null;
  uploadFile: (file: File) => Promise<Session | null>;
  fetchSession: (sessionId: string) => Promise<Session | null>;
  fetchLapDetail: (sessionId: string, lapNumber: number) => Promise<LapDetail | null>;
  clearError: () => void;
  clearSession: () => void;
}

const TelemetryContext = createContext<TelemetryContextValue | null>(null);

interface TelemetryProviderProps {
  children: ReactNode;
}

export function TelemetryProvider({ children }: TelemetryProviderProps) {
  const telemetry = useTelemetry();

  return (
    <TelemetryContext.Provider value={telemetry}>
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetryContext(): TelemetryContextValue {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error("useTelemetryContext must be used within a TelemetryProvider");
  }
  return context;
}
