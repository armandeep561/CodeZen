'use server';

/**
 * @fileOverview A code completion AI agent.
 *
 * - aiCodeHints - A function that provides code hints based on the given code context.
 * - AiCodeHintsInput - The input type for the aiCodeHints function.
 * - AiCodeHintsOutput - The return type for the aiCodeHints function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiCodeHintsInputSchema = z.object({
  language: z.string().describe('The programming language of the code.'),
  codeContext: z.string().describe('The current code snippet the user is typing.'),
});
export type AiCodeHintsInput = z.infer<typeof AiCodeHintsInputSchema>;

const AiCodeHintsOutputSchema = z.object({
  hint: z.string().describe('The code hint or suggestion.'),
});
export type AiCodeHintsOutput = z.infer<typeof AiCodeHintsOutputSchema>;

export async function aiCodeHints(input: AiCodeHintsInput): Promise<AiCodeHintsOutput> {
  return aiCodeHintsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiCodeHintsPrompt',
  input: {schema: AiCodeHintsInputSchema},
  output: {schema: AiCodeHintsOutputSchema},
  prompt: `You are a code completion assistant. You will provide a code hint based on the code context and language.

  Language: {{{language}}}
  Code Context: {{{codeContext}}}

  Provide a single, concise code hint that would likely be the next syntactically correct code to be typed. Do not provide any explanation, only code.`,
});

const aiCodeHintsFlow = ai.defineFlow(
  {
    name: 'aiCodeHintsFlow',
    inputSchema: AiCodeHintsInputSchema,
    outputSchema: AiCodeHintsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
