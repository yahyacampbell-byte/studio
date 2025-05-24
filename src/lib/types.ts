
import type { COGNITIVE_GAMES, MULTIPLE_INTELLIGENCES } from './constants';

export type GameId = typeof COGNITIVE_GAMES[number]['id'];

// Define IntelligenceId as a union of string literals to avoid circular dependency
export type IntelligenceId =
  | 'Logical-Mathematical'
  | 'Visual-Spatial'
  | 'Bodily-Kinesthetic'
  | 'Linguistic-Verbal'
  | 'Musical'
  | 'Interpersonal'
  | 'Intrapersonal'
  | 'Naturalistic';

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

// Represents a single snapshot of AI analysis results
export interface AIAnalysisResults {
  intelligenceScores: IntelligenceScore[];
  multipleIntelligencesSummary: string;
  broaderCognitiveInsights?: string;
  actionableRecommendations: string;
  lastAnalyzed: string; // ISO string timestamp of when analysis was run
}
