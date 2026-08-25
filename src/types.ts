export type AppVersion = 'cn' | 'overseas';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  count?: number;
}

export interface WebApp {
  id: string;
  name: string;
  domain: string;
  url: string;
  description: string;
  categoryId: string;
  brandColor: string;
  logoUrl?: string | null;
  tags: string[];
}

export interface SafetyCheckResult {
  isSafe: boolean;
  score: number;
  warnings: string[];
  suggestions: string[];
}
