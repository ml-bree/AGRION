// Shared contract between the backend AI "blocks" and the React components
// that render them. Each block the backend streams has a `type` discriminator
// that maps 1:1 to a component in this folder.

export interface WeatherBlock {
  type: "weather";
  location: string;
  forecast: string;
  tempC: number;
  rainChance: number; // 0-100
}

export interface FinancialYieldPoint {
  label: string; // e.g. a month or season
  yield: number; // kg or tonnes
  revenue: number; // local currency
}

export interface FinancialYieldBlock {
  type: "financial_yield";
  crop: string;
  points: FinancialYieldPoint[];
}

export interface ActionAlertBlock {
  type: "action_alert";
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
}

export type GenUIBlock = WeatherBlock | FinancialYieldBlock | ActionAlertBlock;
