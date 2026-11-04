// Mirrors supabase/migrations. See schema.md for the plain-English version.

export const CREATIVE_TYPES = [
  "UGC with Avatar",
  "UGC w/o Avatar",
  "CGI",
  "Product Only",
  "Animation",
  "Branding",
] as const;
export const TREND_STATUSES = ["Rising", "Peak", "Steady", "Fading"] as const;
export const REGIONS = ["NA", "APAC", "LATAM", "EUI", "METAP", "Global"] as const;
export const PLATFORMS = ["TikTok", "Instagram", "Xiaohongshu", "YouTube", "Other"] as const;

export type CreativeType = (typeof CREATIVE_TYPES)[number];
export type TrendStatus = (typeof TREND_STATUSES)[number];
export type Region = (typeof REGIONS)[number];
export type Platform = (typeof PLATFORMS)[number];

export type Vertical = { id: number; name: string };

export type Example = {
  id: number;
  format_id: number;
  platform: Platform | null;
  url: string;
  views: number | null;
  posted_on: string | null;
};

export type Format = {
  id: number;
  user_id: string;
  name: string;
  creative_type: CreativeType | null;
  trend_status: TrendStatus | null;
  region: Region | null;
  heat: number | null;
  ai_replicable: number | null;
  ad_value: number | null;
  new_in_7_days: number | null;
  score: number | null;
  mechanic: string | null;
  hook: string | null;
  why_works: string | null;
  brand_usage: string | null;
  prompt: string | null;
  swaps: string | null;
  first_seen: string | null;
  created_at: string;
};
