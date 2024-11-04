import { createOpenAI } from "@ai-sdk/openai";

export function getAnthropicModel(apiKey: string) {
  const openai = createOpenAI({
    apiKey,
  });

  return openai("ft:gpt-4o-mini-2024-07-18:personal:code-v1:APRXMQ76");
}
