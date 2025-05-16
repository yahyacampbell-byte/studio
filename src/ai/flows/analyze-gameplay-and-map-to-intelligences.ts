
'use server';

/**
 * @fileOverview Analyzes gameplay data and maps it to the 8 Multiple Intelligences using a detailed scoring rubric.
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
  score: z.number().min(0).max(100).describe('A score representing the strength in this intelligence (0-100).'),
  reasoning: z.string().describe('Reasoning for the intelligence score based on the gameplay data and rubric.'),
});

const AnalyzeGameplayOutputSchema = z.object({
  intelligenceMappings: z.array(IntelligenceMappingSchema).describe('An array of intelligence mappings with scores (0-100) and reasoning.'),
});

export type AnalyzeGameplayOutput = z.infer<typeof AnalyzeGameplayOutputSchema>;


export async function analyzeGameplayAndMapToIntelligences(input: AnalyzeGameplayInput): Promise<AnalyzeGameplayOutput> {
  return analyzeGameplayAndMapToIntelligencesFlow(input);
}

const EIGHT_MULTIPLE_INTELLIGENCES = [
  'Logical-Mathematical',
  'Visual-Spatial',
  'Bodily-Kinesthetic',
  'Linguistic-Verbal',
  'Musical',
  'Interpersonal',
  'Intrapersonal',
  'Naturalistic',
];

const summarizeGameplayPrompt = ai.definePrompt({
  name: 'summarizeGameplayPrompt',
  input: {schema: AnalyzeGameplayInputSchema},
  output: {schema: AnalyzeGameplayOutputSchema},
  prompt: `You are an expert AI specializing in cognitive assessment and Multiple Intelligences theory.
Your task is to analyze the provided gameplay data and map the user's performance to the 8 Multiple Intelligences.
Use the detailed scoring rubric below to convert raw game scores into a normalized 0-10 point scale for the relevant intelligence(s) for each game.
Then, calculate a composite 0-10 score for each of the 8 Multiple Intelligences by averaging scores from all relevant games.
Finally, scale this composite 0-10 score to 0-100 for the output JSON. Provide clear reasoning for each intelligence's score.

The 8 Multiple Intelligences to assess are:
${EIGHT_MULTIPLE_INTELLIGENCES.map(intelligence => `- ${intelligence}`).join('\n')}

Gameplay Data Provided:
{{#each gameplayData}}
- Game Title: {{gameTitle}}, Raw Score: {{score}}, Duration: {{activityDuration}} seconds
{{/each}}

SCORING RUBRIC AND GAME MAPPING:
Interpret the "Raw Score" from the input data for each game and map it to a 0-10 point scale based on the rubrics below.
If a game is "hybrid," it contributes to two intelligences; score it for both.

**Profiling Games (Primary Assessment):**

1.  **Game: Math Madness**
    *   Assesses: Logical-Mathematical Intelligence
    *   Rubric (0-10 points for Logical-Mathematical):
        *   10 pts: 90–100% correct answers (or very high raw score if not percentage-based), rapid responses (e.g., low activityDuration relative to typical play if score doesn't reflect speed).
        *   7 pts: 70–89% correct (or good raw score), moderate speed.
        *   4 pts: 50–69% correct (or fair raw score), slow responses.
        *   0 pts: Below 50% correct (or low raw score).
    *   Mapping Raw Score: If 'Raw Score' looks like a percentage (0-100), use that. If it's a larger number (e.g., >500), assume higher is better and map it to these tiers.

2.  **Game: Jigsaw 9**
    *   Assesses: Visual-Spatial Intelligence
    *   Rubric (0-10 points for Visual-Spatial):
        *   10 pts: Completes hardest puzzles quickly (e.g., high raw score suggesting complexity, or low activityDuration for a complex puzzle).
        *   7 pts: Completes medium puzzles with few mistakes (good raw score).
        *   4 pts: Struggles with assembly but finishes easy puzzles (fair raw score).
        *   0 pts: Cannot complete simplest puzzles (low raw score).
    *   Mapping Raw Score: Assume higher raw score means more complex/faster completion.

3.  **Game: Reaction Field** (Original name: WHACK_A_MOLE)
    *   Assesses: Bodily-Kinesthetic Intelligence
    *   Rubric (0-10 points for Bodily-Kinesthetic):
        *   10 pts: >90% accuracy (or very high raw score if score reflects accuracy), fastest reaction tier.
        *   7 pts: 75–89% accuracy (good raw score), moderate speed.
        *   4 pts: 50–74% accuracy (fair raw score), slow reactions.
        *   0 pts: Below 50% accuracy (low raw score).
    *   Mapping Raw Score: Assume raw score reflects accuracy and/or reaction speed. Higher is better.

4.  **Game: Words Birds**
    *   Assesses: Linguistic-Verbal Intelligence
    *   Rubric (0-10 points for Linguistic-Verbal):
        *   10 pts: Recognizes 95–100% of words (or very high raw score), fastest tier.
        *   7 pts: 80–94% correct (good raw score), minor delays.
        *   4 pts: 60–79% correct (fair raw score), frequent pauses.
        *   0 pts: Below 60% correct (low raw score).
    *   Mapping Raw Score: Assume raw score reflects accuracy/vocabulary size.

5.  **Game: Melody Mayhem**
    *   Assesses: Musical Intelligence
    *   Rubric (0-10 points for Musical):
        *   10 pts: Perfect rhythm/tone matching, no mistakes (very high raw score).
        *   7 pts: Occasional errors but recovers quickly (good raw score).
        *   4 pts: Struggles to match beats/pitches (fair raw score).
        *   0 pts: No meaningful engagement (low raw score).
    *   Mapping Raw Score: Assume raw score reflects accuracy in rhythm/tone.

6.  **Game: Chess PvP**
    *   Assesses: Interpersonal Intelligence (primary), also touches on Logical-Mathematical. For this analysis, focus on Interpersonal.
    *   Rubric (0-10 points for Interpersonal):
        *   10 pts: Wins consistently (high raw score if score reflects wins/ranking).
        *   7 pts: Balanced win/loss ratio (good raw score).
        *   4 pts: Loses often but shows basic understanding (fair raw score).
        *   0 pts: No strategic play evident (low raw score).
    *   Mapping Raw Score: Assume raw score correlates with success/strategy.

7.  **Game: Solitaire**
    *   Assesses: Intrapersonal Intelligence (primary), also Logical-Mathematical. Focus on Intrapersonal.
    *   Rubric (0-10 points for Intrapersonal):
        *   10 pts: Completes >80% of games, efficient moves (high raw score if score reflects completion/efficiency).
        *   7 pts: Completes 50–79% (good raw score).
        *   4 pts: Rarely completes games (fair raw score).
        *   0 pts: No completion, frustrated/quits early (low raw score).
    *   Mapping Raw Score: Assume raw score reflects completion rate/efficiency.

8.  **Game: Ant Escape**
    *   Assesses: Naturalistic Intelligence
    *   Rubric (0-10 points for Naturalistic):
        *   10 pts: Solves complex paths quickly, adapts to obstacles (high raw score).
        *   7 pts: Completes levels with minor struggles (good raw score).
        *   4 pts: Needs hints/repeats for simple levels (fair raw score).
        *   0 pts: No progress without help (low raw score).
    *   Mapping Raw Score: Assume raw score reflects problem-solving efficiency in the game's context.

**Enhancement Games (Hybrid - Contribute to Multiple Intelligences):**

9.  **Game: Sudoku** (Original ID: SUDOKU_PUZZLE)
    *   Assesses: Logical-Mathematical AND Visual-Spatial Intelligence
    *   Logical-Mathematical Rubric (0-10 points):
        *   10 pts: Solves "hard" puzzles quickly (e.g., high raw score on difficult setting).
        *   7 pts: Solves "medium" puzzles with 1–2 mistakes (good raw score).
        *   4 pts: Only completes "easy" puzzles (fair raw score).
    *   Visual-Spatial Rubric (0-10 points):
        *   10 pts: Uses grid symmetry/patterns intuitively.
        *   7 pts: Needs occasional number-tracking aids.
        *   4 pts: Struggles to visualize number placement.
    *   Mapping Raw Score: Interpret raw score for difficulty/speed for Logical. For Spatial, consider if score implies pattern recognition (this might be harder to infer, so lean on logical score or give moderate spatial score if logical is high).

10. **Game: Gem Breaker** (Original ID: BREAKOUT)
    *   Assesses: Visual-Spatial AND Bodily-Kinesthetic Intelligence
    *   Visual-Spatial Rubric (0-10 points):
        *   10 pts: Predicts ball trajectories perfectly (high raw score, few misses).
        *   7 pts: Occasionally misses angles (good raw score).
    *   Bodily-Kinesthetic Rubric (0-10 points):
        *   10 pts: Flawless paddle control, fast reactions (high raw score related to control/hits).
        *   7 pts: Late adjustments but recovers (good raw score).
    *   Mapping Raw Score: Higher scores imply better trajectory prediction (Spatial) and paddle control (Kinesthetic).

11. **Game: Fuel a Car**
    *   Assesses: Logical-Mathematical AND Bodily-Kinesthetic Intelligence
    *   Logical-Mathematical Rubric (0-10 points):
        *   10 pts: Optimizes fuel use/path perfectly (high raw score if reflects efficiency).
        *   7 pts: Minor miscalculations but finishes (good raw score).
    *   Bodily-Kinesthetic Rubric (0-10 points):
        *   10 pts: Smooth steering, no crashes (high raw score if reflects control).
        *   7 pts: Jerky movements but recovers (good raw score).
    *   Mapping Raw Score: Higher scores reflect better planning (Logical) and control (Kinesthetic).

12. **Game: Word Quest**
    *   Assesses: Linguistic-Verbal AND Logical-Mathematical Intelligence
    *   Linguistic-Verbal Rubric (0-10 points):
        *   10 pts: Solves complex word puzzles rapidly (high raw score if reflects vocabulary/speed).
        *   7 pts: Needs hints for obscure words (good raw score).
    *   Logical-Mathematical Rubric (0-10 points):
        *   10 pts: Deduces word patterns (e.g., anagrams) instantly.
        *   7 pts: Slow but correct logic.
    *   Mapping Raw Score: Higher scores imply strong vocabulary/recognition (Linguistic) and pattern deduction (Logical).

**Calculation Steps:**
1.  For each game played in the input \\\`gameplayData\\\`:
    a.  Identify the game from the list above based on \\\`gameTitle\\\`.
    b.  Using the corresponding rubric(s), convert the \\\`Raw Score\\\` to a 0-10 point score for the assessed intelligence(s). If \\\`activityDuration\\\` is relevant to the rubric (e.g. speed), consider it.
    c.  Store these 0-10 point scores temporarily, associated with the intelligence(s) they measure.

2.  For each of the 8 Multiple Intelligences:
    a.  Collect all 0-10 point scores assigned to this intelligence from all games played.
    b.  If multiple scores exist for an intelligence, calculate their average. This is the composite 0-10 score.
    c.  If no games contributing to an intelligence were played, assign a 0-10 score of 0.
    d.  Convert this composite 0-10 score to a 0-100 scale (e.g., multiply by 10). This is the final \\\`score\\\` for the output.
    e.  Provide a concise \\\`reasoning\\\` for this score, mentioning the contributing games and the user's general performance in them based on the rubrics. For example: "Achieved a strong score in Logical-Mathematical, driven by high performance in Math Madness (mapped to 9/10) and good problem-solving in Sudoku (Logical aspect mapped to 8/10)."

**Output Format:**
Produce a JSON object matching the \\\`AnalyzeGameplayOutputSchema\\\`. Ensure each of the 8 intelligences is present in the \\\`intelligenceMappings\\\` array with a score from 0-100 and reasoning.

Example for Reasoning: "User shows strong Visual-Spatial skills (80/100) based on quick completion of Jigsaw 9 (rated 8/10) and good trajectory prediction in Gem Breaker (Spatial aspect rated 8/10)."

Make sure game titles in your internal mapping logic (e.g., "Reaction Field" for "WHACK_A_MOLE") match the \\\`gameTitle\\\` field from the input. I have used the titles as they appear in the \\\`COGNITIVE_GAMES\\\` constant in the application: "Math Madness", "Jigsaw 9", "Reaction Field", "Words Birds", "Melody Mayhem", "Chess PvP", "Solitaire", "Ant Escape", "Sudoku", "Gem Breaker", "Fuel a Car", "Word Quest".
  `,
});

const analyzeGameplayAndMapToIntelligencesFlow = ai.defineFlow(
  {
    name: 'analyzeGameplayAndMapToIntelligencesFlow',
    inputSchema: AnalyzeGameplayInputSchema,
    outputSchema: AnalyzeGameplayOutputSchema,
  },
  async input => {
    // Check if there's any gameplay data. If not, return a default response.
    if (!input.gameplayData || input.gameplayData.length === 0) {
      const defaultMappings = EIGHT_MULTIPLE_INTELLIGENCES.map(intelligenceName => ({
        intelligence: intelligenceName,
        score: 0,
        reasoning: "No gameplay data provided for analysis.",
      }));
      return { intelligenceMappings: defaultMappings };
    }

    const {output} = await summarizeGameplayPrompt(input);
    
    // Ensure output is not null and all intelligences are present
    if (output && output.intelligenceMappings) {
      const presentIntelligences = new Set(output.intelligenceMappings.map(im => im.intelligence));
      for (const expectedIntelligence of EIGHT_MULTIPLE_INTELLIGENCES) {
        if (!presentIntelligences.has(expectedIntelligence)) {
          output.intelligenceMappings.push({
            intelligence: expectedIntelligence,
            score: 0,
            reasoning: `No games assessing ${expectedIntelligence} were found in the provided data, or performance could not be determined.`,
          });
        }
      }
      // Sort by the defined order of intelligences for consistency
      output.intelligenceMappings.sort((a, b) => {
        return EIGHT_MULTIPLE_INTELLIGENCES.indexOf(a.intelligence) - EIGHT_MULTIPLE_INTELLIGENCES.indexOf(b.intelligence);
      });

      return output;
    }
    
    // Fallback if AI output is malformed or null
    const fallbackMappings = EIGHT_MULTIPLE_INTELLIGENCES.map(intelligenceName => ({
        intelligence: intelligenceName,
        score: 0,
        reasoning: "AI analysis could not be completed or returned an unexpected result.",
      }));
    return { intelligenceMappings: fallbackMappings };
  }
);

