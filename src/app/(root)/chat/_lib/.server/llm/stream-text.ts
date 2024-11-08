import { streamText as _streamText, convertToCoreMessages } from "ai";
import { getAPIKey } from "@/app/(root)/chat/_lib/.server/llm/api-key";
import { getAnthropicModel } from "@/app/(root)/chat/_lib/.server/llm/model";
import { MAX_TOKENS } from "./constants";
import { getSystemPrompt } from "./prompts";

interface ToolResult<Name extends string, Args, Result> {
  toolCallId: string;
  toolName: Name;
  args: Args;
  result: Result;
  state: "result";
}

interface Message {
  role: "user" | "assistant";
  content: string;
  toolInvocations?: ToolResult<string, unknown, unknown>[];
}

export type Messages = Message[];

export type StreamingOptions = Omit<Parameters<typeof _streamText>[0], "model">;

export function streamText(messages: Messages, options?: StreamingOptions) {
  return _streamText({
    model: getAnthropicModel(getAPIKey()),
    system: getSystemPrompt(),
    maxTokens: MAX_TOKENS,
    messages: convertToCoreMessages(messages),
    ...options,
  });
}
