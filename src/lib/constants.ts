
import type { LucideIcon } from 'lucide-react';
import { Eye, FileText, Calculator, Bike, Music, Users, User, Leaf, Puzzle, Brain, BarChart3, Lightbulb, Settings, Bot, Gamepad2, CheckCircle2, UserCog } from 'lucide-react';
import type { IntelligenceId } from './types';

export const APP_NAME = "Xillo TruePotential";
export const PROFILING_GAMES_COUNT = 8;

export interface CognitiveGame {
  id: string; // Key like CANDY_FACTORY
  title: string; // Human-readable title like "Candy Factory"
  description: string;
  icon?: LucideIcon;
  dataAiHint?: string;
  assessesIntelligences: IntelligenceId[];
}

// Curated list of 12 games for profiling and enhancement
export const COGNITIVE_GAMES: CognitiveGame[] = [
  // --- Profiling Games (8) ---
  {
    id: "MATH_MADNESS", // Swapped to be first based on original user list order, but AI prompt expects specific order
    title: "Math Madness",
    description: "Boost numerical speed and accuracy.",
    icon: Calculator,
    dataAiHint: "math equations",
    assessesIntelligences: ['Logical-Mathematical'],
  },
  {
    id: "JIGSAW_9",
    title: "Jigsaw 9",
    description: "Develop visual assembly and mental rotation.",
    icon: Puzzle,
    dataAiHint: "jigsaw puzzle",
    assessesIntelligences: ['Visual-Spatial'],
  },
  {
    id: "WHACK_A_MOLE", // Original name, maps to Reaction Field
    title: "Reaction Field",
    description: "Improve reflexes and hand-eye coordination.",
    icon: Bike,
    dataAiHint: "whack a mole",
    assessesIntelligences: ['Bodily-Kinesthetic'],
  },
  {
    id: "WORDS_BIRDS",
    title: "Words Birds",
    description: "Expand vocabulary and word recognition.",
    icon: FileText,
    dataAiHint: "birds words",
    assessesIntelligences: ['Linguistic-Verbal'],
  },
  {
    id: "MELODY_MAYHEM",
    title: "Melody Mayhem",
    description: "Test your auditory processing and rhythm.",
    icon: Music,
    dataAiHint: "musical notes rhythm",
    assessesIntelligences: ['Musical'],
  },
  {
    id: "CHESS_PVP",
    title: "Chess PvP",
    description: "Master strategy and social prediction.",
    icon: Users,
    dataAiHint: "chess board people",
    assessesIntelligences: ['Interpersonal', 'Logical-Mathematical'],
  },
  {
    id: "SOLITAIRE",
    title: "Solitaire",
    description: "Cultivate patience and self-reflection.",
    icon: User,
    dataAiHint: "solitaire cards",
    assessesIntelligences: ['Intrapersonal', 'Logical-Mathematical'],
  },
  {
    id: "ANT_ESCAPE",
    title: "Ant Escape",
    description: "Sharpen environmental reasoning and planning.",
    icon: Leaf,
    dataAiHint: "ant maze nature",
    assessesIntelligences: ['Naturalistic', 'Visual-Spatial'],
  },
  // --- Enhancement Games (4) ---
  {
    id: "SUDOKU_PUZZLE",
    title: "Sudoku",
    description: "Enhance math and pattern recognition skills.",
    icon: Calculator, // Re-using, could be more specific
    dataAiHint: "sudoku grid",
    assessesIntelligences: ['Logical-Mathematical', 'Visual-Spatial'],
  },
  {
    id: "BREAKOUT", // Original name, maps to Gem Breaker
    title: "Gem Breaker",
    description: "Improve hand-eye coordination and visual tracking.",
    icon: Gamepad2, // More game-like
    dataAiHint: "gem breakout game",
    assessesIntelligences: ['Visual-Spatial', 'Bodily-Kinesthetic'],
  },
  {
    id: "FUEL_A_CAR",
    title: "Fuel a Car",
    description: "Test problem-solving and reaction speed.",
    icon: Brain, // Icon implies thinking
    dataAiHint: "car fuel logic",
    assessesIntelligences: ['Logical-Mathematical', 'Bodily-Kinesthetic'],
  },
  {
    id: "WORD_QUEST",
    title: "Word Quest",
    description: "Challenge vocabulary and reasoning.",
    icon: FileText, // Consistent with Words Birds
    dataAiHint: "word search",
    assessesIntelligences: ['Linguistic-Verbal', 'Logical-Mathematical'],
  },
];


export interface Intelligence {
  id: IntelligenceId; 
  name: string;
  description: string;
  icon: LucideIcon;
  color?: string;
}

export const MULTIPLE_INTELLIGENCES: Intelligence[] = [
  { id: 'Logical-Mathematical', name: 'Logical-Mathematical', description: 'Reasoning, calculating, logical analysis.', icon: Calculator, color: 'var(--chart-3)' },
  { id: 'Visual-Spatial', name: 'Visual-Spatial', description: 'Thinking in pictures, visualizing outcomes.', icon: Eye, color: 'var(--chart-1)' },
  { id: 'Bodily-Kinesthetic', name: 'Bodily-Kinesthetic', description: 'Using the body effectively, physical coordination.', icon: Bike, color: 'var(--chart-4)' },
  { id: 'Linguistic-Verbal', name: 'Linguistic-Verbal', description: 'Using words effectively, understanding language.', icon: FileText, color: 'var(--chart-2)' },
  { id: 'Musical', name: 'Musical', description: 'Sensitivity to rhythm, pitch, melody.', icon: Music, color: 'var(--chart-5)' },
  { id: 'Interpersonal', name: 'Interpersonal', description: 'Understanding and interacting with others.', icon: Users, color: 'var(--chart-6)' },
  { id: 'Intrapersonal', name: 'Intrapersonal', description: 'Understanding oneself, self-reflection.', icon: User, color: 'var(--chart-7)' },
  { id: 'Naturalistic', name: 'Naturalistic', description: 'Understanding nature, recognizing patterns in the natural world.', icon: Leaf, color: 'var(--chart-8)' },
];


export const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/games", label: "Games", icon: Puzzle },
  { href: "/insights", label: "My Insights", icon: Lightbulb },
  { href: "/profile", label: "Profile", icon: UserCog },
];

export const LOCAL_STORAGE_ACTIVITY_KEY = 'xilloTruePotentialActivity';
export const LOCAL_STORAGE_INSIGHTS_KEY = 'xilloTruePotentialInsights';
export const LOCAL_STORAGE_AUTH_KEY = 'xilloTruePotentialAuth';
