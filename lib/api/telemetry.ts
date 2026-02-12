import type { Session, LapDetail } from "@/lib/types/telemetry";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:8000/api/v1/telemetry";

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

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail: string | undefined;
    try {
      const body = await response.json();
      detail = body.detail;
    } catch {
      // ignore parse errors
    }
    throw new ApiError(
      detail || `Request failed with status ${response.status}`,
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
