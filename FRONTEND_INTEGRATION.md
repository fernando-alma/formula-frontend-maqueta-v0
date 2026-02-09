# Integración Frontend con la API de Telemetría

## Base URL

```
http://localhost:8000/api/v1/telemetry
```

> En desarrollo, el backend corre en el puerto 8000 con CORS habilitado para `localhost:3000` y `localhost:5173`.

---

## Endpoints disponibles

### 1. Subir archivo de telemetría

```
POST /upload
Content-Type: multipart/form-data
```

**Request:** enviar el archivo `.ibt` o `.ld` como campo `file`.

```typescript
const formData = new FormData();
formData.append("file", selectedFile);

const response = await fetch("http://localhost:8000/api/v1/telemetry/upload", {
  method: "POST",
  body: formData,
});

const session = await response.json();
// session.session_id -> guardar para consultas posteriores
```

**Response (200):**

```json
{
  "session_id": "a1b2c3d4e5f6",
  "driver": "John Doe",
  "vehicle": "Formula 3",
  "track": "Monza",
  "date": "2024-06-15",
  "duration_seconds": 1823.5,
  "lap_count": 12,
  "sample_rate_hz": 60,
  "laps": [
    {
      "lap_number": 1,
      "lap_time": 92.3412,
      "max_speed": 287.5,
      "avg_rpm": 8542.31,
      "distance": 5793.21,
      "fuel_used": 1.823,
      "fuel_use_per_hour_avg": 72.15
    }
  ]
}
```

**Errores:**
- `400` — Extensión no soportada o archivo inválido
- `500` — Error interno al parsear

---

### 2. Obtener sesión con resúmenes de vuelta

```
GET /sessions/{session_id}/laps
```

```typescript
const response = await fetch(
  `http://localhost:8000/api/v1/telemetry/sessions/${sessionId}/laps`
);
const session = await response.json();
```

**Response:** mismo formato que el upload (ver arriba).

**Errores:**
- `404` — Sesión no encontrada

---

### 3. Obtener detalle punto a punto de una vuelta

```
GET /sessions/{session_id}/laps/{lap_number}/details
```

```typescript
const response = await fetch(
  `http://localhost:8000/api/v1/telemetry/sessions/${sessionId}/laps/${lapNumber}/details`
);
const lapDetail = await response.json();
```

**Response (200):**

```json
{
  "lap_number": 1,
  "lap_time": 92.3412,
  "points": [
    {
      "time": 0.0,
      "speed": 45.2,
      "rpm": 6500.0,
      "throttle": 0.85,
      "brake": 0.0,
      "lat": -34.6037,
      "lon": -58.3816,
      "lap_dist": 0.0,
      "lap_dist_pct": 0.0
    }
  ]
}
```

> `points` puede contener miles de elementos (uno por cada muestra a la frecuencia base, típicamente 60 Hz).

**Errores:**
- `400` — `lap_number` menor a 1
- `404` — Sesión o vuelta no encontrada

---

## Flujo típico en el frontend

```
┌─────────────┐     POST /upload      ┌─────────────┐
│  Seleccionar │ ──────────────────▶  │   Backend    │
│  archivo .ibt│                      │  parsea y    │
│              │ ◀────────────────── │  guarda en BD│
└─────────────┘   SessionResponse     └─────────────┘
       │
       │ guardar session_id
       ▼
┌─────────────┐  GET /sessions/{id}/laps
│  Vista de    │ ──────────────────▶  Lee de BD
│  resumen     │ ◀──────────────────  laps[]
└─────────────┘
       │
       │ usuario elige vuelta N
       ▼
┌─────────────┐  GET /sessions/{id}/laps/{N}/details
│  Gráficos    │ ──────────────────▶  Lee de BD
│  telemetría  │ ◀──────────────────  points[]
└─────────────┘
```

---

## Ejemplo: hook con React + fetch

```typescript
import { useState } from "react";

const API_BASE = "http://localhost:8000/api/v1/telemetry";

interface LapSummary {
  lap_number: number;
  lap_time: number;
  max_speed: number;
  avg_rpm: number;
  distance: number;
  fuel_used: number;
  fuel_use_per_hour_avg: number;
}

interface Session {
  session_id: string;
  driver: string;
  vehicle: string;
  track: string;
  date: string;
  duration_seconds: number;
  lap_count: number;
  sample_rate_hz: number;
  laps: LapSummary[];
}

interface TelemetryPoint {
  time: number;
  speed: number;
  rpm: number;
  throttle: number;
  brake: number;
  lat: number;
  lon: number;
  lap_dist: number;
  lap_dist_pct: number;
}

interface LapDetail {
  lap_number: number;
  lap_time: number;
  points: TelemetryPoint[];
}

export function useTelemetry() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadFile(file: File): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.detail || "Upload failed");
      }
      setSession(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSession(sessionId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/laps`);
    if (!res.ok) throw new Error("Session not found");
    setSession(await res.json());
  }

  async function fetchLapDetail(
    sessionId: string,
    lapNumber: number
  ): Promise<LapDetail> {
    const res = await fetch(
      `${API_BASE}/sessions/${sessionId}/laps/${lapNumber}/details`
    );
    if (!res.ok) throw new Error("Lap not found");
    return res.json();
  }

  return { session, loading, error, uploadFile, fetchSession, fetchLapDetail };
}
```

---

## Campos útiles para visualización

| Campo | Uso sugerido |
|-------|-------------|
| `speed` vs `lap_dist_pct` | Gráfico de velocidad por posición en pista |
| `throttle` + `brake` vs `time` | Trazas de pedales |
| `rpm` vs `time` | Gráfico de revoluciones |
| `lat` + `lon` | Mapa del circuito / trazada |
| `lap_time` por vuelta | Tabla comparativa / gráfico de barras |
| `max_speed` por vuelta | Comparación de rendimiento |
| `fuel_used` por vuelta | Estrategia de combustible |

---

## Notas

- Los datos persisten en SQLite: si el backend se reinicia, las sesiones siguen disponibles.
- `session_id` es un string de 12 caracteres hexadecimales.
- El endpoint `/health` (`GET http://localhost:8000/health`) se puede usar para verificar que el backend está corriendo.
- Documentación interactiva (Swagger UI) disponible en `http://localhost:8000/docs`.
