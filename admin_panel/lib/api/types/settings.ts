export interface ConsoleSettingsConfig {
  telemetryIntervalSec: number;
  flightSafeAutoEngage: boolean;
  lowBatteryThresholdPct: number;
  criticalTamperAlerts: boolean;
  maintenanceMode: boolean;
  demoResetAllowed: boolean;
  apiRateLimitRpm: number;
  theme: "system" | "light" | "dark";
  allowedGeofences: string[];
}

export interface DemoResetOptions {
  preserveRegisteredSerials?: boolean;
  resetAuditLogs?: boolean;
}
