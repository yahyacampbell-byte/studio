
'use server';
/**
 * @fileOverview Generates personalized insights and recommendations based on user gameplay data and Multiple Intelligences mapping.
 *
 * - generatePersonalizedInsights - A function that handles the generation of personalized insights.
 * - PersonalizedInsightsInput - The input type for the generatePersonalizedInsights function.
 * - PersonalizedInsightsOutput - The return type for the generatePersonalizedInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedInsightsInputSchema = z.object({
  gameData: z
    .string()
    .describe(
      'A stringified JSON object containing the user game data, including game title, score, and timestamp.'
    ),
});
export type PersonalizedInsightsInput = z.infer<typeof PersonalizedInsightsInputSchema>;

const PersonalizedInsightsOutputSchema = z.object({
  insights: z.string().describe('Personalized insights based on gameplay data.'),
  recommendations: z.string().describe('Recommendations for improvement based on the insights.'),
});
export type PersonalizedInsightsOutput = z.infer<typeof PersonalizedInsightsOutputSchema>;

export async function generatePersonalizedInsights(
  input: PersonalizedInsightsInput
): Promise<PersonalizedInsightsOutput> {
  return generatePersonalizedInsightsFlow(input);
}

// Mapping of game titles (as they appear in gameData) to Multiple Intelligences
const multipleIntelligencesMapping = {
  CANDY_FACTORY: 'Logical-Mathematical',
  PIECE_MAKING: 'Visual-Spatial',
  WATER_LILIES: 'Visual-Spatial',
  MOUSE_CHALLENGE: 'Bodily-Kinesthetic',
  WHACK_A_MOLE: 'Bodily-Kinesthetic', // Reaction Field
  WORDS_BIRDS: 'Linguistic-Verbal', // Corrected to match constants
  WORD_QUEST: 'Linguistic-Verbal', // Corrected to match constants
  MAHJONG: 'Visual-Spatial',
  CROSSROADS: 'Logical-Mathematical',
  JIGSAW_9: 'Visual-Spatial',
  FUEL_A_CAR: 'Logical-Mathematical', // and Bodily-Kinesthetic
  WINDOW_CLEANER: 'Visual-Spatial',
  SUDOKU_PUZZLE: 'Logical-Mathematical', // and Visual-Spatial
  RIVAL_ORBS: 'Logical-Mathematical',
  MATH_TWINS: 'Logical-Mathematical',
  MATH_SUBTRACTION: 'Logical-Mathematical',
  MATH_LINES: 'Logical-Mathematical',
  LANE_SPLITTER: 'Bodily-Kinesthetic',
  DRAGSTER_RACING: 'Bodily-Kinesthetic',
  TRAFFIC_MANAGER: 'Logical-Mathematical',
  TENNIS_BOMB: 'Bodily-Kinesthetic',
  TENNIS_TARGET: 'Bodily-Kinesthetic',
  TENNIS_BULLING: 'Bodily-Kinesthetic',
  TWIST_IT: 'Bodily-Kinesthetic',
  SNAKE: 'Logical-Mathematical',
  SIMON_SAYS: 'Musical',
  NAME_ME: 'Linguistic-Verbal',
  MIX_AND_MATCH: 'Visual-Spatial',
  SLICE_AND_DROP: 'Bodily-Kinesthetic',
  FRESHQUEEZE: 'Logical-Mathematical',
  STEADY_MOVES: 'Bodily-Kinesthetic',
  BEE_BALLOON: 'Visual-Spatial',
  BREAKOUT: 'Visual-Spatial', // Gem Breaker (and Bodily-Kinesthetic)
  BREAKOUT3D: 'Visual-Spatial',
  BLOCKBUILDER: 'Visual-Spatial',
  BLOCKOUT: 'Visual-Spatial',
  MANDALA: 'Visual-Spatial',
  CUT_THE_CAKE: 'Visual-Spatial',
  DIGITS: 'Logical-Mathematical',
  PENGUIN_MAZE: 'Visual-Spatial',
  PUZZLE_2D: 'Visual-Spatial',
  CANDY_LINE_UP: 'Visual-Spatial',
  SAVE_THE_FROG: 'Bodily-Kinesthetic',
  PUZZLE_3D: 'Visual-Spatial',
  ECHO_RACE: 'Musical',
  MELODY_MAYHEM: 'Musical',
  FIND_THE_PUP: 'Visual-Spatial',
  SCRAMBLED: 'Linguistic-Verbal',
  AUDIO_TENNIS: 'Musical',
  MATH_MADNESS: 'Logical-Mathematical',
  COLOR_FRENZY: 'Visual-Spatial',
  SPACE_RESCUE: 'Visual-Spatial',
  NEON_LIGHTS: 'Visual-Spatial',
  PIRATE_ISLAND: 'Visual-Spatial',
  NEURON_GRAPH: 'Logical-Mathematical',
  ANT_ESCAPE: 'Naturalistic', // Corrected to match constants
  CRAZY_FACTORY: 'Logical-Mathematical',
  SOLITAIRE: 'Intrapersonal', // Corrected to match constants
  ROBOT: 'Logical-Mathematical',
  CHESS: 'Logical-Mathematical', // This might be different from CHESS_PVP
  CHESS_PVP: 'Interpersonal', // Corrected to match constants
  // Note: Some game titles in gameData from `activities` use the raw ID (e.g. "WHACK_A_MOLE").
  // Ensure this mapping aligns with the `gameId` (which is the key in COGNITIVE_GAMES)
  // passed in `gameData` by `src/app/insights/page.tsx`.
};

// Define an internal schema for the prompt's input, including the pre-summarized data.
const PersonalizedInsightsPromptInputSchemaInternal = z.object({
  originalGameData: z.string().describe('The original stringified JSON game data, for context if needed by the LLM.'),
  summarizedGameDataString: z.string().describe('A pre-summarized string of game data, with games mapped to Multiple Intelligences.'),
});


const personalizedInsightsPrompt = ai.definePrompt({
  name: 'personalizedInsightsPrompt',
  input: {schema: PersonalizedInsightsPromptInputSchemaInternal}, // Use the internal schema
  output: {schema: PersonalizedInsightsOutputSchema},
  // Tools array is removed as summarizeGameData is no longer a tool here.
  prompt: `You are an AI expert in multiple intelligences. Analyze the user's game data and provide personalized insights and recommendations.

  The user has played several games. Here's a summary of their performance, with games mapped to the primary intelligence they assess:
  {{{summarizedGameDataString}}}

  Based on this summarized data (and the original game data if needed: {{{originalGameData}}}), generate personalized insights about the user's strengths and weaknesses across different intelligences.
  Then, provide recommendations on how the user can improve their skills in specific areas.
  The insights and recommendations should be clear, concise, and actionable.
  Focus on the patterns emerging from the summarized data.
  `,
});

const generatePersonalizedInsightsFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedInsightsFlow',
    inputSchema: PersonalizedInsightsInputSchema, // Flow still takes the original input
    outputSchema: PersonalizedInsightsOutputSchema,
  },
  async (flowInput: PersonalizedInsightsInput) => {
    // Perform the data summarization logic here (moved from the old tool)
    let summarizedGameDataString = "No game data found.";
    try {
      // The 'gameData' from PersonalizedInsightsInput is a stringified JSON array.
      // Each item in the array has { title: gameId, score: number, timestamp: string }
      const parsedRawGameData: Array<{title: string; score: number; timestamp: string}> = JSON.parse(flowInput.gameData);
      
      if (Array.isArray(parsedRawGameData) && parsedRawGameData.length > 0) {
        const gameSummaries = parsedRawGameData.map((game) => {
          // 'game.title' here is actually the gameId (e.g., "WHACK_A_MOLE", "JIGSAW_9")
          const intelligence = multipleIntelligencesMapping[game.title as keyof typeof multipleIntelligencesMapping] || 'General Cognitive Skill';
          return `Game ID: ${game.title}, Score: ${game.score}, Assessed Intelligence: ${intelligence}`;
        });
        summarizedGameDataString = `Game summaries: ${gameSummaries.join('; ')}`;
      }
    } catch (e) {
      console.error("Error parsing or summarizing gameData:", e);
      summarizedGameDataString = "Error processing game data for summarization.";
    }

    const promptInputArgs = {
      originalGameData: flowInput.gameData,
      summarizedGameDataString: summarizedGameDataString,
    };

    const {output} = await personalizedInsightsPrompt(promptInputArgs);
    return output!;
  }
);

