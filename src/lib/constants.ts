
import type { LucideIcon } from 'lucide-react';
import {
  Eye, FileText, Calculator, Bike, Music, Users, User, Leaf, Puzzle, Brain,
  BarChart3, Lightbulb, Settings, Bot, Gamepad2, CheckCircle2, UserCog, Factory,
  Sprout, Rat, Hammer, Type, Search, Crown, LayoutGrid, Bug, TrafficCone,
  Crosshair, ShieldAlert, Sigma, Minus, LineChart, Car, Gauge, Network, Bomb, Target,
  Dot, Rotate3d, Milestone, Copy, Image as ImageIcon, ToyBrick, Palette,
  Ship, Trees, HandHelping, TrendingUp, Route, Scale, Sparkles, ListChecks,
  Layers, Scissors, Citrus, Hand, Box, Cuboid, CircleDot, CakeSlice, Flower2,
  Binary, CandyCane, Package, Dog, Rainbow, Rocket, Zap, Diamond, Rabbit // Added Rabbit, removed Frog
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

// Helper function to normalize intelligence strings to IntelligenceId type
const normalizeIntelligenceIdInternal = (id: string): IntelligenceId => {
  const lowerId = id.toLowerCase().replace(/-/g, '_');
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
  // Also handle direct matches for already correctly formatted IDs
  if (MULTIPLE_INTELLIGENCES_BASE.some(mi => mi.id === id)) {
    return id as IntelligenceId;
  }
  return INTELLIGENCE_ID_MAP_INTERNAL[lowerId] || id as IntelligenceId; // Fallback if not in map
};


const BASE_COGNITIVE_GAMES: Omit<CognitiveGame, 'assessesIntelligences' | 'icon'> & { assessesIntelligences: string[], iconName: string }[] = [
  // --- Start of 8 Profiling Games (IDs must match those in the AI prompt rubric) ---
  {
    id: "MATH_TWINS", // Replaces "MATH_MADNESS" from original profiling list for consistency
    title: "Math Twins",
    description: "Matching game pairing equivalent mathematical expressions. Uses adaptive difficulty to train both basic math skills and working memory under cognitive load.",
    assessesIntelligences: ["Logical-Mathematical"],
    iconName: "Sigma",
    dataAiHint: "equivalence recognition speed notation formats"
  },
  {
    id: "JIGSAW_9",
    title: "Jigsaw 9",
    description: "Digital jigsaw puzzle with rotatable pieces and adjustable difficulty. Trains mental rotation skills by requiring players to manipulate puzzle pieces in both 2D and 3D space.",
    assessesIntelligences: ["Visual-Spatial"],
    iconName: "Puzzle",
    dataAiHint: "piece rotation frequency completion time"
  },
  {
    id: "WHACK_A_MOLE", // This is "Reaction Field"
    title: "Reaction Field",
    description: "Timed target-hitting game testing reflexes and hand-eye coordination. Measures and improves visual-motor reaction time with millisecond precision.",
    assessesIntelligences: ["Bodily-Kinesthetic"],
    iconName: "Hammer",
    dataAiHint: "Compare reaction time distribution to detect attention lapses."
  },
  {
    id: "WORDS_BIRDS",
    title: "Words Birds",
    description: "Word recognition challenge where players identify flying words before they disappear. Specifically targets rapid word recognition under time pressure, training both visual word processing and lexical access speed.",
    assessesIntelligences: ["Linguistic-Verbal"],
    iconName: "Type",
    dataAiHint: "Measure rare word recognition speed versus common words for vocabulary depth."
  },
  {
    id: "MELODY_MAYHEM",
    title: "Melody Mayhem",
    description: "Rhythm matching game where players replicate musical patterns. Trains both rhythm perception and auditory working memory through layered musical patterns.",
    assessesIntelligences: ["Musical"],
    iconName: "Music",
    dataAiHint: "Quantify pitch and tempo deviation to assess auditory processing."
  },
  {
    id: "CHESS_PVP", // This is "Chess"
    title: "Chess",
    description: "Strategic board game played against opponents or AI. Specifically trains perspective-taking and anticipatory social cognition through move prediction.",
    assessesIntelligences: ["Interpersonal", "Logical-Mathematical"],
    iconName: "Crown",
    dataAiHint: "Track move prediction accuracy and response time to theory of mind."
  },
  {
    id: "SOLITAIRE",
    title: "Solitaire",
    description: "Classic card organization game played individually. Trains executive function through continuous self-assessment and strategy adjustment.",
    assessesIntelligences: ["Intrapersonal", "Logical-Mathematical"],
    iconName: "LayoutGrid",
    dataAiHint: "Analyze win rate and move efficiency for metacognitive skills."
  },
  {
    id: "ANT_ESCAPE",
    title: "Ant Escape",
    description: "Navigation challenge through environmental obstacles, focusing on adaptive planning.",
    assessesIntelligences: ["Naturalistic", "Visual-Spatial"],
    iconName: "Bug",
    dataAiHint: "Measure path optimization and error correction for ecological reasoning."
  },
  // --- End of 8 Profiling Games ---

  // --- Start of 4 Enhancement Games (IDs must match those in AI prompt rubric for enhancement) ---
  // Note: SUDOKU_PUZZLE was removed from enhancement as per specific request, others mapped.
  // BREAKOUT ID is now BREAKOUT3D
  // FUEL_A_CAR was not in provided games, replaced by LANE_SPLITTER (Lane Changer)
  {
    id: "WORD_QUEST",
    title: "Word Quest",
    description: "Word search puzzle requiring players to find hidden terms in letter grids. Enhances vocabulary and logical deduction.",
    assessesIntelligences: ["Linguistic-Verbal", "Logical-Mathematical"],
    iconName: "Search",
    dataAiHint: "Track scanning patterns (linear vs random) to assess search strategies."
  },
  {
    id: "CROSSROADS",
    title: "Crossroads",
    description: "Traffic management simulation requiring strategic lane allocation. Enhances logical reasoning and spatial planning.",
    assessesIntelligences: ["Logical-Mathematical", "Visual-Spatial", "Interpersonal"],
    iconName: "TrafficCone",
    dataAiHint: "Analyze congestion patterns and decision latency under increasing complexity."
  },
  {
    id: "WINDOW_CLEANER", // This is "Butterfly Hunter"
    title: "Butterfly Hunter",
    description: "Tracking game where players capture moving targets across a grid. Improves hand-eye coordination and visual tracking.",
    assessesIntelligences: ["Visual-Spatial", "Bodily-Kinesthetic"],
    iconName: "Crosshair",
    dataAiHint: "Measure target acquisition speed and trajectory prediction accuracy."
  },
  {
    id: "LANE_SPLITTER", // This is "Lane Changer"
    title: "Lane Changer",
    description: "Driving simulation requiring rapid lane switching decisions. Tests problem-solving and reaction speed.",
    assessesIntelligences: ["Bodily-Kinesthetic", "Visual-Spatial", "Logical-Mathematical"],
    iconName: "Car",
    dataAiHint: "Track collision avoidance rate and steering correction frequency."
  },
  // --- End of 4 Enhancement Games ---

  // --- Additional Games from provided lists ---
  {
    id: "CANDY_FACTORY",
    title: "Candy Factory",
    description: "Resource management game where players optimize candy production lines under time constraints.",
    assessesIntelligences: ["Logical-Mathematical"],
    iconName: "Factory",
    dataAiHint: "Track production efficiency vs time spent to quantify strategic planning skills."
  },
  {
    id: "PIECE_MAKING",
    title: "Piece Making",
    description: "Assembly puzzle requiring players to construct objects from scattered parts.",
    assessesIntelligences: ["Visual-Spatial", "Logical-Mathematical"],
    iconName: "Puzzle",
    dataAiHint: "Measure rotation attempts and completion time to assess visual-spatial reasoning."
  },
  {
    id: "WATER_LILIES",
    title: "Water Lilies",
    description: "Ecosystem simulation where players balance pond life by managing lily pad growth.",
    assessesIntelligences: ["Naturalistic"],
    iconName: "Sprout",
    dataAiHint: "Analyze response patterns to environmental changes for systems thinking assessment."
  },
  {
    id: "MOUSE_CHALLENGE",
    title: "Mouse Challenge",
    description: "Pathfinding game where players navigate a mouse through maze obstacles.",
    assessesIntelligences: ["Visual-Spatial"],
    iconName: "Rat",
    dataAiHint: "Track wrong turns and backtracking frequency to measure spatial memory."
  },
  {
    id: "MAHJONG",
    title: "Mahjong",
    description: "Tile-matching game pairing identical symbols under time pressure.",
    assessesIntelligences: ["Visual-Spatial"],
    iconName: "LayoutGrid", // Replaced Tiles
    dataAiHint: "Analyze tile selection speed and matching errors for visual processing speed."
  },
  {
    id: "RIVAL_ORBS", // Title changed from "Shore Dangers" as per later game list
    title: "Shore Dangers",
    description: "Competitive resource collection game with environmental hazards.",
    assessesIntelligences: ["Interpersonal", "Naturalistic"],
    iconName: "ShieldAlert",
    dataAiHint: "Compare risk-taking behavior against opponents' strategies."
  },
  {
    id: "MATH_SUBTRACTION",
    title: "Minus Malus",
    description: "Fast-paced arithmetic drills focusing on subtraction skills.",
    assessesIntelligences: ["Logical-Mathematical"],
    iconName: "Minus",
    dataAiHint: "Analyze error patterns in borrowing operations versus simple subtraction."
  },
  {
    id: "MATH_LINES",
    title: "Numbers line",
    description: "Number sequence completion game with dynamic intervals.",
    assessesIntelligences: ["Logical-Mathematical"],
    iconName: "LineChart",
    dataAiHint: "Measure pattern recognition speed for linear vs non-linear sequences."
  },
  {
    id: "DRAGSTER_RACING",
    title: "Dragster Racing",
    description: "Timed acceleration challenge with gear-shifting mechanics.",
    assessesIntelligences: ["Bodily-Kinesthetic"],
    iconName: "Gauge",
    dataAiHint: "Analyze reaction time consistency during gear shift windows."
  },
  {
    id: "TRAFFIC_MANAGER", // Title changed from "Traffic Manager"
    title: "Traffic Manager",
    description: "Multi-lane coordination game with dynamic obstacle generation.",
    assessesIntelligences: ["Logical-Mathematical", "Interpersonal"],
    iconName: "Network",
    dataAiHint: "Quantify flow optimization under collaborative vs competitive conditions."
  },
  {
    id: "TENNIS_BOMB",
    title: "Tennis Bomb",
    description: "Ball-hitting game with explosive targets and trajectory arcs.",
    assessesIntelligences: ["Bodily-Kinesthetic"],
    iconName: "Bomb",
    dataAiHint: "Measure angular prediction accuracy for parabolic trajectories."
  },
  {
    id: "TENNIS_TARGET",
    title: "Tennis Target",
    description: "Precision aiming game with moving target zones.",
    assessesIntelligences: ["Bodily-Kinesthetic", "Visual-Spatial"],
    iconName: "Target",
    dataAiHint: "Analyze spatial targeting bias (left/right/center preferences)."
  },
  {
    id: "TENNIS_BULLING", // Title changed from "Tennis Bowling"
    title: "Tennis Bowling",
    description: "Hybrid sport game combining tennis mechanics with pin knockdown.",
    assessesIntelligences: ["Bodily-Kinesthetic"],
    iconName: "Dot", // Replaced Pin
    dataAiHint: "Track spin application effectiveness through pin scattering patterns."
  },
  {
    id: "TWIST_IT",
    title: "Twist It",
    description: "Rotation puzzle requiring angular alignment of geometric shapes.",
    assessesIntelligences: ["Visual-Spatial"],
    iconName: "Rotate3d",
    dataAiHint: "Quantify rotation efficiency (degrees/second) and correction attempts."
  },
  {
    id: "SNAKE", // ID for "Neuron Madness"
    title: "Neuron Madness",
    description: "Modernized snake game with branching path mechanics.",
    assessesIntelligences: ["Visual-Spatial"],
    iconName: "Milestone", // Replaced Snake
    dataAiHint: "Analyze path prediction strategies in constrained environments."
  },
  {
    id: "SIMON_SAYS", // ID for "Drive me crazy"
    title: "Drive me crazy",
    description: "Memory sequence replication game with color-light patterns.",
    assessesIntelligences: ["Musical", "Logical-Mathematical"],
    iconName: "Copy",
    dataAiHint: "Track sequence length retention and error types (omission vs commission)."
  },
  {
    id: "NAME_ME", // ID for "Visual Crossword"
    title: "Visual Crossword",
    description: "Object naming game using fragmented visual clues.",
    assessesIntelligences: ["Linguistic-Verbal"],
    iconName: "ImageIcon",
    dataAiHint: "Measure naming latency versus visual clue completeness percentage."
  },
  {
    id: "PENGUIN_MAZE",
    title: "Penguin Explorer",
    description: "3D navigation through complex ice mazes.",
    assessesIntelligences: ["Visual-Spatial"],
    iconName: "Ship", // Placeholder as Penguin icon is not standard
    dataAiHint: "Track pathfinding efficiency and spatial orientation errors."
  },
  {
    id: "SCRAMBLED",
    title: "Scrambled",
    description: "Players unscramble letters to form correct words.",
    assessesIntelligences: ["Linguistic-Verbal"],
    iconName: "Palette", // Placeholder for a more direct 'letters' icon
    dataAiHint: "Analyze verbal reasoning speed and anagram skill proficiency."
  },
  {
    id: "AUDIO_TENNIS", // ID for "Melodic Tennis"
    title: "Melodic Tennis",
    description: "Sound-based reaction game with pitch variations.",
    assessesIntelligences: ["Musical"],
    iconName: "Music",
    dataAiHint: "Measure tone discrimination accuracy and auditory reaction time."
  },
  {
    id: "PIRATE_ISLAND", // ID for "Treasure Island"
    title: "Treasure Island",
    description: "Nature-based exploration game.",
    assessesIntelligences: ["Naturalistic"],
    iconName: "Trees",
    dataAiHint: "Measure topographical memory and risk/reward choices in exploration."
  },
  {
    id: "MIX_AND_MATCH",
    title: "Match it!",
    description: "Pattern recognition game pairing related visual concepts across categories.",
    assessesIntelligences: ["Visual-Spatial", "Logical-Mathematical"],
    iconName: "Layers",
    dataAiHint: "Track cross-category association speed and error types (thematic vs visual errors)."
  },
  {
    id: "SLICE_AND_DROP",
    title: "Slice and Drop",
    description: "Precision cutting game with physics-based object splitting.",
    assessesIntelligences: ["Bodily-Kinesthetic"],
    iconName: "Scissors",
    dataAiHint: "Analyze cut angle consistency and post-cut object trajectory prediction."
  },
  {
    id: "FRESHQUEEZE",
    title: "Fresh Squeeze",
    description: "Timed fruit-matching game requiring color and shape coordination.",
    assessesIntelligences: ["Visual-Spatial"],
    iconName: "Citrus",
    dataAiHint: "Measure 3D rotation efficiency when matching fruit halves."
  },
  {
    id: "STEADY_MOVES",
    title: "Perfect Tension",
    description: "Fine motor control challenge navigating fragile objects through obstacles.",
    assessesIntelligences: ["Bodily-Kinesthetic"],
    iconName: "Hand",
    dataAiHint: "Quantify tremor frequency and grip adjustment precision."
  },
  {
    id: "BEE_BALLOON",
    title: "Bee Balloon",
    description: "Navigation game steering balloons through floral obstacle courses.",
    assessesIntelligences: ["Visual-Spatial", "Naturalistic"],
    iconName: "Flower2", // Replaced Balloon
    dataAiHint: "Track pollen collection route optimization in constrained spaces."
  },
  {
    id: "BREAKOUT3D", // This ID already existed as "BREAKOUT" but was part of enhancement games.
    title: "Gem Breaker 3D", // Title updated
    description: "Three-dimensional brick breaker with depth perception challenges.",
    assessesIntelligences: ["Visual-Spatial", "Bodily-Kinesthetic"],
    iconName: "Box",
    dataAiHint: "Compare frontal vs depth-axis paddle accuracy for z-axis spatial awareness."
  },
  {
    id: "BLOCKBUILDER",
    title: "Star Architect",
    description: "Volumetric construction game with blueprint interpretation.",
    assessesIntelligences: ["Visual-Spatial"],
    iconName: "Cuboid",
    dataAiHint: "Measure structural integrity prediction in gravity-affected designs."
  },
  {
    id: "BLOCKOUT",
    title: "Cube Foundry",
    description: "Spatial reasoning game extracting shapes from solid blocks.",
    assessesIntelligences: ["Visual-Spatial"],
    iconName: "ToyBrick", // Replaced Cube
    dataAiHint: "Analyze waste material minimization during extraction processes."
  },
  {
    id: "MANDALA",
    title: "Mandala",
    description: "Symmetrical pattern completion with radial design elements.",
    assessesIntelligences: ["Visual-Spatial"],
    iconName: "CircleDot",
    dataAiHint: "Track mirroring accuracy across quadrants and radial symmetry maintenance."
  },
  {
    id: "CUT_THE_CAKE", // ID for "Color Bee"
    title: "Color Bee",
    description: "Fraction division game with dynamic visual partitioning.",
    assessesIntelligences: ["Logical-Mathematical"],
    iconName: "CakeSlice",
    dataAiHint: "Measure proportional estimation accuracy versus exact calculation reliance."
  },
  {
    id: "DIGITS",
    title: "Digits",
    description: "Working memory challenge recalling number sequences with interference.",
    assessesIntelligences: ["Logical-Mathematical"],
    iconName: "Binary",
    dataAiHint: "Compare forward vs backward recall with auditory vs visual interference."
  },
  {
    id: "PUZZLE_2D",
    title: "Puzzles",
    description: "Traditional jigsaw puzzles with adjustable piece counts.",
    assessesIntelligences: ["Visual-Spatial"],
    iconName: "Puzzle",
    dataAiHint: "Track edge vs interior piece placement strategy development."
  },
  {
    id: "CANDY_LINE_UP",
    title: "Candy Line Up",
    description: "Pattern sequencing game with color and shape variables.",
    assessesIntelligences: ["Logical-Mathematical"],
    iconName: "CandyCane",
    dataAiHint: "Analyze sorting strategy changes when introducing multiple attributes."
  },
  {
    id: "SAVE_THE_FROG",
    title: "Happy Hopper",
    description: "Ecosystem navigation game avoiding predators and environmental hazards.",
    assessesIntelligences: ["Naturalistic"],
    iconName: "Rabbit", // Replaced Frog
    dataAiHint: "Measure adaptive pathfinding when introducing novel predator patterns."
  },
  {
    id: "PUZZLE_3D",
    title: "3D Art Puzzle",
    description: "Volumetric assembly of artistic sculptures from fragments.",
    assessesIntelligences: ["Visual-Spatial"],
    iconName: "Package",
    dataAiHint: "Quantify mental rotation attempts before successful placement."
  },
  {
    id: "ECHO_RACE", // ID for "Color Rush"
    title: "Color Rush",
    description: "Audio-visual reaction game matching colors to sound frequencies.",
    assessesIntelligences: ["Musical"],
    iconName: "Palette",
    dataAiHint: "Track synesthesia-like cross-modal association strengths."
  },
  {
    id: "FIND_THE_PUP",
    title: "Find Your Pet",
    description: "Object permanence challenge locating hidden animals in scenes.",
    assessesIntelligences: ["Naturalistic"],
    iconName: "Dog",
    dataAiHint: "Analyze search patterns (systematic vs random) and object permanence understanding."
  },
  {
    id: "COLOR_FRENZY",
    title: "Color Frenzy",
    description: "Rapid color-word Stroop test with escalating difficulty.",
    assessesIntelligences: ["Linguistic-Verbal"],
    iconName: "Rainbow",
    dataAiHint: "Measure interference effects between word reading and color naming."
  },
  {
    id: "SPACE_RESCUE",
    title: "Space Rescue",
    description: "Gravity-based navigation puzzle saving astronauts in orbital mechanics.",
    assessesIntelligences: ["Visual-Spatial", "Logical-Mathematical"],
    iconName: "Rocket",
    dataAiHint: "Analyze trajectory calculation efficiency in microgravity simulations."
  },
  {
    id: "NEON_LIGHTS",
    title: "Neon Lights",
    description: "Visual memory game recreating light sequence patterns.",
    assessesIntelligences: ["Visual-Spatial"],
    iconName: "Zap", // Replaced Neon
    dataAiHint: "Track chunking strategies in sequence memorization (group size/patterns)."
  },
  {
    id: "NEURON_GRAPH", // ID for "Synaptix"
    title: "Synaptix",
    description: "Neural pathway visualization game connecting cognitive concepts.",
    assessesIntelligences: ["Intrapersonal"],
    iconName: "Brain",
    dataAiHint: "Measure concept association strength through connection density analysis."
  },
  {
    id: "CRAZY_FACTORY",
    title: "Robo Factory",
    description: "Assembly line optimization with robotic component sorting.",
    assessesIntelligences: ["Logical-Mathematical"],
    iconName: "Bot",
    dataAiHint: "Quantify throughput efficiency vs error rate tradeoffs."
  },
  {
    id: "ROBOT", // ID for "Crystal Miner"
    title: "Crystal Miner",
    description: "Resource collection game with terrain deformation mechanics.",
    assessesIntelligences: ["Visual-Spatial"],
    iconName: "Diamond",
    dataAiHint: "Analyze digging path optimization in 3D voxel environments."
  },
  {
    id: "CHESS", // This is a new game, distinct from CHESS_PVP
    title: "Chess Puzzle", // Title updated from CHESS_PVP
    description: "Tactical chess scenarios requiring optimal move sequences.",
    assessesIntelligences: ["Logical-Mathematical"],
    iconName: "Crown", // Replaced ChessKing
    dataAiHint: "Track move depth calculation and sacrifice evaluation accuracy."
  }
];


const iconMap: Record<string, LucideIcon> = {
  Factory, Eye, FileText, Calculator, Bike, Music, Users, User, Leaf, Puzzle, Brain,
  BarChart3, Lightbulb, Settings, Bot, Gamepad2, CheckCircle2, UserCog,
  Sprout, Rat, Hammer, Type, Search, Crown, LayoutGrid, Bug, TrafficCone,
  Crosshair, ShieldAlert, Sigma, Minus, LineChart, Car, Gauge, Network, Bomb, Target,
  Dot, Rotate3d, Milestone, Copy, ImageIcon, ToyBrick, Palette,
  Ship, Trees, HandHelping, TrendingUp, Route, Scale, Sparkles, ListChecks,
  Layers, Scissors, Citrus, Hand, Box, Cuboid, CircleDot, CakeSlice, Flower2,
  Binary, CandyCane, Rabbit, Package, Dog, Rainbow, Rocket, Zap, Diamond // Added Rabbit, Diamond, Flower2; removed Frog, Neon, Balloon, Cube, Tiles, Snake, SearchText
};

// Merge and normalize game data
const gameDataMap = new Map<string, CognitiveGame>();

BASE_COGNITIVE_GAMES.forEach(game => {
  const iconComponent = iconMap[game.iconName];
  if (!iconComponent) {
    console.warn(`Icon not found for ${game.iconName}, game: ${game.title}`);
  }
  gameDataMap.set(game.id, {
    ...game,
    icon: iconComponent || Puzzle, // Fallback to Puzzle icon
    assessesIntelligences: game.assessesIntelligences.map(normalizeIntelligenceIdInternal),
  });
});

export const COGNITIVE_GAMES: CognitiveGame[] = Array.from(gameDataMap.values());

// IDs of the 4 games designated as "Profile Enhancement Games"
// These will be excluded from the "Games by Intelligence" accordions and shown in their own section.
export const ENHANCEMENT_GAME_IDS: string[] = [
    "WORD_QUEST",     // Linguistic, Logical
    "CROSSROADS",     // Logical, Spatial, Interpersonal
    "WINDOW_CLEANER", // Butterfly Hunter - Visual-Spatial, Bodily-Kinesthetic
    "LANE_SPLITTER"   // Lane Changer - Bodily-Kinesthetic, Visual-Spatial, Logical-Mathematical
];

export interface Intelligence {
  id: IntelligenceId;
  name: string;
  description: string;
  icon: LucideIcon;
  color?: string;
}

// Base definition for MULTIPLE_INTELLIGENCES, used by normalizeIntelligenceIdInternal
const MULTIPLE_INTELLIGENCES_BASE: Omit<Intelligence, 'color'>[] = [
  { id: 'Logical-Mathematical', name: 'Logical-Mathematical', description: 'Reasoning, calculating, logical analysis.', icon: Calculator },
  { id: 'Visual-Spatial', name: 'Visual-Spatial', description: 'Thinking in pictures, visualizing outcomes.', icon: Eye },
  { id: 'Bodily-Kinesthetic', name: 'Bodily-Kinesthetic', description: 'Using the body effectively, physical coordination.', icon: Bike },
  { id: 'Linguistic-Verbal', name: 'Linguistic-Verbal', description: 'Using words effectively, understanding language.', icon: FileText },
  { id: 'Musical', name: 'Musical', description: 'Sensitivity to rhythm, pitch, melody.', icon: Music },
  { id: 'Interpersonal', name: 'Interpersonal', description: 'Understanding and interacting with others.', icon: Users },
  { id: 'Intrapersonal', name: 'Intrapersonal', description: 'Understanding oneself, self-reflection.', icon: User },
  { id: 'Naturalistic', name: 'Naturalistic', description: 'Understanding nature, recognizing patterns in the natural world.', icon: Leaf },
];

// Order of intelligences here matches the AI prompt for consistency in chart output
export const MULTIPLE_INTELLIGENCES: Intelligence[] = [
  { ...MULTIPLE_INTELLIGENCES_BASE[0], color: 'var(--chart-3)' }, // Logical-Mathematical
  { ...MULTIPLE_INTELLIGENCES_BASE[1], color: 'var(--chart-1)' }, // Visual-Spatial
  { ...MULTIPLE_INTELLIGENCES_BASE[2], color: 'var(--chart-4)' }, // Bodily-Kinesthetic
  { ...MULTIPLE_INTELLIGENCES_BASE[3], color: 'var(--chart-2)' }, // Linguistic-Verbal
  { ...MULTIPLE_INTELLIGENCES_BASE[4], color: 'var(--chart-5)' }, // Musical
  { ...MULTIPLE_INTELLIGENCES_BASE[5], color: 'var(--chart-6)' }, // Interpersonal
  { ...MULTIPLE_INTELLIGENCES_BASE[6], color: 'var(--chart-7)' }, // Intrapersonal
  { ...MULTIPLE_INTELLIGENCES_BASE[7], color: 'var(--chart-8)' }, // Naturalistic
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

// Helper function to normalize intelligence strings to IntelligenceId type (exported)
export const normalizeIntelligenceId = (id: string): IntelligenceId => {
  return normalizeIntelligenceIdInternal(id);
};

// Ensure game IDs are unique (important for keys and data mapping)
const gameIds = COGNITIVE_GAMES.map(game => game.id);
const uniqueGameIds = new Set(gameIds);
if (gameIds.length !== uniqueGameIds.size) {
  console.warn("Warning: Duplicate game IDs found in COGNITIVE_GAMES. This can lead to issues.");
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

    
