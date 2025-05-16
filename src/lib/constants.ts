
import type { LucideIcon } from 'lucide-react';
import {
  Eye, FileText, Calculator, Bike, Music, Users, User, Leaf, Puzzle, Brain,
  BarChart3, Lightbulb, Settings, Bot, Gamepad2, CheckCircle2, UserCog, Factory,
  Sprout, Rat, Hammer, Type, Search, Tiles, Crown, LayoutGrid, Bug, TrafficCone,
  Crosshair, ShieldAlert, Sigma, Minus, LineChart, Car, Gauge, Network, Bomb, Target,
  Dot, Rotate3d, Copy, Image as ImageIcon, ToyBrick, Milestone, Palette,
  Ship, Trees, HandHelping, TrendingUp, Route, Scale, Sparkles, ListChecks, LightbulbIcon
} from 'lucide-react';
import type { IntelligenceId } from './types';

export const APP_NAME = "Xillo TruePotential";
export const PROFILING_GAMES_COUNT = 8; // The first 8 games in COGNITIVE_GAMES are for profiling

export interface CognitiveGame {
  id: string;
  title: string;
  description: string;
  assessesIntelligences: IntelligenceId[];
  icon?: LucideIcon;
  dataAiHint?: string;
}

// Order of the first 8 games is important for "Profiling Games"
// These must match the first 8 games detailed in the AI prompt's rubric.
export const COGNITIVE_GAMES: CognitiveGame[] = [
  // --- Start of 8 Profiling Games (IDs must match those in the AI prompt rubric) ---
  {
    id: "MATH_TWINS", // Replaces "MATH_MADNESS" from original profiling list if needed for consistency
    title: "Math Twins",
    description: "Matching game pairing equivalent mathematical expressions. Uses adaptive difficulty to train both basic math skills and working memory under cognitive load.",
    assessesIntelligences: ["Logical-Mathematical"],
    icon: Sigma,
    dataAiHint: "equivalence recognition speed notation formats"
  },
  {
    id: "JIGSAW_9",
    title: "Jigsaw 9",
    description: "Digital jigsaw puzzle with rotatable pieces and adjustable difficulty. Trains mental rotation skills by requiring players to manipulate puzzle pieces in both 2D and 3D space.",
    assessesIntelligences: ["Visual-Spatial"],
    icon: Puzzle,
    dataAiHint: "piece rotation frequency completion time"
  },
  {
    id: "WHACK_A_MOLE", // This is "Reaction Field"
    title: "Reaction Field",
    description: "Timed target-hitting game testing reflexes and hand-eye coordination. Measures and improves visual-motor reaction time with millisecond precision.",
    assessesIntelligences: ["Bodily-Kinesthetic"],
    icon: Hammer,
    dataAiHint: "reaction time distribution attention lapses"
  },
  {
    id: "WORDS_BIRDS",
    title: "Words Birds",
    description: "Word recognition challenge where players identify flying words before they disappear. Specifically targets rapid word recognition under time pressure, training both visual word processing and lexical access speed.",
    assessesIntelligences: ["Linguistic-Verbal"],
    icon: Type,
    dataAiHint: "rare word recognition speed vocabulary"
  },
  {
    id: "MELODY_MAYHEM",
    title: "Melody Mayhem",
    description: "Rhythm matching game where players replicate musical patterns. Trains both rhythm perception and auditory working memory through layered musical patterns.",
    assessesIntelligences: ["Musical"],
    icon: Music,
    dataAiHint: "pitch tempo deviation auditory processing"
  },
  {
    id: "CHESS_PVP", // This is "Chess"
    title: "Chess",
    description: "Strategic board game played against opponents or AI. Specifically trains perspective-taking and anticipatory social cognition through move prediction.",
    assessesIntelligences: ["Interpersonal", "Logical-Mathematical"],
    icon: Crown, // Using Crown for Chess
    dataAiHint: "move prediction accuracy theory mind"
  },
  {
    id: "SOLITAIRE",
    title: "Solitaire",
    description: "Classic card organization game played individually. Trains executive function through continuous self-assessment and strategy adjustment.",
    assessesIntelligences: ["Intrapersonal", "Logical-Mathematical"],
    icon: LayoutGrid, // Using LayoutGrid as 'Cards' icon is not available.
    dataAiHint: "win rate move efficiency metacognitive"
  },
  {
    id: "ANT_ESCAPE",
    title: "Ant Escape",
    description: "Navigation challenge through environmental obstacles, focusing on adaptive planning.",
    assessesIntelligences: ["Naturalistic", "Visual-Spatial"],
    icon: Bug,
    dataAiHint: "path optimization error correction ecological"
  },
  // --- End of 8 Profiling Games ---

  // --- Start of 4 Enhancement Games (IDs must match those in AI prompt rubric for enhancement) ---
  {
    id: "CROSSROADS", // Replaces SUDOKU_PUZZLE ID for consistency with AI rubric for Crossroads
    title: "Crossroads",
    description: "Traffic management simulation requiring strategic lane allocation. Enhances logical reasoning and spatial planning.",
    assessesIntelligences: ["Logical-Mathematical", "Visual-Spatial"],
    icon: TrafficCone,
    dataAiHint: "congestion patterns decision latency complexity"
  },
  {
    id: "WINDOW_CLEANER", // This is "Butterfly Hunter"
    title: "Butterfly Hunter",
    description: "Tracking game where players capture moving targets across a grid. Improves hand-eye coordination and visual tracking.",
    assessesIntelligences: ["Visual-Spatial", "Bodily-Kinesthetic"],
    icon: Crosshair, // Replaced Butterfly
    dataAiHint: "target acquisition speed trajectory prediction"
  },
  {
    id: "LANE_SPLITTER", // This is "Lane Changer"
    title: "Lane Changer",
    description: "Driving simulation requiring rapid lane switching decisions. Tests problem-solving and reaction speed.",
    assessesIntelligences: ["Bodily-Kinesthetic", "Visual-Spatial", "Logical-Mathematical"],
    icon: Car,
    dataAiHint: "collision avoidance steering correction frequency"
  },
  {
    id: "WORD_QUEST",
    title: "Word Quest",
    description: "Word search puzzle requiring players to find hidden terms in letter grids. Enhances vocabulary and logical deduction.",
    assessesIntelligences: ["Linguistic-Verbal", "Logical-Mathematical"],
    icon: Search, // Replaced SearchText
    dataAiHint: "scanning patterns search strategies"
  },
  // --- End of 4 Enhancement Games ---

  // --- Additional Games for Variety (from user's larger list) ---
  {
    id: "CANDY_FACTORY",
    title: "Candy Factory",
    description: "Resource management game where players optimize candy production lines under time constraints.",
    assessesIntelligences: ["Logical-Mathematical"],
    icon: Factory,
    dataAiHint: "production efficiency strategic planning"
  },
  {
    id: "PIECE_MAKING",
    title: "Piece Making",
    description: "Assembly puzzle requiring players to construct objects from scattered parts.",
    assessesIntelligences: ["Visual-Spatial", "Logical-Mathematical"],
    icon: ToyBrick, // Puzzle icon is used by Jigsaw_9. ToyBrick is a good fit.
    dataAiHint: "rotation attempts visual-spatial reasoning"
  },
  {
    id: "WATER_LILIES",
    title: "Water Lilies",
    description: "Ecosystem simulation where players balance pond life by managing lily pad growth.",
    assessesIntelligences: ["Naturalistic"],
    icon: Sprout,
    dataAiHint: "response patterns environmental changes systems"
  },
  {
    id: "MOUSE_CHALLENGE",
    title: "Mouse Challenge",
    description: "Pathfinding game where players navigate a mouse through maze obstacles.",
    assessesIntelligences: ["Visual-Spatial"],
    icon: Rat,
    dataAiHint: "wrong turns backtracking spatial memory"
  },
  {
    id: "MAHJONG",
    title: "Mahjong",
    description: "Tile-matching game pairing identical symbols under time pressure.",
    assessesIntelligences: ["Visual-Spatial"],
    icon: Tiles,
    dataAiHint: "tile selection speed matching errors"
  },
  {
    id: "RIVAL_ORBS",
    title: "Shore Dangers",
    description: "Competitive resource collection game with environmental hazards.",
    assessesIntelligences: ["Interpersonal", "Naturalistic"],
    icon: ShieldAlert,
    dataAiHint: "risk-taking behavior opponents strategies"
  },
  {
    id: "MATH_SUBTRACTION",
    title: "Minus Malus",
    description: "Fast-paced arithmetic drills focusing on subtraction skills.",
    assessesIntelligences: ["Logical-Mathematical"],
    icon: Minus,
    dataAiHint: "error patterns borrowing operations subtraction"
  },
  {
    id: "MATH_LINES",
    title: "Numbers line",
    description: "Number sequence completion game with dynamic intervals.",
    assessesIntelligences: ["Logical-Mathematical"],
    icon: LineChart,
    dataAiHint: "pattern recognition linear non-linear"
  },
  {
    id: "DRAGSTER_RACING",
    title: "Dragster Racing",
    description: "Timed acceleration challenge with gear-shifting mechanics.",
    assessesIntelligences: ["Bodily-Kinesthetic"],
    icon: Gauge,
    dataAiHint: "reaction time consistency gear shift"
  },
  {
    id: "TRAFFIC_MANAGER",
    title: "Traffic Manager",
    description: "Multi-lane coordination game with dynamic obstacle generation.",
    assessesIntelligences: ["Logical-Mathematical", "Interpersonal"],
    icon: Network,
    dataAiHint: "flow optimization collaborative competitive"
  },
  {
    id: "TENNIS_BOMB",
    title: "Tennis Bomb",
    description: "Ball-hitting game with explosive targets and trajectory arcs.",
    assessesIntelligences: ["Bodily-Kinesthetic"],
    icon: Bomb,
    dataAiHint: "angular prediction accuracy parabolic trajectories"
  },
  {
    id: "TENNIS_TARGET",
    title: "Tennis Target",
    description: "Precision aiming game with moving target zones.",
    assessesIntelligences: ["Bodily-Kinesthetic", "Visual-Spatial"],
    icon: Target,
    dataAiHint: "spatial targeting bias preferences"
  },
  {
    id: "TENNIS_BULLING",
    title: "Tennis Bowling",
    description: "Hybrid sport game combining tennis mechanics with pin knockdown.",
    assessesIntelligences: ["Bodily-Kinesthetic"],
    icon: Dot, // Using Dot as 'Pin' or 'BowlingBall' is not available
    dataAiHint: "spin application effectiveness pin scattering"
  },
  {
    id: "TWIST_IT",
    title: "Twist It",
    description: "Rotation puzzle requiring angular alignment of geometric shapes.",
    assessesIntelligences: ["Visual-Spatial"],
    icon: Rotate3d,
    dataAiHint: "rotation efficiency correction attempts"
  },
  {
    id: "SNAKE",
    title: "Neuron Madness",
    description: "Modernized snake game with branching path mechanics.",
    assessesIntelligences: ["Visual-Spatial"],
    icon: Milestone, // Replaced Snake icon
    dataAiHint: "path prediction strategies constrained environments"
  },
  {
    id: "SIMON_SAYS",
    title: "Drive me crazy",
    description: "Memory sequence replication game with color-light patterns.",
    assessesIntelligences: ["Musical", "Logical-Mathematical"],
    icon: Copy,
    dataAiHint: "sequence length retention error types"
  },
  {
    id: "NAME_ME",
    title: "Visual Crossword",
    description: "Object naming game using fragmented visual clues.",
    assessesIntelligences: ["Linguistic-Verbal"],
    icon: ImageIcon,
    dataAiHint: "naming latency visual clue completeness"
  }
];


// IDs of the 4 games designated as "Profile Enhancement Games"
// These will be excluded from the "Games by Intelligence" accordions and shown in their own section.
export const ENHANCEMENT_GAME_IDS: string[] = ["CROSSROADS", "WINDOW_CLEANER", "LANE_SPLITTER", "WORD_QUEST"];

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
  { href: "/insights", label: "My Insights", icon: LightbulbIcon },
  { href: "/profile", label: "Profile", icon: UserCog },
];

export const LOCAL_STORAGE_ACTIVITY_KEY = 'xilloTruePotentialActivity';
export const LOCAL_STORAGE_INSIGHTS_KEY = 'xilloTruePotentialInsights';
export const LOCAL_STORAGE_AUTH_KEY = 'xilloTruePotentialAuth';

// Mapping IntelligenceId to the correct constant name for type safety
// Used for normalizing intelligence IDs from various sources
const INTELLIGENCE_ID_MAP_INTERNAL: { [key: string]: IntelligenceId } = {
  "linguistic": "Linguistic-Verbal",
  "linguistic_verbal": "Linguistic-Verbal",
  "logical_mathematical": "Logical-Mathematical",
  "logical-mathematical": "Logical-Mathematical",
  "spatial": "Visual-Spatial",
  "visual_spatial": "Visual-Spatial",
  "visual-spatial": "Visual-Spatial",
  "bodily_kinesthetic": "Bodily-Kinesthetic",
  "bodily-kinesthetic": "Bodily-Kinesthetic",
  "musical": "Musical",
  "interpersonal": "Interpersonal",
  "intrapersonal": "Intrapersonal",
  "naturalistic": "Naturalistic",
};

// Helper function to normalize intelligence strings to IntelligenceId type
export const normalizeIntelligenceId = (id: string): IntelligenceId => {
  const lowerId = id.toLowerCase().replace(/-/g, '_');
  return INTELLIGENCE_ID_MAP_INTERNAL[lowerId] || id as IntelligenceId; // Fallback if not in map
};

// Normalize intelligence IDs in COGNITIVE_GAMES upon definition
COGNITIVE_GAMES.forEach(game => {
  game.assessesIntelligences = game.assessesIntelligences.map(normalizeIntelligenceId);
});

// Additional type for icon names, if strict typing for icon strings is desired (optional)
export type LucideIconName = keyof typeof import('lucide-react');

// Verify assigned icons are valid LucideIconName (optional, for stricter type checking during development)
// This is a conceptual check; actual implementation would require more complex type manipulation
// or a script to validate icon names against lucide-react exports.
/*
function validateIconAssignments(games: CognitiveGame[]): void {
  games.forEach(game => {
    if (typeof game.icon === 'string') {
      // This is a simplified check. Real validation would need to check against actual Lucide exports.
      // console.log(`Game "${game.title}" uses string icon "${game.icon}". Ensure this is a valid LucideIconName or handle appropriately.`);
    }
  });
}
validateIconAssignments(COGNITIVE_GAMES);
*/

// Ensure game IDs are unique (important for keys and data mapping)
const gameIds = COGNITIVE_GAMES.map(game => game.id);
const uniqueGameIds = new Set(gameIds);
if (gameIds.length !== uniqueGameIds.size) {
  console.warn("Warning: Duplicate game IDs found in COGNITIVE_GAMES. This can lead to issues.");
  // Find and log duplicates for easier debugging
  const idCounts: Record<string, number> = {};
  gameIds.forEach(id => { idCounts[id] = (idCounts[id] || 0) + 1; });
  const duplicates = Object.entries(idCounts).filter(([, count]) => count > 1).map(([id]) => id);
  console.warn("Duplicate IDs:", duplicates);
}
