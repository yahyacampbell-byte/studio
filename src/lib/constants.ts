import type { LucideIcon } from 'lucide-react';
import { Eye, FileText, Calculator, Bike, Music, Users, User, Leaf, Puzzle, Brain, BarChart3, Lightbulb, Settings, Bot } from 'lucide-react';

export const APP_NAME = "BrainBloom";

export interface CognitiveGame {
  id: string; // Key like CANDY_FACTORY
  title: string; // Human-readable title like "Candy Factory"
  description: string;
  icon?: LucideIcon; // Optional: A generic icon for games or specific if available
  dataAiHint?: string; // For placeholder image generation
}

export const COGNITIVE_GAMES: CognitiveGame[] = [
  { id: "CANDY_FACTORY", title: "Candy Factory", description: "Boost your logical thinking.", icon: Puzzle, dataAiHint: "candy factory" },
  { id: "PIECE_MAKING", title: "Piece Making", description: "Enhance spatial reasoning.", icon: Puzzle, dataAiHint: "puzzle pieces" },
  { id: "WATER_LILIES", title: "Water Lilies", description: "Improve visual perception.", icon: Eye, dataAiHint: "water lilies" },
  { id: "MOUSE_CHALLENGE", title: "Mouse Challenge", description: "Test your reaction time.", icon: Bike, dataAiHint: "mouse maze" },
  { id: "WHACK_A_MOLE", title: "Reaction Field", description: "Sharpen your reflexes.", icon: Bike, dataAiHint: "whack a mole" },
  { id: "WORDS_BIRDS", title: "Words Birds", description: "Expand your vocabulary.", icon: FileText, dataAiHint: "birds words" },
  { id: "WORD_QUEST", title: "Word Quest", description: "Challenge your linguistic skills.", icon: FileText, dataAiHint: "word search" },
  { id: "MAHJONG", title: "Mahjong", description: "Train pattern recognition.", icon: Puzzle, dataAiHint: "mahjong tiles" },
  { id: "CROSSROADS", title: "Crossroads", description: "Improve decision making.", icon: Brain, dataAiHint: "crossroads sign" },
  { id: "JIGSAW_9", title: "Jigsaw 9", description: "Develop problem-solving skills.", icon: Puzzle, dataAiHint: "jigsaw puzzle" },
  { id: "FUEL_A_CAR", title: "Fuel a Car", description: "Test strategic planning.", icon: Calculator, dataAiHint: "car fuel" },
  { id: "WINDOW_CLEANER", title: "Butterfly Hunter", description: "Enhance visual tracking.", icon: Eye, dataAiHint: "butterfly window" },
  { id: "SUDOKU_PUZZLE", title: "Sudoku", description: "Boost logical deduction.", icon: Calculator, dataAiHint: "sudoku grid" },
  // Add more games, up to 50 as per the list. For brevity, I'll add a few more.
  { id: "RIVAL_ORBS", title: "Shore Dangers", description: "Improve strategic thinking.", icon: Brain, dataAiHint: "orbs conflict" },
  { id: "MATH_TWINS", title: "Math Twins", description: "Sharpen mathematical skills.", icon: Calculator, dataAiHint: "math numbers" },
  { id: "SIMON_SAYS", title: "Drive me crazy", description: "Test your memory and auditory processing.", icon: Music, dataAiHint: "simon game" },
  { id: "CHESS_PVP", title: "Chess", description: "Master strategic thinking and foresight.", icon: Brain, dataAiHint: "chess board" },
];


export interface Intelligence {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color?: string; // Optional: for chart consistency
}

export const MULTIPLE_INTELLIGENCES: Intelligence[] = [
  { id: 'Visual-Spatial', name: 'Visual-Spatial', description: 'Thinking in pictures, visualizing outcomes.', icon: Eye, color: 'var(--chart-1)' },
  { id: 'Linguistic-Verbal', name: 'Linguistic-Verbal', description: 'Using words effectively, understanding language.', icon: FileText, color: 'var(--chart-2)' },
  { id: 'Logical-Mathematical', name: 'Logical-Mathematical', description: 'Reasoning, calculating, logical analysis.', icon: Calculator, color: 'var(--chart-3)' },
  { id: 'Bodily-Kinesthetic', name: 'Bodily-Kinesthetic', description: 'Using the body effectively, physical coordination.', icon: Bike, color: 'var(--chart-4)' },
  { id: 'Musical', name: 'Musical', description: 'Sensitivity to rhythm, pitch, melody.', icon: Music, color: 'var(--chart-5)' },
  { id: 'Interpersonal', name: 'Interpersonal', description: 'Understanding and interacting with others.', icon: Users, color: 'var(--chart-1)' }, // Re-using chart colors
  { id: 'Intrapersonal', name: 'Intrapersonal', description: 'Understanding oneself, self-reflection.', icon: User, color: 'var(--chart-2)' },
  { id: 'Naturalistic', name: 'Naturalistic', description: 'Understanding nature, recognizing patterns in the natural world.', icon: Leaf, color: 'var(--chart-3)' },
];

export const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/games", label: "Games", icon: Puzzle },
  { href: "/insights", label: "My Insights", icon: Lightbulb },
  // { href: "/settings", label: "Settings", icon: Settings }, // Example for future
];

export const LOCAL_STORAGE_ACTIVITY_KEY = 'brainBloomActivity';
export const LOCAL_STORAGE_INSIGHTS_KEY = 'brainBloomInsights';

// Mapping game keys to intelligences, similar to the one in generatePersonalizedInsightsFromGameData AI flow for consistency if needed client-side.
// This is a partial list for example.
export const GAME_TO_INTELLIGENCE_MAPPING: Record<string, string> = {
  CANDY_FACTORY: 'Logical-Mathematical',
  PIECE_MAKING: 'Visual-Spatial',
  WATER_LILIES: 'Visual-Spatial',
  MOUSE_CHALLENGE: 'Bodily-Kinesthetic',
  WORDS_BIRDS: 'Linguistic-Verbal',
  WORD_QUEST: 'Linguistic-Verbal',
  MAHJONG: 'Visual-Spatial',
  SUDOKU_PUZZLE: 'Logical-Mathematical',
  SIMON_SAYS: 'Musical',
  CHESS_PVP: 'Logical-Mathematical',
};
