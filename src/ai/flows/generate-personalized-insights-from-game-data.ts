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
import { COGNITIVE_GAMES, MULTIPLE_INTELLIGENCES } from '@/lib/constants'; 
import type { IntelligenceId } from '@/lib/types';

const PersonalizedInsightsInputSchema = z.object({
  gameData: z
    .string()
    .describe(
      'A stringified JSON object containing the user game data, including gameTitle, score, and timestamp.'
    ),
});
export type PersonalizedInsightsInput = z.infer<typeof PersonalizedInsightsInputSchema>;

const PersonalizedInsightsOutputSchema = z.object({
  multipleIntelligencesSummary: z.string().describe('Personalized insights based on Multiple Intelligences mapping from gameplay data. This summary should reflect any MI analysis already performed (e.g., by another AI agent that calculated MI scores based on rubrics).'),
  broaderCognitiveInsights: z.string().optional().describe('Additional observations on general cognitive abilities like attention, memory, processing speed, or executive functions, inferred from game performance. Phrased as observations and areas for potential self-awareness or development.'),
  actionableRecommendations: z.string().describe('Actionable recommendations for improvement or leveraging strengths, based on all insights.'),
});
export type PersonalizedInsightsOutput = z.infer<typeof PersonalizedInsightsOutputSchema>;

export async function generatePersonalizedInsights(
  input: PersonalizedInsightsInput
): Promise<PersonalizedInsightsOutput> {
  return generatePersonalizedInsightsFlow(input);
}

// Helper to get assessed intelligences for a game title
const getAssessedIntelligencesForGame = (gameTitle: string): string => {
    const game = COGNITIVE_GAMES.find(g => g.title === gameTitle);
    if (game && game.assessesIntelligences.length > 0) {
        return game.assessesIntelligences.join(', ');
    }
    return 'General Cognitive Skill';
};

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

1.  **Multiple Intelligences Summary**: Provide personalized insights about the user's strengths and weaknesses across different Multiple Intelligences. This summary should be consistent with any quantitative MI scores that might have been previously calculated (though those scores themselves are not part of this input). Focus on the qualitative aspects and patterns emerging from the game performance relative to the assessed intelligences.

2.  **Broader Cognitive Insights (Optional)**:
    Based on the types of games played and the general performance (scores), provide observations on general cognitive abilities. Phrase these as potential observations or areas that might warrant further exploration for self-awareness or general cognitive skill development. **Crucially, DO NOT make any medical diagnoses, suggest clinical conditions, or advise medical consultation. Stick to general cognitive function observations.**

    Consider these cognitive domains and how game performance might relate:
    *   **Working Memory**: (e.g., 'Math Twins', 'Digits', 'Candy Factory', 'Simon Says' / 'Drive me crazy'). If scores in games requiring holding and manipulating information are consistently high, this might suggest strong working memory capacity. Consistently low scores could indicate this as an area for general cognitive exercise.
    *   **Processing Speed**: (e.g., 'Reaction Field', 'Color Frenzy', 'Dragster Racing'). High performance in timed reaction games might suggest efficient information processing. Slower performance could indicate an area for practice in rapid responding.
    *   **Attention (Selective/Sustained)**: (e.g., 'Reaction Field' / 'Whack-a-Mole', 'Traffic Manager', 'Words Birds'). Strong performance in games demanding focus could indicate good attention skills. If scores are inconsistent or low in such games, sustained focus might be an area to work on.
    *   **Executive Function (Planning, Strategy, Problem-Solving, Cognitive Flexibility)**: (e.g., 'Sudoku', 'Chess', 'Solitaire', 'Ant Escape', 'Crossroads', 'Cube Foundry'). High scores in strategy or puzzle games might reflect strong executive functions. Difficulty might suggest these skills could be enhanced with practice.
    *   **Visuospatial Skills**: (e.g., 'Jigsaw 9', 'Penguin Explorer', 'Star Architect', '3D Art Puzzle'). Strong performance here might indicate good spatial reasoning. Lower scores could point to this as an area for development.
    *   **Verbal Abilities**: (e.g., 'Words Birds', 'Scrambled', 'Visual Crossword' / 'Name Me'). High performance could indicate strong vocabulary or verbal processing. Lower scores might suggest an area for language skill enhancement.

    Frame observations carefully, for example:
    "Consistent high scores in games like 'Reaction Field' and 'Color Frenzy' might suggest quick mental processing and response capabilities."
    "If performance across several strategy games like 'Chess' and 'Solitaire' is strong, this could point to well-developed planning and executive function skills."
    "Difficulty in games primarily testing working memory, such as 'Digits' or 'Math Twins', might indicate that this cognitive area could benefit from targeted exercises."
    "Observing performance across games like 'Jigsaw 9' and 'Star Architect' can offer general insights into visuospatial processing skills."

3.  **Actionable Recommendations**: Offer clear, concise, and actionable recommendations. These should aim to help the user improve their cognitive skills, leverage their strengths, or explore areas for cognitive development based on ALL the insights generated (both MI summary and broader cognitive insights). Keep recommendations general and focused on cognitive exercises or learning strategies.

IMPORTANT: When mentioning specific games in your output, please use their full titles as provided in the summary (e.g., 'Math Twins', 'Jigsaw 9'). Do NOT use API keys or abbreviations.
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
          const assessedIntelligences = getAssessedIntelligencesForGame(game.gameTitle);
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
    
    return {
        multipleIntelligencesSummary: output?.multipleIntelligencesSummary || "Could not generate a summary for Multiple Intelligences.",
        broaderCognitiveInsights: output?.broaderCognitiveInsights,
        actionableRecommendations: output?.actionableRecommendations || "Play more games and analyze your activity to receive personalized recommendations.",
    };
  }
);

