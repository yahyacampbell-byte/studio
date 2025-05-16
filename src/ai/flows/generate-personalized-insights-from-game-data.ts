
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
import { COGNITIVE_GAMES } from '@/lib/constants'; 

const PersonalizedInsightsInputSchema = z.object({
  gameData: z
    .string()
    .describe(
      'A stringified JSON object containing the user game data, including gameTitle, score, and timestamp.'
    ),
});
export type PersonalizedInsightsInput = z.infer<typeof PersonalizedInsightsInputSchema>;

const PersonalizedInsightsOutputSchema = z.object({
  multipleIntelligencesSummary: z.string().describe('Personalized insights based on Multiple Intelligences mapping from gameplay data.'),
  broaderCognitiveInsights: z.string().optional().describe('Additional insights on general cognitive abilities like attention, memory, or processing speed, inferred from game performance. Phrased as observations.'),
  actionableRecommendations: z.string().describe('Actionable recommendations for improvement based on all insights.'),
});
export type PersonalizedInsightsOutput = z.infer<typeof PersonalizedInsightsOutputSchema>;

export async function generatePersonalizedInsights(
  input: PersonalizedInsightsInput
): Promise<PersonalizedInsightsOutput> {
  return generatePersonalizedInsightsFlow(input);
}

const gameTitleToIntelligenceMapping: Record<string, string | string[]> = {};
COGNITIVE_GAMES.forEach(game => {
  gameTitleToIntelligenceMapping[game.title] = game.assessesIntelligences.join(', ') || 'General Cognitive Skill';
});


const PersonalizedInsightsPromptInputSchemaInternal = z.object({
  originalGameData: z.string().describe('The original stringified JSON game data, for context if needed by the LLM.'),
  summarizedGameDataString: z.string().describe('A pre-summarized string of game data, with games mapped to Multiple Intelligences based on their titles.'),
});


const personalizedInsightsPrompt = ai.definePrompt({
  name: 'personalizedInsightsPrompt',
  input: {schema: PersonalizedInsightsPromptInputSchemaInternal}, 
  output: {schema: PersonalizedInsightsOutputSchema},
  prompt: `You are an AI expert in cognitive psychology and multiple intelligences.
Analyze the user's game data summarized below.

Game Performance Summary (Game Title, Score, Assessed Intelligence(s)):
{{{summarizedGameDataString}}}

Based on this summary (and the original game data if needed for context: {{{originalGameData}}}):

1.  **Multiple Intelligences Summary**: Provide personalized insights about the user's strengths and weaknesses across different Multiple Intelligences, drawing connections between their game performance and the intelligences assessed.
2.  **Broader Cognitive Insights (Optional)**: If discernible from the types of games played and scores achieved, provide observations on general cognitive abilities such as attention, memory, processing speed, or executive functions. Phrase these as potential observations or areas that might warrant further exploration. For example, "Consistent high scores in games requiring quick decisions might suggest strong processing speed." or "If performance varies in games demanding sustained focus, this could be an area to monitor for attention patterns."
3.  **Actionable Recommendations**: Offer clear, concise, and actionable recommendations. These should aim to help the user improve their skills, leverage their strengths, or explore areas for cognitive development based on ALL the insights generated.

IMPORTANT: When mentioning specific games in your output, please use their full titles as provided in the summary (e.g., 'Math Madness', 'Jigsaw 9'). Do NOT use API keys or abbreviations.
Structure your response according to the output schema, ensuring all required fields are populated.
Focus on patterns emerging from the summarized data.
`,
});

const generatePersonalizedInsightsFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedInsightsFlow',
    inputSchema: PersonalizedInsightsInputSchema, 
    outputSchema: PersonalizedInsightsOutputSchema,
  },
  async (flowInput: PersonalizedInsightsInput) => {
    let summarizedGameDataString = "No game data found for summarization.";
    try {
      const parsedRawGameData: Array<{gameTitle: string; score: number; timestamp: string}> = JSON.parse(flowInput.gameData);
      
      if (Array.isArray(parsedRawGameData) && parsedRawGameData.length > 0) {
        const gameSummaries = parsedRawGameData.map((game) => {
          const assessedIntelligences = gameTitleToIntelligenceMapping[game.gameTitle] || 'General Cognitive Skill';
          return `Game: ${game.gameTitle}, Score: ${game.score}, Assesses: ${assessedIntelligences}`;
        });
        summarizedGameDataString = `${gameSummaries.join('; ')}.`;
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
    
    // Ensure a fallback if AI doesn't provide optional fields
    return {
        multipleIntelligencesSummary: output?.multipleIntelligencesSummary || "Could not generate a summary for Multiple Intelligences.",
        broaderCognitiveInsights: output?.broaderCognitiveInsights, // Optional, so can be undefined
        actionableRecommendations: output?.actionableRecommendations || "Play more games to receive personalized recommendations.",
    };
  }
);
