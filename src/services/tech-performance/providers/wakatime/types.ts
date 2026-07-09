export interface WakaTimeNamedTotal {
  name: string;
  total_seconds: number;
  percent: number;
}

export interface WakaTimeSummaryDay {
  grand_total: { total_seconds: number };
  range: { date: string };
  languages: WakaTimeNamedTotal[];
}

export interface WakaTimeSummariesResponse {
  data: WakaTimeSummaryDay[];
}

export interface WakaTimeStatsResponse {
  data: {
    total_seconds: number;
    daily_average: number;
    best_day?: { date: string; total_seconds: number };
    languages: WakaTimeNamedTotal[];
    editors: WakaTimeNamedTotal[];
    projects: WakaTimeNamedTotal[];
    categories: WakaTimeNamedTotal[];
  };
}

export interface WakaTimeAllTimeResponse {
  data: { total_seconds: number; text: string };
}
