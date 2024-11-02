import { streamText } from "@/app/(root)/chat/_lib/.server/llm/stream-text";
import { stripIndents } from "@/app/(root)/chat/_lib/utils/stripIndent";
import { StreamingTextResponse, parseStreamPart } from "ai";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const POST = async (request: Request) => {
  const { message } = await request.json();

  try {
    const result = await streamText([
      {
        role: "user",
        content: stripIndents`
          I want you to improve the user prompt that is wrapped in \`<original_prompt>\` tags.

          IMPORTANT: Only respond with the improved prompt and nothing else!

          <original_prompt>
            ${message}
          </original_prompt>
        `,
      },
    ]);

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const processedChunk = decoder
          .decode(chunk)
          .split("\n")
          .filter((line) => line !== "")
          .map(parseStreamPart)
          .map((part) => part.value)
          .join("");

        controller.enqueue(encoder.encode(processedChunk));
      },
    });

    const transformedStream = result.toAIStream().pipeThrough(transformStream);

    return new StreamingTextResponse(transformedStream);
  } catch (error) {
    console.log(error);

    throw new Response(null, {
      status: 500,
      statusText: "Internal Server Error",
    });
  }
};
