// lib/api/telemetry.ts
import type { Session, LapDetail, SessionListItem } from "@/lib/types/telemetry";
import { supabase } from "@/lib/supabase";

/**
 * CONFIGURACIÓN DE URLS
 * Usamos NEXT_PUBLIC_ para que la variable sea accesible desde el navegador.
 * Limpiamos la URL para evitar errores de doble barra (//) o rutas mal formadas.
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";
const API_BASE = `${BASE_URL}/api/v1/telemetry`;

// Logs de auditoría en desarrollo para verificar qué está leyendo Vercel
if (process.env.NODE_ENV !== 'production') {
  console.log("DEBUG: Base URL configurada ->", BASE_URL);
  console.log("DEBUG: Endpoint de Telemetría ->", API_BASE);
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public detail?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * MANEJO DE RESPUESTAS UNIVERSAL
 * Procesa errores 4xx y 5xx, extrayendo el detalle del backend de FastAPI si existe.
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail: string | undefined;
    try {
      const body = await response.json();
      detail = body.detail; // FastAPI suele enviar el error en el campo 'detail'
    } catch {
      // Si no es un JSON válido, manejamos el error genérico
    }

    // El error 413 (Payload Too Large) usualmente viene del Proxy (Vercel), no del Back.
    if (response.status === 413) {
      throw new ApiError("El archivo es demasiado grande para el servidor (Límite 4.5MB).", 413);
    }

    throw new ApiError(
      detail || `Error de servidor: ${response.status}`,
      response.status,
      detail
    );
  }
  return response.json();
}


export async function uploadFile(file: File): Promise<Session> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });

  return handleResponse<Session>(response);
}


export async function fetchSession(sessionId: string): Promise<Session> {
  const response = await fetch(`${API_BASE}/sessions/${sessionId}/laps`);
  return handleResponse<Session>(response);
}


export async function fetchLapDetail(
  sessionId: string,
  lapNumber: number
): Promise<LapDetail> {
  const response = await fetch(
    `${API_BASE}/sessions/${sessionId}/laps/${lapNumber}/details`
  );
  return handleResponse<LapDetail>(response);
}


export async function uploadFileViaStorage(file: File): Promise<Session> {
  const uniqueName = `${Date.now()}_${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("telemetry-bucket")
    .upload(uniqueName, file);

  if (uploadError) {
    throw new Error(`Error uploading to storage: ${uploadError.message}`);
  }

  const response = await fetch(`${API_BASE}/process-from-storage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      file_path: uniqueName,
      file_name: file.name,
    }),
  });

  return handleResponse<Session>(response);
}


export async function fetchSessions(): Promise<SessionListItem[]> {
  const response = await fetch(`${API_BASE}/sessions`);
  const data = await handleResponse<{ sessions: SessionListItem[] }>(response);
  return data.sessions;
}