'use server';

/**
 * @fileOverview Analyzes gameplay data and maps it to the 8 Multiple Intelligences.
 *
 * - analyzeGameplayAndMapToIntelligences - A function that analyzes gameplay data and maps it to the 8 Multiple Intelligences.
 * - AnalyzeGameplayInput - The input type for the analyzeGameplayAndMapToIntelligences function.
 * - AnalyzeGameplayOutput - The return type for the analyzeGameplayAndMapToIntelligences function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeGameplayInputSchema = z.object({
  gameplayData: z.array(
    z.object({
      gameTitle: z.string().describe('The title of the game played.'),
      score: z.number().describe('The score achieved in the game.'),
      activityDuration: z.number().describe('The duration of the game activity in seconds.'),
    })
  ).describe('An array of gameplay data for different cognitive games.'),
});
export type AnalyzeGameplayInput = z.infer<typeof AnalyzeGameplayInputSchema>;

const IntelligenceMappingSchema = z.object({
  intelligence: z.string().describe('The name of the multiple intelligence.'),
  score: z.number().describe('A score representing the strength in this intelligence.'),
  reasoning: z.string().describe('Reasoning for the intelligence score based on the gameplay data.'),
});

const AnalyzeGameplayOutputSchema = z.object({
  intelligenceMappings: z.array(IntelligenceMappingSchema).describe('An array of intelligence mappings with scores and reasoning.'),
});

export type AnalyzeGameplayOutput = z.infer<typeof AnalyzeGameplayOutputSchema>;


export async function analyzeGameplayAndMapToIntelligences(input: AnalyzeGameplayInput): Promise<AnalyzeGameplayOutput> {
  return analyzeGameplayAndMapToIntelligencesFlow(input);
}

const multipleIntelligences = [
  'Visual-Spatial',
  'Linguistic-Verbal',
  'Logical-Mathematical',
  'Bodily-Kinesthetic',
  'Musical',
  'Interpersonal',
  'Intrapersonal',
  'Naturalistic',
];

const summarizeGameplayPrompt = ai.definePrompt({
  name: 'summarizeGameplayPrompt',
  input: {schema: AnalyzeGameplayInputSchema},
  output: {schema: AnalyzeGameplayOutputSchema},
  prompt: `You are an expert in analyzing gameplay data from cognitive games and mapping it to the 8 Multiple Intelligences.

  Analyze the following gameplay data to determine the user's strengths and weaknesses across the different intelligences.

  Gameplay Data:
  {{#each gameplayData}}
  - Game: {{gameTitle}}, Score: {{score}}, Duration: {{activityDuration}} seconds
  {{/each}}

  Based on the gameplay data, map the user's performance to the following Multiple Intelligences:
  ${multipleIntelligences.map(intelligence => `- ${intelligence}`).join('\n')}

  Provide a score (0-100) and reasoning for each intelligence based on the gameplay data. Higher scores indicate greater strength in that intelligence.

  Output should be in JSON format:
  {
    "intelligenceMappings": [
      {
        "intelligence": "Intelligence Name",
        "score": Score (0-100),
        "reasoning": "Reasoning for the score based on the gameplay data."
      }
    ]
  }
  `,
});

const analyzeGameplayAndMapToIntelligencesFlow = ai.defineFlow(
  {
    name: 'analyzeGameplayAndMapToIntelligencesFlow',
    inputSchema: AnalyzeGameplayInputSchema,
    outputSchema: AnalyzeGameplayOutputSchema,
  },
  async input => {
    const {output} = await summarizeGameplayPrompt(input);
    return output!;
  }
);
