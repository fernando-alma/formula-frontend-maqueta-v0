import { useState, useCallback } from "react";
import type { Session, LapDetail, SessionListItem } from "@/lib/types/telemetry";
import * as api from "@/lib/api/telemetry";

export function useTelemetry() {
  const [session, setSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File): Promise<Session | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.uploadFileViaStorage(file);
      setSession(result);
      return result;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Upload failed";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSession = useCallback(async (sessionId: string): Promise<Session | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.fetchSession(sessionId);
      setSession(result);
      return result;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to fetch session";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLapDetail = useCallback(async (
    sessionId: string,
    lapNumber: number
  ): Promise<LapDetail | null> => {
    setLoading(true);
    setError(null);
    try {
      return await api.fetchLapDetail(sessionId, lapNumber);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to fetch lap detail";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearSession = useCallback(() => {
    setSession(null);
  }, []);

  const loadSessions = useCallback(async () => {
    try {
      const result = await api.fetchSessions();
      setSessions(result);
    } catch (e) {
      console.error("Failed to load sessions:", e);
    }
  }, []);

  return {
    session,
    sessions,
    loading,
    error,
    uploadFile,
    fetchSession,
    fetchLapDetail,
    clearError,
    clearSession,
    loadSessions,
  };
}
