export type ThemePreference = "light" | "dark" | "system";

export interface AppSettings {
  theme: ThemePreference;
  language: string;
  itemsPerPage: number;
  dateFormat: string;
  timeFormat: "12h" | "24h";
}


