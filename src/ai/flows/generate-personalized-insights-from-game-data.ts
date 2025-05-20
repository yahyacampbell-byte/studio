
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
  intelligenceProfileData: z.string().optional().describe(
    'An optional stringified JSON array of the user\'s analyzed Multiple Intelligence scores and reasoning. Each item contains: {intelligence: string, score: number, reasoning: string}'
  ),
});
export type PersonalizedInsightsInput = z.infer<typeof PersonalizedInsightsInputSchema>;

const PersonalizedInsightsOutputSchema = z.object({
  multipleIntelligencesSummary: z.string().describe('Personalized insights based on Multiple Intelligences mapping from gameplay data. This summary should reflect any MI analysis already performed (e.g., by another AI agent that calculated MI scores based on rubrics).'),
  broaderCognitiveInsights: z.string().optional().describe('Additional observations on general cognitive abilities like attention, memory, processing speed, or executive functions, inferred from game performance. Phrased as observations and areas for potential self-awareness or development.'),
  actionableRecommendations: z.string().describe('Actionable recommendations for improvement or leveraging strengths, based on all insights. May include learning style suggestions.'),
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
        const intelligenceNames = game.assessesIntelligences.map(id => {
            const mi = MULTIPLE_INTELLIGENCES.find(m => m.id === id);
            return mi ? mi.name : id; 
        });
        return intelligenceNames.join(', ');
    }
    return 'General Cognitive Skill';
};

const PersonalizedInsightsPromptInputSchemaInternal = z.object({
  originalGameData: z.string().describe('The original stringified JSON game data, for context if needed by the LLM.'),
  summarizedGameDataString: z.string().describe('A pre-summarized string of game data, with games mapped to Multiple Intelligences based on their titles.'),
  intelligenceProfileString: z.string().optional().describe(
    'A string representing the user\'s analyzed Multiple Intelligence profile (scores and reasoning), if available. E.g., "Logical-Mathematical: 80/100 (Reasoning: Strong performance in Math Twins), Visual-Spatial: 60/100 (Reasoning: Good in Jigsaw 9), ..."'
  ),
});


const personalizedInsightsPrompt = ai.definePrompt({
  name: 'personalizedInsightsPrompt',
  model: 'googleai/gemini-2.5-pro', 
  input: {schema: PersonalizedInsightsPromptInputSchemaInternal}, 
  output: {schema: PersonalizedInsightsOutputSchema},
  prompt: `You are an AI expert in cognitive psychology and multiple intelligences, focused on providing general wellness insights.
Analyze the user's game performance summarized below.

Game Performance Summary (Game Title, Score, Assessed Intelligence(s)):
{{{summarizedGameDataString}}}

{{#if intelligenceProfileString}}
User's Current Multiple Intelligences Profile (Scores 0-100, with reasoning):
{{{intelligenceProfileString}}}
{{/if}}

Based on ALL available information (game summary AND MI profile if provided):

1.  **Multiple Intelligences Summary**: Provide personalized insights about the user's strengths and weaknesses across different Multiple Intelligences.
    {{#if intelligenceProfileString}}
    This summary should directly reflect the provided MI profile, highlighting dominant intelligences, areas that are less developed, and any notable patterns or reasoning from the MI scores.
    {{else}}
    Focus on the qualitative aspects and patterns emerging from the game performance relative to the assessed intelligences.
    {{/if}}

2.  **Broader Cognitive Insights (Optional)**:
    Based on the types of games played, general performance (scores), and the MI profile (if available), provide observations on general cognitive abilities. Phrase these as potential observations or areas that might warrant further exploration for self-awareness or general cognitive skill development. **Crucially, DO NOT make any medical diagnoses, suggest clinical conditions, or advise medical consultation. Stick to general cognitive function observations.**

    Consider these cognitive domains and how game performance (and MI scores if available) might relate. Synthesize information from multiple relevant games if possible:
    *   **Working Memory**: (e.g., performance in games like 'Math Twins', 'Digits', 'Candy Factory', 'Drive me crazy'). If scores in games requiring holding and manipulating information are consistently notable (high or low), this might offer general insights into working memory capacity as an area for self-awareness.
    *   **Processing Speed**: (e.g., performance in games like 'Reaction Field', 'Color Frenzy', 'Dragster Racing'). Consistent performance in timed reaction games might offer general insights into information processing efficiency.
    *   **Attention (Selective/Sustained)**: (e.g., performance in games like 'Reaction Field', 'Traffic Manager', 'Words Birds'). Consistent performance in games demanding focus could provide general observations about attention skills.
    *   **Executive Function (Planning, Strategy, Problem-Solving, Cognitive Flexibility)**: (e.g., performance in games like 'Sudoku', 'Chess', 'Solitaire', 'Ant Escape', 'Crossroads', 'Cube Foundry'). Consistent performance patterns in strategy or puzzle games might relate to executive functions.
    *   **Visuospatial Skills**: (e.g., performance in games like 'Jigsaw 9', 'Penguin Explorer', 'Star Architect', '3D Art Puzzle'). Consistent performance here might offer general insights into spatial reasoning abilities.
    *   **Verbal Abilities**: (e.g., performance in games like 'Words Birds', 'Scrambled', 'Visual Crossword'). Consistent performance could provide general observations related to vocabulary or verbal processing.
    *   **Motor Skills**: (e.g., performance in games like 'Reaction Field', 'Tennis Bomb', 'Twist It', 'Perfect Tension', 'Tennis Bowling'). Consistent patterns here might relate to general hand-eye coordination or fine motor control.

    Frame observations carefully and supportively, for example:
    "Consistent performance patterns across games like 'Reaction Field' and 'Color Frenzy' might offer general insights into your responsiveness, which could be an interesting area for personal exploration."
    "If performance across several strategy games like 'Chess' and 'Solitaire' shows consistent patterns, this could point towards general strengths or areas for development in planning and problem-solving approaches."
    "Observing performance across games like 'Jigsaw 9' and 'Star Architect' can offer general insights into visuospatial processing skills."
    "If you notice particular trends in games primarily testing working memory, such as 'Digits' or 'Math Twins', this might highlight that cognitive area as one for further self-awareness or practice."
    {{#if intelligenceProfileString}}
    Connect these observations to the MI profile where appropriate (e.g., "Your strong Visual-Spatial score aligns with your performance in 'Jigsaw 9'.")
    {{/if}}

    Your observations should be framed as potential areas for self-awareness or general cognitive skill development. Do not output risk percentages, specific clinical correlations, or direct medical advice.

3.  **Actionable Recommendations**: Offer clear, concise, and actionable recommendations. These should aim to help the user improve their cognitive skills, leverage their strengths, or explore areas for cognitive development based on ALL the insights generated (MI summary, broader cognitive insights, and the MI profile scores if provided). 
    Consider suggesting learning styles or approaches based on the user's apparent stronger intelligences from the MI profile (if available) or inferred from game performance. For example:
    *   If Linguistic-Verbal intelligence seems prominent (e.g., from good performance in 'Words Birds', 'Scrambled', 'Word Quest'), you might suggest learning methods that involve reading, writing, storytelling, or verbal discussions.
    *   If Logical-Mathematical intelligence appears strong (e.g., from 'Math Twins', 'Sudoku', 'Fuel a Car'), suggest activities that involve problem-solving, puzzles, or logical sequencing.
    *   If Visual-Spatial intelligence is a highlight (e.g., from 'Jigsaw 9', '3D Art Puzzle', 'Star Architect'), recommend using diagrams, mind maps, or visual aids for learning.
    *   If Bodily-Kinesthetic abilities stand out (e.g., from 'Reaction Field', 'Tennis Bomb', 'Twist It'), suggest hands-on activities, learning by doing, or physical movement.
    *   If Musical intelligence is strong (e.g., from 'Melody Mayhem', 'Melodic Tennis'), recommend using rhythm, music, or mnemonics involving tunes.
    *   If Interpersonal strengths are shown (e.g., in 'Chess', 'Traffic Manager'), suggest group study, discussions, or teaching others.
    *   If Intrapersonal intelligence is evident (e.g., from 'Solitaire', 'Synaptix'), recommend self-reflection, journaling, or setting personal goals.
    *   If Naturalistic intelligence seems developed (e.g., from 'Ant Escape', 'Water Lilies'), suggest learning in natural settings or making connections to the real world.
    Keep recommendations general and focused on cognitive exercises or learning strategies.

IMPORTANT: When mentioning specific games in your output, please use their full titles as provided in the summary (e.g., 'Math Twins', 'Jigsaw 9'). Do NOT use API keys or abbreviations.
Structure your response according to the output schema, ensuring all required fields are populated.
Focus on patterns emerging from the summarized data and the provided MI profile.
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

    let intelligenceProfileString: string | undefined = undefined;
    if (flowInput.intelligenceProfileData) {
      try {
        const parsedMIApiData: Array<{intelligence: string; score: number; reasoning?: string}> = JSON.parse(flowInput.intelligenceProfileData);
        if (Array.isArray(parsedMIApiData) && parsedMIApiData.length > 0) {
          intelligenceProfileString = parsedMIApiData.map(
            item => `${item.intelligence}: ${item.score}/100${item.reasoning ? ` (Reasoning: ${item.reasoning})` : ''}`
          ).join('; ');
        }
      } catch (e) {
        console.error("Error parsing intelligenceProfileData for personalized insights:", e);
        // If parsing fails, intelligenceProfileString remains undefined, and the prompt handles it.
      }
    }

    const promptInputArgs: z.infer<typeof PersonalizedInsightsPromptInputSchemaInternal> = {
      originalGameData: flowInput.gameData,
      summarizedGameDataString: summarizedGameDataString,
      intelligenceProfileString: intelligenceProfileString,
    };

    const {output} = await personalizedInsightsPrompt(promptInputArgs);
    
    return {
        multipleIntelligencesSummary: output?.multipleIntelligencesSummary || "Could not generate a summary for Multiple Intelligences.",
        broaderCognitiveInsights: output?.broaderCognitiveInsights, // This can be undefined/null if AI doesn't generate it
        actionableRecommendations: output?.actionableRecommendations || "Play more games and analyze your activity to receive personalized recommendations.",
    };
  }
);

