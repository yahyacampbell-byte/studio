
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
    id: "MATH_MADNESS",
    title: "Math Madness",
    description: "Fast-paced arithmetic challenges with time constraints. Uses adaptive difficulty to train both basic math skills and working memory under cognitive load.",
    icon: Calculator,
    dataAiHint: "math equations",
    assessesIntelligences: ['Logical-Mathematical'],
  },
  {
    id: "JIGSAW_9",
    title: "Jigsaw 9",
    description: "Digital jigsaw puzzle with rotating pieces. Trains mental rotation skills by requiring players to manipulate puzzle pieces in both 2D and 3D space.",
    icon: Puzzle,
    dataAiHint: "jigsaw puzzle",
    assessesIntelligences: ['Visual-Spatial'],
  },
  {
    id: "WHACK_A_MOLE",
    title: "Reaction Field",
    description: "Timed target-hitting game with moving stimuli. Measures and improves visual-motor reaction time with millisecond precision.",
    icon: Bike,
    dataAiHint: "whack a mole",
    assessesIntelligences: ['Bodily-Kinesthetic'],
  },
  {
    id: "WORDS_BIRDS",
    title: "Words Birds",
    description: "Word recognition game where players identify flying words before they disappear. Specifically targets rapid word recognition under time pressure, training both visual word processing and lexical access speed.",
    icon: FileText,
    dataAiHint: "birds words",
    assessesIntelligences: ['Linguistic-Verbal'],
  },
  {
    id: "MELODY_MAYHEM",
    title: "Melody Mayhem",
    description: "Rhythm matching game with melodic patterns. Trains both rhythm perception and auditory working memory through layered musical patterns.",
    icon: Music,
    dataAiHint: "musical notes rhythm",
    assessesIntelligences: ['Musical'],
  },
  {
    id: "CHESS_PVP",
    title: "Chess PvP",
    description: "Competitive strategic gameplay. Specifically trains perspective-taking and anticipatory social cognition through move prediction.",
    icon: Users,
    dataAiHint: "chess board people",
    assessesIntelligences: ['Interpersonal', 'Logical-Mathematical'],
  },
  {
    id: "SOLITAIRE",
    title: "Solitaire",
    description: "Classic card organization game. Trains executive function through continuous self-assessment and strategy adjustment.",
    icon: User,
    dataAiHint: "solitaire cards",
    assessesIntelligences: ['Intrapersonal', 'Logical-Mathematical'],
  },
  {
    id: "ANT_ESCAPE",
    title: "Ant Escape",
    description: "Solo navigation through environmental puzzles, focusing on adaptive planning.", // Simplified from "Self-monitoring, adaptive planning"
    icon: Leaf,
    dataAiHint: "ant maze nature",
    assessesIntelligences: ['Naturalistic', 'Visual-Spatial'],
  },
  // --- Enhancement Games (4) ---
  {
    id: "SUDOKU_PUZZLE",
    title: "Sudoku",
    description: "Classic number placement puzzle with varying difficulty. Enhances logical reasoning and pattern completion skills.",
    icon: Calculator,
    dataAiHint: "sudoku grid",
    assessesIntelligences: ['Logical-Mathematical', 'Visual-Spatial'],
  },
  {
    id: "BREAKOUT", // This game was not in the user's latest detailed list, so its description remains from previous definitions.
    title: "Gem Breaker",
    description: "Improve hand-eye coordination and visual tracking.", // Kept original
    icon: Gamepad2,
    dataAiHint: "gem breakout game",
    assessesIntelligences: ['Visual-Spatial', 'Bodily-Kinesthetic'],
  },
  {
    id: "FUEL_A_CAR",
    title: "Fuel a Car",
    description: "Resource management and driving game requiring path optimization and control. Tests problem-solving and reaction speed.",
    icon: Brain,
    dataAiHint: "car fuel logic",
    assessesIntelligences: ['Logical-Mathematical', 'Bodily-Kinesthetic'],
  },
  {
    id: "WORD_QUEST",
    title: "Word Quest",
    description: "Word puzzle game requiring players to find hidden words in letter grids, challenging vocabulary and reasoning.",
    icon: FileText,
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

// Order of intelligences here matches the AI prompt for consistency in chart output
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

