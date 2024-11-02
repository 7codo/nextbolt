import { createOpenAI } from '@ai-sdk/openai';

export function getAnthropicModel(apiKey: string) {
  const openai = createOpenAI({
    apiKey,
  });

  return openai('ft:gpt-4o-2024-08-06:personal:code-v6:ANmd7Rsy');
}
