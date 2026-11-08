import { createOpenAI } from "@ai-sdk/openai";
import { createDataStreamResponse, streamText } from "ai";

export const maxDuration = 30;

const pollinations = createOpenAI({
  baseURL: "https://gen.pollinations.ai/v1",
  apiKey: process.env.POLLINATIONS_API_KEY,
  compatibility: "compatible",
});

// Matches "/image a cat in space" (also "/imagine ...")
const IMAGE_COMMAND = /^\/(?:image|imagine)\b\s*([\s\S]*)$/i;

type ChatMessage = {
  role: string;
  content?: unknown;
  parts?: unknown;
};

function messageText(message: ChatMessage | undefined): string {
  if (!message) return "";
  const pieces = Array.isArray(message.content)
    ? message.content
    : Array.isArray(message.parts)
      ? message.parts
      : null;
  if (pieces) {
    return pieces
      .map((p) =>
        p && typeof p === "object" && "text" in p ? String((p as { text: unknown }).text) : "",
      )
      .join("");
  }
  return typeof message.content === "string" ? message.content : "";
}

function textResponse(text: string) {
  const usage = { promptTokens: 0, completionTokens: 0 };
  return createDataStreamResponse({
    execute: (dataStream) => {
      dataStream.write(`0:${JSON.stringify(text)}\n`);
      dataStream.write(
        `e:${JSON.stringify({ finishReason: "stop", usage, isContinued: false })}\n`,
      );
      dataStream.write(`d:${JSON.stringify({ finishReason: "stop", usage })}\n`);
    },
  });
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  const last: ChatMessage | undefined = messages[messages.length - 1];
  if (last?.role === "user") {
    const match = messageText(last).trim().match(IMAGE_COMMAND);
    if (match) {
      const prompt = match[1].trim().slice(0, 500);
      if (!prompt) {
        return textResponse("Tell me what to draw, for example: `/image a cat in space`");
      }
      const seed = Math.floor(Math.random() * 1_000_000);
      const src = `/api/image?prompt=${encodeURIComponent(prompt).replace(/\(/g, "%28").replace(/\)/g, "%29")}&seed=${seed}`;
      const alt = prompt.replace(/[[\]\n]/g, " ");
      return textResponse(`![${alt}](${src})`);
    }
  }

  const result = streamText({
    model: pollinations.chat("openai-fast"),
    messages,
  });
  return result.toDataStreamResponse();
}
