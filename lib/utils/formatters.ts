// Formatear tiempo de vuelta (segundos → M:SS.mmm)
export function formatLapTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const secsFormatted = secs.toFixed(3).padStart(6, "0");
  return `${mins}:${secsFormatted}`;
}

// Formatear duración en segundos a formato legible
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${mins}m ${secs}s`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

// Formatear distancia en metros a km
export function formatDistance(meters: number): string {
  const km = meters / 1000;
  return `${km.toFixed(1)} km`;
}

// Formatear velocidad
export function formatSpeed(speed: number): string {
  return `${Math.round(speed)}`;
}

// Formatear RPM
export function formatRPM(rpm: number): string {
  return rpm.toLocaleString();
}
