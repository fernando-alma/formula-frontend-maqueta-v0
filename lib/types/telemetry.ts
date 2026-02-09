// Tipos para la API de telemetría

export interface LapSummary {
  lap_number: number;
  lap_time: number;
  max_speed: number;
  avg_rpm: number;
  distance: number;
  fuel_used: number;
  fuel_use_per_hour_avg: number;
}

export interface Session {
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

export interface TelemetryPoint {
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

export interface LapDetail {
  lap_number: number;
  lap_time: number;
  points: TelemetryPoint[];
}
