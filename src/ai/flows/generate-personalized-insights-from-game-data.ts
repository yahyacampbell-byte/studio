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

const multipleIntelligencesMapping = {
  CANDY_FACTORY: 'Logical-Mathematical',
  PIECE_MAKING: 'Visual-Spatial',
  WATER_LILIES: 'Visual-Spatial',
  MOUSE_CHALLENGE: 'Bodily-Kinesthetic',
  WHACK_A_MOLE: 'Bodily-Kinesthetic',
  WORDS_BIRDS: 'Linguistic',
  WORD_QUEST: 'Linguistic',
  MAHJONG: 'Visual-Spatial',
  CROSSROADS: 'Logical-Mathematical',
  JIGSAW_9: 'Visual-Spatial',
  FUEL_A_CAR: 'Logical-Mathematical',
  WINDOW_CLEANER: 'Visual-Spatial',
  SUDOKU_PUZZLE: 'Logical-Mathematical',
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
  NAME_ME: 'Linguistic',
  MIX_AND_MATCH: 'Visual-Spatial',
  SLICE_AND_DROP: 'Bodily-Kinesthetic',
  FRESHQUEEZE: 'Logical-Mathematical',
  STEADY_MOVES: 'Bodily-Kinesthetic',
  BEE_BALLOON: 'Visual-Spatial',
  BREAKOUT: 'Visual-Spatial',
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
  SCRAMBLED: 'Linguistic',
  AUDIO_TENNIS: 'Musical',
  MATH_MADNESS: 'Logical-Mathematical',
  COLOR_FRENZY: 'Visual-Spatial',
  SPACE_RESCUE: 'Visual-Spatial',
  NEON_LIGHTS: 'Visual-Spatial',
  PIRATE_ISLAND: 'Visual-Spatial',
  NEURON_GRAPH: 'Logical-Mathematical',
  ANT_ESCAPE: 'Logical-Mathematical',
  CRAZY_FACTORY: 'Logical-Mathematical',
  SOLITAIRE: 'Logical-Mathematical',
  ROBOT: 'Logical-Mathematical',
  CHESS: 'Logical-Mathematical',
  CHESS_PVP: 'Logical-Mathematical',
};

const summarizeGameData = ai.defineTool({
  name: 'summarizeGameData',
  description: 'Summarizes user gameplay data, mapping games to Multiple Intelligences.',
  inputSchema: z.object({
    gameData: z
      .string()
      .describe(
        'A stringified JSON array containing the user game data, including game title, score, and timestamp.'
      ),
  }),
  outputSchema: z.string(),
},
async input => {
  const gameData = JSON.parse(input.gameData);

  const gameSummaries = gameData.map((game: {title: string; score: number}) => {
    const intelligence = multipleIntelligencesMapping[game.title as keyof typeof multipleIntelligencesMapping] || 'Unknown';
    return `Game: ${game.title}, Score: ${game.score}, Intelligence: ${intelligence}`;
  });

  return `Game summaries: ${gameSummaries.join('; ')}`;
});

const personalizedInsightsPrompt = ai.definePrompt({
  name: 'personalizedInsightsPrompt',
  input: {schema: PersonalizedInsightsInputSchema},
  output: {schema: PersonalizedInsightsOutputSchema},
  tools: [summarizeGameData],
  prompt: `You are an AI expert in multiple intelligences. Analyze the user's game data and provide personalized insights and recommendations.

  Summarized Game Data: {{ summarizeGameData gameData=gameData }}.

  Based on this data, generate personalized insights about the user's strengths and weaknesses across different intelligences.
  Then, provide recommendations on how the user can improve their skills in specific areas.
  The insights and recommendations should be clear, concise, and actionable.
  `,
});

const generatePersonalizedInsightsFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedInsightsFlow',
    inputSchema: PersonalizedInsightsInputSchema,
    outputSchema: PersonalizedInsightsOutputSchema,
  },
  async input => {
    const {output} = await personalizedInsightsPrompt(input);
    return output!;
  }
);
