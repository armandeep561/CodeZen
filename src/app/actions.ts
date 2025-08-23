'use server';

import { executeCode } from '@/ai/flows/execute-code-flow';
import type { ExecuteCodeInput } from '@/ai/flows/execute-code-flow';

export async function runCode(input: ExecuteCodeInput): Promise<string> {
  try {
    const result = await executeCode(input);
    return result.output;
  } catch (error) {
    console.error('Error executing code:', error);
    return 'Could not execute code at this time. Please try again later.';
  }
}
