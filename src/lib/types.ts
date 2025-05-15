import type { COGNITIVE_GAMES, MULTIPLE_INTELLIGENCES } from './constants';

export type GameId = typeof COGNITIVE_GAMES[number]['id'];
export type IntelligenceId = typeof MULTIPLE_INTELLIGENCES[number]['id'];

export interface GameActivity {
  id: string; // Unique ID for this activity entry
  gameId: GameId; // e.g., CANDY_FACTORY
  gameTitle: string; // e.g., Candy Factory
  score: number;
  activityDuration: number; // in seconds
  timestamp: string; // ISO string
}

export interface IntelligenceScore {
  intelligence: IntelligenceId;
  score: number; // 0-100
  reasoning?: string;
}

export interface AIAnalysisResults {
  intelligenceScores: IntelligenceScore[];
  personalizedInsights?: string;
  recommendations?: string;
  lastAnalyzed?: string; // ISO string timestamp of when analysis was run
}
