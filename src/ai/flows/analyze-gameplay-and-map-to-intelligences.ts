
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
import { COGNITIVE_GAMES } from '@/lib/constants'; // To get all game titles

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

const ALL_GAME_TITLES_FOR_PROMPT = COGNITIVE_GAMES.map(game => game.title).join(", ");

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

**Profiling Games (Primary Assessment - these are the core games for initial profiling):**

1.  **Game: Math Twins** (ID: MATH_TWINS)
    *   Description: Matching game pairing equivalent mathematical expressions. Uses adaptive difficulty to train both basic math skills and working memory under cognitive load.
    *   Assesses: Logical-Mathematical Intelligence
    *   Rubric (0-10 points for Logical-Mathematical):
        *   10 pts: 90–100% correct answers (or very high raw score if not percentage-based), rapid responses (e.g., low activityDuration relative to typical play if score doesn't reflect speed).
        *   7 pts: 70–89% correct (or good raw score), moderate speed.
        *   4 pts: 50–69% correct (or fair raw score), slow responses.
        *   0 pts: Below 50% correct (or low raw score).
    *   Mapping Raw Score: If 'Raw Score' looks like a percentage (0-100), use that. If it's a larger number (e.g., >500), assume higher is better and map it to these tiers.

2.  **Game: Jigsaw 9** (ID: JIGSAW_9)
    *   Description: Digital jigsaw puzzle with rotatable pieces and adjustable difficulty. Trains mental rotation skills by requiring players to manipulate puzzle pieces in both 2D and 3D space.
    *   Assesses: Visual-Spatial Intelligence
    *   Rubric (0-10 points for Visual-Spatial):
        *   10 pts: Completes hardest puzzles quickly (e.g., high raw score suggesting complexity, or low activityDuration for a complex puzzle).
        *   7 pts: Completes medium puzzles with few mistakes (good raw score).
        *   4 pts: Struggles with assembly but finishes easy puzzles (fair raw score).
        *   0 pts: Cannot complete simplest puzzles (low raw score).
    *   Mapping Raw Score: Assume higher raw score means more complex/faster completion.

3.  **Game: Reaction Field** (ID: WHACK_A_MOLE)
    *   Description: Timed target-hitting game testing reflexes and hand-eye coordination. Measures and improves visual-motor reaction time with millisecond precision.
    *   Assesses: Bodily-Kinesthetic Intelligence
    *   Rubric (0-10 points for Bodily-Kinesthetic):
        *   10 pts: >90% accuracy (or very high raw score if score reflects accuracy), fastest reaction tier.
        *   7 pts: 75–89% accuracy (good raw score), moderate speed.
        *   4 pts: 50–74% accuracy (fair raw score), slow reactions.
        *   0 pts: Below 50% accuracy (low raw score).
    *   Mapping Raw Score: Assume raw score reflects accuracy and/or reaction speed. Higher is better.

4.  **Game: Words Birds** (ID: WORDS_BIRDS)
    *   Description: Word recognition challenge where players identify flying words before they disappear. Specifically targets rapid word recognition under time pressure, training both visual word processing and lexical access speed.
    *   Assesses: Linguistic-Verbal Intelligence
    *   Rubric (0-10 points for Linguistic-Verbal):
        *   10 pts: Recognizes 95–100% of words (or very high raw score), fastest tier.
        *   7 pts: 80–94% correct (good raw score), minor delays.
        *   4 pts: 60–79% correct (fair raw score), frequent pauses.
        *   0 pts: Below 60% correct (low raw score).
    *   Mapping Raw Score: Assume raw score reflects accuracy/vocabulary size.

5.  **Game: Melody Mayhem** (ID: MELODY_MAYHEM)
    *   Description: Rhythm matching game where players replicate musical patterns. Trains both rhythm perception and auditory working memory through layered musical patterns.
    *   Assesses: Musical Intelligence
    *   Rubric (0-10 points for Musical):
        *   10 pts: Perfect rhythm/tone matching, no mistakes (very high raw score).
        *   7 pts: Occasional errors but recovers quickly (good raw score).
        *   4 pts: Struggles to match beats/pitches (fair raw score).
        *   0 pts: No meaningful engagement (low raw score).
    *   Mapping Raw Score: Assume raw score reflects accuracy in rhythm/tone.

6.  **Game: Chess** (ID: CHESS_PVP)
    *   Description: Strategic board game played against opponents or AI. Specifically trains perspective-taking and anticipatory social cognition through move prediction.
    *   Assesses: Interpersonal Intelligence (primary), also touches on Logical-Mathematical. For this analysis, focus on Interpersonal.
    *   Rubric (0-10 points for Interpersonal):
        *   10 pts: Wins consistently (high raw score if score reflects wins/ranking).
        *   7 pts: Balanced win/loss ratio (good raw score).
        *   4 pts: Loses often but shows basic understanding (fair raw score).
        *   0 pts: No strategic play evident (low raw score).
    *   Mapping Raw Score: Assume raw score correlates with success/strategy.

7.  **Game: Solitaire** (ID: SOLITAIRE)
    *   Description: Classic card organization game played individually. Trains executive function through continuous self-assessment and strategy adjustment.
    *   Assesses: Intrapersonal Intelligence (primary), also Logical-Mathematical. Focus on Intrapersonal.
    *   Rubric (0-10 points for Intrapersonal):
        *   10 pts: Completes >80% of games, efficient moves (high raw score if score reflects completion/efficiency).
        *   7 pts: Completes 50–79% (good raw score).
        *   4 pts: Rarely completes games (fair raw score).
        *   0 pts: No completion, frustrated/quits early (low raw score).
    *   Mapping Raw Score: Assume raw score reflects completion rate/efficiency.

8.  **Game: Ant Escape** (ID: ANT_ESCAPE)
    *   Description: Navigation challenge through environmental obstacles, focusing on adaptive planning.
    *   Assesses: Naturalistic Intelligence
    *   Rubric (0-10 points for Naturalistic):
        *   10 pts: Solves complex paths quickly, adapts to obstacles (high raw score).
        *   7 pts: Completes levels with minor struggles (good raw score).
        *   4 pts: Needs hints/repeats for simple levels (fair raw score).
        *   0 pts: No progress without help (low raw score).
    *   Mapping Raw Score: Assume raw score reflects problem-solving efficiency in the game's context.

**Enhancement Games (Hybrid - Contribute to Multiple Intelligences - these help refine the profile):**

9.  **Game: Crossroads** (ID: CROSSROADS)
    *   Description: Traffic management simulation requiring strategic lane allocation. Enhances logical reasoning and spatial planning.
    *   Assesses: Logical-Mathematical AND Visual-Spatial Intelligence (Also touches Interpersonal)
    *   Logical-Mathematical Rubric (0-10 points):
        *   10 pts: Solves complex traffic scenarios efficiently (e.g., high raw score on difficult setting).
        *   7 pts: Solves medium scenarios with 1–2 minor incidents (good raw score).
        *   4 pts: Only completes simple scenarios (fair raw score).
    *   Visual-Spatial Rubric (0-10 points):
        *   10 pts: Uses spatial layout and flow patterns intuitively.
        *   7 pts: Needs occasional aids for anticipating congestion.
        *   4 pts: Struggles to visualize traffic flow and make optimal choices.
    *   Mapping Raw Score: Interpret raw score for efficiency/complexity for Logical. For Spatial, consider if score implies good spatial management (this might be harder to infer, so lean on logical score or give moderate spatial score if logical is high).

10. **Game: Butterfly Hunter** (ID: WINDOW_CLEANER)
    *   Description: Tracking game where players capture moving targets across a grid. Improves hand-eye coordination and visual tracking.
    *   Assesses: Visual-Spatial AND Bodily-Kinesthetic Intelligence
    *   Visual-Spatial Rubric (0-10 points):
        *   10 pts: Predicts target trajectories perfectly (high raw score, few misses).
        *   7 pts: Occasionally misses targets (good raw score).
    *   Bodily-Kinesthetic Rubric (0-10 points):
        *   10 pts: Flawless target acquisition, fast reactions (high raw score related to control/hits).
        *   7 pts: Late adjustments but recovers (good raw score).
    *   Mapping Raw Score: Higher scores imply better trajectory prediction (Spatial) and capture control (Kinesthetic).

11. **Game: Lane Changer** (ID: LANE_SPLITTER)
    *   Description: Driving simulation requiring rapid lane switching decisions. Tests problem-solving and reaction speed.
    *   Assesses: Bodily-Kinesthetic AND Visual-Spatial Intelligence (Also touches Logical-Mathematical)
    *   Bodily-Kinesthetic Rubric (0-10 points):
        *   10 pts: Smooth steering, no crashes, quick lane changes (high raw score if reflects control).
        *   7 pts: Jerky movements but recovers, some hesitation (good raw score).
    *   Visual-Spatial Rubric (0-10 points):
        *   10 pts: Anticipates traffic patterns and open lanes perfectly.
        *   7 pts: Minor misjudgments of space or speed but generally safe.
    *   Mapping Raw Score: Higher scores reflect better vehicle control (Kinesthetic) and spatial awareness/anticipation (Visual-Spatial).

12. **Game: Word Quest** (ID: WORD_QUEST)
    *   Description: Word search puzzle requiring players to find hidden terms in letter grids. Enhances vocabulary and logical deduction.
    *   Assesses: Linguistic-Verbal AND Logical-Mathematical Intelligence
    *   Linguistic-Verbal Rubric (0-10 points):
        *   10 pts: Solves complex word puzzles rapidly (high raw score if reflects vocabulary/speed).
        *   7 pts: Needs hints for obscure words (good raw score).
    *   Logical-Mathematical Rubric (0-10 points):
        *   10 pts: Deduces word patterns (e.g., anagrams, themes) instantly.
        *   7 pts: Slow but correct logic.
    *   Mapping Raw Score: Higher scores imply strong vocabulary/recognition (Linguistic) and pattern deduction (Logical).

**Other Games:**
For any other games played from the available list (e.g., ${ALL_GAME_TITLES_FOR_PROMPT}), if they are not one of the 12 detailed above, try to map their performance to the most relevant intelligence(s) based on their description and the general principles of the rubrics. Assign a general score (e.g., 5/10 if average, 7-8/10 if good, 2-3/10 if poor) if a specific rubric isn't available for them, and note this in the reasoning.

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
    e.  Provide a concise \\\`reasoning\\\` for this score, mentioning the contributing games and the user's general performance in them based on the rubrics. For example: "Achieved a strong score in Logical-Mathematical, driven by high performance in Math Twins (mapped to 9/10) and good problem-solving in Crossroads (Logical aspect mapped to 8/10)."

**Output Format:**
Produce a JSON object matching the \\\`AnalyzeGameplayOutputSchema\\\`. Ensure each of the 8 intelligences is present in the \\\`intelligenceMappings\\\` array with a score from 0-100 and reasoning.

Example for Reasoning: "User shows strong Visual-Spatial skills (80/100) based on quick completion of Jigsaw 9 (rated 8/10) and good trajectory prediction in Butterfly Hunter (Spatial aspect rated 8/10)."

Make sure game titles in your internal mapping logic match the \\\`gameTitle\\\` field from the input. I have used the titles as they appear in the application constants: e.g., ${ALL_GAME_TITLES_FOR_PROMPT}.
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
