'use server';

import { aiCodeHints } from '@/ai/flows/ai-code-hints';
import type { AiCodeHintsInput } from '@/ai/flows/ai-code-hints';

export async function getAiHint(input: AiCodeHintsInput): Promise<string> {
  try {
    const result = await aiCodeHints(input);
    return result.hint;
  } catch (error) {
    console.error('Error getting AI hint:', error);
    // Return a user-friendly error message
    return 'Could not retrieve AI hint at this time. Please try again later.';
  }
}
