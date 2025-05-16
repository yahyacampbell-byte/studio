
import type { LucideIcon } from 'lucide-react';
import { Eye, FileText, Calculator, Bike, Music, Users, User, Leaf, Puzzle, Brain, BarChart3, Lightbulb, Settings, Bot, Gamepad2, CheckCircle2 } from 'lucide-react';

export const APP_NAME = "Xillo TruePotential";
export const PROFILING_GAMES_COUNT = 8;

export interface CognitiveGame {
  id: string; // Key like CANDY_FACTORY
  title: string; // Human-readable title like "Candy Factory"
  description: string;
  icon?: LucideIcon;
  dataAiHint?: string;
}

// Curated list of 12 games for profiling and enhancement
export const COGNITIVE_GAMES: CognitiveGame[] = [
  // --- Profiling Games (8) ---
  { 
    id: "MELODY_MAYHEM", 
    title: "Melody Mayhem", 
    description: "Test your auditory processing and rhythm.", 
    icon: Music, 
    dataAiHint: "musical notes rhythm" 
  },
  { 
    id: "CHESS_PVP", 
    title: "Chess PvP", 
    description: "Master strategy and social prediction.", 
    icon: Users, 
    dataAiHint: "chess board people" 
  },
  { 
    id: "SOLITAIRE", 
    title: "Solitaire", 
    description: "Cultivate patience and self-reflection.", 
    icon: User, 
    dataAiHint: "solitaire cards" 
  },
  { 
    id: "ANT_ESCAPE", 
    title: "Ant Escape", 
    description: "Sharpen environmental reasoning and planning.", 
    icon: Leaf, 
    dataAiHint: "ant maze nature" 
  },
  { 
    id: "MATH_MADNESS", 
    title: "Math Madness", 
    description: "Boost numerical speed and accuracy.", 
    icon: Calculator, 
    dataAiHint: "math equations" 
  },
  { 
    id: "JIGSAW_9", 
    title: "Jigsaw 9", 
    description: "Develop visual assembly and mental rotation.", 
    icon: Puzzle, 
    dataAiHint: "jigsaw puzzle" 
  },
  { 
    id: "WHACK_A_MOLE", 
    title: "Reaction Field", 
    description: "Improve reflexes and hand-eye coordination.", 
    icon: Bike, 
    dataAiHint: "whack a mole" 
  },
  { 
    id: "WORDS_BIRDS", 
    title: "Words Birds", 
    description: "Expand vocabulary and word recognition.", 
    icon: FileText, 
    dataAiHint: "birds words" 
  },
  // --- Enhancement Games (4) ---
  { 
    id: "SUDOKU_PUZZLE", 
    title: "Sudoku", 
    description: "Enhance math and pattern recognition skills.", 
    icon: Calculator, 
    dataAiHint: "sudoku grid" 
  },
  { 
    id: "BREAKOUT", 
    title: "Gem Breaker", 
    description: "Improve hand-eye coordination and visual tracking.", 
    icon: Gamepad2, 
    dataAiHint: "gem breakout game" 
  },
  { 
    id: "FUEL_A_CAR", 
    title: "Fuel a Car", 
    description: "Test problem-solving and reaction speed.", 
    icon: Brain, 
    dataAiHint: "car fuel logic" 
  },
  { 
    id: "WORD_QUEST", 
    title: "Word Quest", 
    description: "Challenge vocabulary and reasoning.", 
    icon: FileText, 
    dataAiHint: "word search" 
  },
];


export interface Intelligence {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color?: string;
}

export const MULTIPLE_INTELLIGENCES: Intelligence[] = [
  { id: 'Visual-Spatial', name: 'Visual-Spatial', description: 'Thinking in pictures, visualizing outcomes.', icon: Eye, color: 'var(--chart-1)' },
  { id: 'Linguistic-Verbal', name: 'Linguistic-Verbal', description: 'Using words effectively, understanding language.', icon: FileText, color: 'var(--chart-2)' },
  { id: 'Logical-Mathematical', name: 'Logical-Mathematical', description: 'Reasoning, calculating, logical analysis.', icon: Calculator, color: 'var(--chart-3)' },
  { id: 'Bodily-Kinesthetic', name: 'Bodily-Kinesthetic', description: 'Using the body effectively, physical coordination.', icon: Bike, color: 'var(--chart-4)' },
  { id: 'Musical', name: 'Musical', description: 'Sensitivity to rhythm, pitch, melody.', icon: Music, color: 'var(--chart-5)' },
  { id: 'Interpersonal', name: 'Interpersonal', description: 'Understanding and interacting with others.', icon: Users, color: 'var(--chart-1)' },
  { id: 'Intrapersonal', name: 'Intrapersonal', description: 'Understanding oneself, self-reflection.', icon: User, color: 'var(--chart-2)' },
  { id: 'Naturalistic', name: 'Naturalistic', description: 'Understanding nature, recognizing patterns in the natural world.', icon: Leaf, color: 'var(--chart-3)' },
];

export const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/games", label: "Games", icon: Puzzle },
  { href: "/insights", label: "My Insights", icon: Lightbulb },
  // { href: "/settings", label: "Settings", icon: Settings }, // Example for future
];

export const LOCAL_STORAGE_ACTIVITY_KEY = 'xilloTruePotentialActivity';
export const LOCAL_STORAGE_INSIGHTS_KEY = 'xilloTruePotentialInsights';
export const LOCAL_STORAGE_AUTH_KEY = 'xilloTruePotentialAuth';


export const GAME_TO_INTELLIGENCE_MAPPING: Record<string, string> = {
  // Profiling Games
  MELODY_MAYHEM: 'Musical',
  CHESS_PVP: 'Interpersonal', // Also Logical-Mathematical
  SOLITAIRE: 'Intrapersonal', // Also Logical-Mathematical
  ANT_ESCAPE: 'Naturalistic', // Also Logical-Mathematical, Visual-Spatial
  MATH_MADNESS: 'Logical-Mathematical',
  JIGSAW_9: 'Visual-Spatial',
  WHACK_A_MOLE: 'Bodily-Kinesthetic', // Reaction Field
  WORDS_BIRDS: 'Linguistic-Verbal',
  // Enhancement Games
  SUDOKU_PUZZLE: 'Logical-Mathematical', // Also Visual-Spatial
  BREAKOUT: 'Visual-Spatial', // Also Bodily-Kinesthetic (Gem Breaker)
  FUEL_A_CAR: 'Logical-Mathematical', // Also Bodily-Kinesthetic
  WORD_QUEST: 'Linguistic-Verbal', // Also Logical-Mathematical
  
  // Including some from the AI flow for broader reference if needed, though COGNITIVE_GAMES is now the primary source for the UI
  CANDY_FACTORY: 'Logical-Mathematical',
  PIECE_MAKING: 'Visual-Spatial',
  WATER_LILIES: 'Visual-Spatial',
  MOUSE_CHALLENGE: 'Bodily-Kinesthetic',
  MAHJONG: 'Visual-Spatial',
  CROSSROADS: 'Logical-Mathematical',
  WINDOW_CLEANER: 'Visual-Spatial', // Butterfly Hunter
  RIVAL_ORBS: 'Logical-Mathematical', // Shore Dangers
  MATH_TWINS: 'Logical-Mathematical',
  SIMON_SAYS: 'Musical', // Drive me crazy
};
