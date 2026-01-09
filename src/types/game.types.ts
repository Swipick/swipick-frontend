/**
 * Game & Fixtures Types
 */

export type PredictionChoice = '1' | 'X' | '2' | 'SKIP';

export interface Team {
  id: number;
  name: string;
  logo: string | null;
  position?: number; // Standings position
  winRate?: number; // Win rate percentage
  last5?: string[]; // Last 5 results - 2-char format: position+outcome (e.g., "1W"=home win, "2D"=away draw, "1L"=home loss)
  form?: string; // Form indicator
}

export interface Fixture {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  kickoffTime: string; // ISO date string
  stadium?: string | null;
  venue?: string; // City name
  week: number;
  league?: string;
  season?: string;
}

export interface FormEntry {
  fixtureId: string;
  code: string; // "1" (home won), "2" (away won), or "X" (draw)
  predicted: string | null;
  correct: boolean | null;
  wasHome: boolean; // Was this team playing home in this match
}

export interface MatchCard {
  fixtureId: string;  // UUID string from backend
  week: number;
  kickoff: {
    iso: string;
    display: string;
  };
  stadium: string;
  home: {
    name: string;
    logo: string | null;
    winRateHome: number;
    last5: string[]; // Legacy: ["1", "X", "2"] - just result codes
    standingsPosition: number;
    form: FormEntry[]; // New: includes wasHome + code for proper display
  };
  away: {
    name: string;
    logo: string | null;
    winRateAway: number;
    last5: string[]; // Legacy: ["1", "X", "2"] - just result codes
    standingsPosition: number;
    form: FormEntry[]; // New: includes wasHome + code for proper display
  };
}

export interface FixtureWithResult {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string; // ISO date
  stadium: string;
  week: number;
  result: '1' | 'X' | '2' | null;
  home_score: number | null;
  away_score: number | null;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';
  external_api_id: string;
  home_team_id: string | null;
  away_team_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Prediction {
  id?: string;
  userId: string;
  fixtureId: string;  // UUID string
  choice: PredictionChoice;
  week: number;
  mode: 'live' | 'test';
  createdAt?: string;
}

export interface GameState {
  currentWeek: number;
  mode: 'live' | 'test';
  fixtures: MatchCard[];
  predictions: Map<string, PredictionChoice>; // fixtureId (UUID string) -> choice
  skippedFixtures: string[]; // fixtureIds (UUID strings)
  currentIndex: number;
  loading: boolean;
  error: string | null;
  isComplete: boolean;
  showSummary: boolean;
}

export interface WeeklyStats {
  week: number;
  totalPredictions: number;
  correctPredictions: number;
  successRate: number;
  predictions: Prediction[];
}

// API Response types
export interface FixturesResponse {
  fixtures: MatchCard[];
  week: number;
  total: number;
}

export interface PredictionResponse {
  success: boolean;
  prediction: Prediction;
}

export interface CreatePredictionDto {
  userId: string;
  fixtureId: string;  // UUID string
  choice: '1' | 'X' | '2';  // Backend doesn't accept 'SKIP'
  week: number;
  mode: 'live' | 'test';
}
