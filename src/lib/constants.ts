
import type { LucideIcon } from 'lucide-react';
import {
  Eye, FileText, Calculator, Bike, Music, Users, User, Leaf, Puzzle, Brain,
  BarChart3, Lightbulb, Settings, Bot, Gamepad2, CheckCircle2, UserCog, Factory,
  Sprout, Rat, Hammer, Type, Search, Crown, LayoutGrid, Bug, TrafficCone, // Removed Tiles, LayoutGrid is already here
  Crosshair, ShieldAlert, Sigma, Minus, LineChart, Car, Gauge, Network, Bomb, Target,
  Dot, Rotate3d, Milestone, Copy, Image as ImageIcon, ToyBrick, Palette,
  Ship, Trees, HandHelping, TrendingUp, Route, Scale, Sparkles, ListChecks
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
// These must match the first 8 games detailed in the AI prompt rubric.
export const COGNITIVE_GAMES: CognitiveGame[] = [
  // --- Start of 8 Profiling Games (IDs must match those in the AI prompt rubric) ---
  {
    id: "MATH_TWINS", // Replaces "MATH_MADNESS" from original profiling list for consistency
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
    icon: LayoutGrid, // Using LayoutGrid for Solitaire
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
    assessesIntelligences: ["Logical-Mathematical", "Visual-Spatial", "Interpersonal"],
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

  // --- Additional Games for Variety ---
  {
    id: "CANDY_FACTORY",
    title: "Candy Factory",
    description: "Resource management game where players optimize candy production lines under time constraints.",
    assessesIntelligences: ["Logical-Mathematical"],
    icon: Factory,
    dataAiHint: "Track production efficiency vs time spent to quantify strategic planning skills."
  },
  {
    id: "PIECE_MAKING",
    title: "Piece Making",
    description: "Assembly puzzle requiring players to construct objects from scattered parts.",
    assessesIntelligences: ["Visual-Spatial", "Logical-Mathematical"],
    icon: ToyBrick, // Changed from Puzzle to ToyBrick to avoid conflict
    dataAiHint: "Measure rotation attempts and completion time to assess visual-spatial reasoning."
  },
  {
    id: "WATER_LILIES",
    title: "Water Lilies",
    description: "Ecosystem simulation where players balance pond life by managing lily pad growth.",
    assessesIntelligences: ["Naturalistic"],
    icon: Sprout,
    dataAiHint: "Analyze response patterns to environmental changes for systems thinking assessment."
  },
  {
    id: "MOUSE_CHALLENGE",
    title: "Mouse Challenge",
    description: "Pathfinding game where players navigate a mouse through maze obstacles.",
    assessesIntelligences: ["Visual-Spatial"],
    icon: Rat,
    dataAiHint: "Track wrong turns and backtracking frequency to measure spatial memory."
  },
  {
    id: "MAHJONG",
    title: "Mahjong",
    description: "Tile-matching game pairing identical symbols under time pressure.",
    assessesIntelligences: ["Visual-Spatial"],
    icon: LayoutGrid, // Replaced Tiles with LayoutGrid
    dataAiHint: "Analyze tile selection speed and matching errors for visual processing speed."
  },
  {
    id: "RIVAL_ORBS",
    title: "Shore Dangers",
    description: "Competitive resource collection game with environmental hazards.",
    assessesIntelligences: ["Interpersonal", "Naturalistic"],
    icon: ShieldAlert,
    dataAiHint: "Compare risk-taking behavior against opponents' strategies."
  },
  {
    id: "MATH_SUBTRACTION",
    title: "Minus Malus",
    description: "Fast-paced arithmetic drills focusing on subtraction skills.",
    assessesIntelligences: ["Logical-Mathematical"],
    icon: Minus,
    dataAiHint: "Analyze error patterns in borrowing operations versus simple subtraction."
  },
  {
    id: "MATH_LINES",
    title: "Numbers line",
    description: "Number sequence completion game with dynamic intervals.",
    assessesIntelligences: ["Logical-Mathematical"],
    icon: LineChart,
    dataAiHint: "Measure pattern recognition speed for linear vs non-linear sequences."
  },
  {
    id: "DRAGSTER_RACING",
    title: "Dragster Racing",
    description: "Timed acceleration challenge with gear-shifting mechanics.",
    assessesIntelligences: ["Bodily-Kinesthetic"],
    icon: Gauge,
    dataAiHint: "Analyze reaction time consistency during gear shift windows."
  },
  {
    id: "TRAFFIC_MANAGER",
    title: "Traffic Manager",
    description: "Multi-lane coordination game with dynamic obstacle generation.",
    assessesIntelligences: ["Logical-Mathematical", "Interpersonal"],
    icon: Network,
    dataAiHint: "Quantify flow optimization under collaborative vs competitive conditions."
  },
  {
    id: "TENNIS_BOMB",
    title: "Tennis Bomb",
    description: "Ball-hitting game with explosive targets and trajectory arcs.",
    assessesIntelligences: ["Bodily-Kinesthetic"],
    icon: Bomb,
    dataAiHint: "Measure angular prediction accuracy for parabolic trajectories."
  },
  {
    id: "TENNIS_TARGET",
    title: "Tennis Target",
    description: "Precision aiming game with moving target zones.",
    assessesIntelligences: ["Bodily-Kinesthetic", "Visual-Spatial"],
    icon: Target,
    dataAiHint: "Analyze spatial targeting bias (left/right/center preferences)."
  },
  {
    id: "TENNIS_BULLING",
    title: "Tennis Bowling",
    description: "Hybrid sport game combining tennis mechanics with pin knockdown.",
    assessesIntelligences: ["Bodily-Kinesthetic"],
    icon: Dot, // Replaced Pin
    dataAiHint: "Track spin application effectiveness through pin scattering patterns."
  },
  {
    id: "TWIST_IT",
    title: "Twist It",
    description: "Rotation puzzle requiring angular alignment of geometric shapes.",
    assessesIntelligences: ["Visual-Spatial"],
    icon: Rotate3d,
    dataAiHint: "Quantify rotation efficiency (degrees/second) and correction attempts."
  },
  {
    id: "SNAKE",
    title: "Neuron Madness",
    description: "Modernized snake game with branching path mechanics.",
    assessesIntelligences: ["Visual-Spatial"],
    icon: Milestone, // Replaced Snake icon
    dataAiHint: "Analyze path prediction strategies in constrained environments."
  },
  {
    id: "SIMON_SAYS",
    title: "Drive me crazy",
    description: "Memory sequence replication game with color-light patterns.",
    assessesIntelligences: ["Musical", "Logical-Mathematical"],
    icon: Copy,
    dataAiHint: "Track sequence length retention and error types (omission vs commission)."
  },
  {
    id: "NAME_ME",
    title: "Visual Crossword",
    description: "Object naming game using fragmented visual clues.",
    assessesIntelligences: ["Linguistic-Verbal"],
    icon: ImageIcon, // aliased from Image
    dataAiHint: "Measure naming latency versus visual clue completeness percentage."
  },
  {
    id: "PENGUIN_MAZE",
    title: "Penguin Explorer",
    description: "3D navigation through complex ice mazes.",
    assessesIntelligences: ["Visual-Spatial"],
    icon: Ship,
    dataAiHint: "Track pathfinding efficiency and spatial orientation errors."
  },
  {
    id: "BLOCKBUILDER",
    title: "Star Architect",
    description: "3D block construction from 2D blueprints.",
    assessesIntelligences: ["Visual-Spatial"],
    icon: ToyBrick,
    dataAiHint: "Measure volumetric visualization accuracy and assembly time."
  },
  {
    id: "SCRAMBLED",
    title: "Scrambled",
    description: "Players unscramble letters to form correct words.",
    assessesIntelligences: ["Linguistic-Verbal"],
    icon: Palette,
    dataAiHint: "Analyze verbal reasoning speed and anagram skill proficiency."
  },
  {
    id: "AUDIO_TENNIS",
    title: "Melodic Tennis",
    description: "Sound-based reaction game with pitch variations.",
    assessesIntelligences: ["Musical"],
    icon: Music,
    dataAiHint: "Measure tone discrimination accuracy and auditory reaction time."
  },
  {
    id: "ECHO_RACE",
    title: "Color Rush",
    description: "Audio-visual synchronization challenge.",
    assessesIntelligences: ["Musical"],
    icon: TrendingUp,
    dataAiHint: "Assess cross-modal integration speed and accuracy."
  },
  {
    id: "NEURON_GRAPH",
    title: "Synaptix",
    description: "Personal cognitive mapping game.",
    assessesIntelligences: ["Intrapersonal"],
    icon: Network,
    dataAiHint: "Track self-awareness development and mental model complexity."
  },
  {
    id: "PIRATE_ISLAND",
    title: "Treasure Island",
    description: "Nature-based exploration game.",
    assessesIntelligences: ["Naturalistic"],
    icon: Trees,
    dataAiHint: "Measure topographical memory and risk/reward choices in exploration."
  },
  {
    id: "SAVE_THE_FROG",
    title: "Happy Hopper",
    description: "Amphibian habitat navigation.",
    assessesIntelligences: ["Naturalistic"],
    icon: HandHelping,
    dataAiHint: "Assess ecological reasoning and habitat navigation skills."
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
  { href: "/insights", label: "My Insights", icon: Lightbulb },
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
  // Also handle direct matches for already correctly formatted IDs
  if (MULTIPLE_INTELLIGENCES.some(mi => mi.id === id)) {
    return id as IntelligenceId;
  }
  return INTELLIGENCE_ID_MAP_INTERNAL[lowerId] || id as IntelligenceId; // Fallback if not in map
};

// Normalize intelligence IDs in COGNITIVE_GAMES upon definition
COGNITIVE_GAMES.forEach(game => {
  game.assessesIntelligences = game.assessesIntelligences.map(normalizeIntelligenceId);
});

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

// Ensure assessesIntelligences in COGNITIVE_GAMES are valid IntelligenceIds
COGNITIVE_GAMES.forEach(game => {
  game.assessesIntelligences.forEach(intId => {
    if (!MULTIPLE_INTELLIGENCES.some(mi => mi.id === intId)) {
      console.warn(`Warning: Game "${game.title}" (ID: ${game.id}) has an invalid intelligence ID: "${intId}".`);
    }
  });
});
