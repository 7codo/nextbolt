import {
  MAX_RESPONSE_SEGMENTS,
  MAX_TOKENS,
} from "@/app/(root)/chat/_lib/.server/llm/constants";
import { CONTINUE_PROMPT } from "@/app/(root)/chat/_lib/.server/llm/prompts";
import {
  streamText,
  type StreamingOptions,
} from "@/app/(root)/chat/_lib/.server/llm/stream-text";
import SwitchableStream from "@/app/(root)/chat/_lib/.server/llm/switchable-stream";

export const POST = async (request: Request) => {
  const { messages } = await request.json();
  console.log("🚀 ~ POST ~ messages:", messages);

  const stream = new SwitchableStream();

  try {
    const options: StreamingOptions = {
      toolChoice: "none",
      onFinish: async ({ text: content, finishReason }) => {
        if (finishReason !== "length") {
          return stream.close();
        }

        if (stream.switches >= MAX_RESPONSE_SEGMENTS) {
          throw Error("Cannot continue message: Maximum segments reached");
        }

        const switchesLeft = MAX_RESPONSE_SEGMENTS - stream.switches;

        console.log(
          `Reached max token limit (${MAX_TOKENS}): Continuing message (${switchesLeft} switches left)`
        );

        messages.push({ role: "assistant", content });
        messages.push({ role: "user", content: CONTINUE_PROMPT });

        const result = await streamText(messages, options);

        return stream.switchSource(result.toAIStream());
      },
    };

    const result = await streamText(messages, options);

    stream.switchSource(result.toAIStream());

    return new Response(stream.readable, {
      status: 200,
      headers: {
        contentType: "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.log(error);

    throw new Response(null, {
      status: 500,
      statusText: "Internal Server Error",
    });
  }
};

/* Let's create a simple HTML file.

<boltArtifact id="simple-html-file" title="Simple HTML File">
  <boltAction type="file" filePath="index.html">
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Simple HTML File</title>
      </head>
      <body>
        <h1>Hello, World!</h1>
        <p>This is a simple HTML file.</p>
      </body>
    </html>
  </boltAction>
</boltArtifact> */
