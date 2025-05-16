
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
import { COGNITIVE_GAMES } from '@/lib/constants'; // Import COGNITIVE_GAMES

const PersonalizedInsightsInputSchema = z.object({
  gameData: z
    .string()
    .describe(
      'A stringified JSON object containing the user game data, including gameTitle, score, and timestamp.'
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

// Dynamically create mapping from COGNITIVE_GAMES
const gameTitleToIntelligenceMapping: Record<string, string | string[]> = {};
COGNITIVE_GAMES.forEach(game => {
  // For simplicity in this prompt, we'll just take the first assessed intelligence.
  // The main analysis flow handles multiple intelligences per game more robustly.
  gameTitleToIntelligenceMapping[game.title] = game.assessesIntelligences[0] || 'General Cognitive Skill';
});


// Define an internal schema for the prompt's input, including the pre-summarized data.
const PersonalizedInsightsPromptInputSchemaInternal = z.object({
  originalGameData: z.string().describe('The original stringified JSON game data, for context if needed by the LLM.'),
  summarizedGameDataString: z.string().describe('A pre-summarized string of game data, with games mapped to Multiple Intelligences based on their titles.'),
});


const personalizedInsightsPrompt = ai.definePrompt({
  name: 'personalizedInsightsPrompt',
  input: {schema: PersonalizedInsightsPromptInputSchemaInternal}, 
  output: {schema: PersonalizedInsightsOutputSchema},
  prompt: `You are an AI expert in multiple intelligences. Analyze the user's game data and provide personalized insights and recommendations.

  The user has played several games. Here's a summary of their performance, with games mapped to the primary intelligence they assess:
  {{{summarizedGameDataString}}}

  Based on this summarized data (and the original game data if needed for context: {{{originalGameData}}}), generate personalized insights about the user's strengths and weaknesses across different intelligences.
  Then, provide recommendations on how the user can improve their skills in specific areas.
  The insights and recommendations should be clear, concise, and actionable.
  Focus on the patterns emerging from the summarized data.
  `,
});

const generatePersonalizedInsightsFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedInsightsFlow',
    inputSchema: PersonalizedInsightsInputSchema, 
    outputSchema: PersonalizedInsightsOutputSchema,
  },
  async (flowInput: PersonalizedInsightsInput) => {
    let summarizedGameDataString = "No game data found.";
    try {
      // The 'gameData' from PersonalizedInsightsInput is a stringified JSON array.
      // Each item in the array has { gameTitle: string, score: number, timestamp: string }
      const parsedRawGameData: Array<{gameTitle: string; score: number; timestamp: string}> = JSON.parse(flowInput.gameData);
      
      if (Array.isArray(parsedRawGameData) && parsedRawGameData.length > 0) {
        const gameSummaries = parsedRawGameData.map((game) => {
          const intelligence = gameTitleToIntelligenceMapping[game.gameTitle] || 'General Cognitive Skill';
          return `Game Title: ${game.gameTitle}, Score: ${game.score}, Assessed Intelligence: ${intelligence}`;
        });
        summarizedGameDataString = `Game summaries: ${gameSummaries.join('; ')}`;
      }
    } catch (e) {
      console.error("Error parsing or summarizing gameData for personalized insights:", e);
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
