import { createOpenAI } from "@ai-sdk/openai";
import { createDataStreamResponse, streamText } from "ai";
import { getAuth } from "@/lib/supabase/get-user";
import { guestLimited, GUEST_MESSAGE_LIMIT } from "@/lib/guest-limit";

// Edge runtime starts faster than a regular serverless function.
export const runtime = "edge";
export const maxDuration = 30;

const pollinations = createOpenAI({
  baseURL: "https://gen.pollinations.ai/v1",
  apiKey: process.env.POLLINATIONS_API_KEY,
  compatibility: "compatible",
});

const SYSTEM_PROMPT = `You are Cheap Mind AI, a friendly, fast and refined AI assistant.

Facts about you (always answer these exactly):
- Your name is Cheap Mind AI.
- Your owner and creator is MUHAMMAD.HASSAN.
- You belong to the Cheap Mind organization. If anyone asks which organization or company is behind you, answer: "Cheap Mind organization".
- If someone asks who made you or who owns you, answer that your owner is MUHAMMAD.HASSAN of the Cheap Mind organization.
- Do not claim to be made by any other company. If asked which model or technology you run on, say you are Cheap Mind AI and you do not have details about the underlying model.

Accuracy rules:
- Be correct above all. Think carefully before answering, and double-check numbers, dates, names and code.
- If you are not sure, or the question needs live information you do not have (news, prices, today's date), say so plainly instead of guessing. Never invent facts, sources or links.
- Answer exactly what was asked. If the question is unclear, ask one short clarifying question.

Style: be warm, clear and concise. Lead with the answer, then add only the detail that helps. Keep replies short unless the user asks for more. Reply in the user's language.`;

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

// Simple chat goes to the fastest model. Longer or harder questions (code, maths,
// analysis, long prompts) go to the more accurate balanced model.
const HARD_QUESTION =
  /```|\b(code|debug|error|bug|function|algorithm|prove|calculate|solve|equation|math|derive|analy[sz]e|compare|essay|explain why|step[- ]by[- ]step|translate|summari[sz]e)\b/i;

function pickModel(lastUserText: string) {
  const hard = lastUserText.length > 180 || HARD_QUESTION.test(lastUserText);
  return pollinations.chat(hard ? "openai" : "openai-fast");
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
  const { configured, signedIn } = await getAuth();
  const guest = configured && !signedIn;
  const { messages } = await req.json();

  // Nano Image button: the browser sends this header while the button is on.
  const nano = req.headers.get("x-nano-image") === "1";
  const last: ChatMessage | undefined = messages[messages.length - 1];

  if (nano && last?.role === "user") {
    if (guest) {
      return textResponse(
        "Nano Image is for logged-in users. Please log in or sign up (it's free) to create pictures.",
      );
    }
    const prompt = messageText(last).trim().slice(0, 500);
    if (!prompt) return textResponse("Describe the picture you want, for example: a cat astronaut floating in space.");
    const seed = Math.floor(Math.random() * 1_000_000);
    const src = `/api/image?prompt=${encodeURIComponent(prompt).replace(/\(/g, "%28").replace(/\)/g, "%29")}&seed=${seed}`;
    const alt = prompt.replace(/[[\]\n]/g, " ");
    return textResponse(`![${alt}](${src})`);
  }

  if (guest && guestLimited(req)) {
    return textResponse(
      `You've used your ${GUEST_MESSAGE_LIMIT} free guest messages for now. Please log in or sign up (it's free) to keep chatting.`,
    );
  }

  // Sending only the recent turns keeps the prompt small, which makes replies start faster.
  const recent = messages.slice(-12);

  const result = streamText({
    model: pickModel(messageText(last)),
    system: SYSTEM_PROMPT,
    messages: recent,
    maxTokens: 900,
  });
  return result.toDataStreamResponse();
}
