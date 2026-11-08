import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

export const maxDuration = 30;

const pollinations = createOpenAI({
  baseURL: "https://gen.pollinations.ai/v1",
  apiKey: process.env.POLLINATIONS_API_KEY,
  compatibility: "compatible",
});

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = streamText({
    model: pollinations.chat("openai-fast"),
    messages,
  });
  return result.toDataStreamResponse();
}
