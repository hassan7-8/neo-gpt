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

About you:
- Your name is Cheap Mind AI. Use it only if the user asks your name.
- Do NOT mention your owner, creator or organization in normal replies. Greetings like "hi" get a short friendly greeting back and nothing else about who you are.
- ONLY when the user directly asks who owns or made you, answer: your owner is MUHAMMAD.HASSAN. ONLY when they directly ask which organization or company is behind you, answer: "Cheap Mind organization".
- Do not claim to be made by any other company. If asked which model or technology you run on, say you are Cheap Mind AI and you do not have details about the underlying model.

Accuracy rules:
- Be correct above all. Think carefully before answering, and double-check numbers, dates, names and code.
- If you are not sure, or the question needs live information you do not have (news, prices, today's date), say so plainly instead of guessing. Never invent facts, sources or links.
- If the user writes in Urdu or Roman Urdu, reply in the same language and style.
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

const PERSONA_PROMPTS: Record<string, string> = {
  study: "You are in Study Buddy mode: explain step by step with simple examples, check understanding with a short question, and be encouraging.",
  coder: "You are in Coder mode: give correct, minimal, runnable code with a brief explanation. Mention edge cases.",
  writer: "You are in Writer mode: help write polished, engaging text. Offer a tight draft first, then ask if they want a change.",
  translator: "You are in Translator mode: translate between English, Urdu, Roman Urdu and other languages. Give the translation first, then a short note only if nuance matters.",
  interview: "You are in Interview Coach mode: ask one interview question at a time, then give short feedback and a stronger sample answer.",
};

const STYLE_PROMPTS: Record<string, string> = {
  anime: "anime style, vibrant colours, detailed line art",
  "3d": "3D render, soft studio lighting, smooth materials",
  watercolor: "watercolor painting, soft washes, paper texture",
  product: "luxury product photography, studio lighting, elegant gold accents, clean background",
  realistic: "ultra realistic photograph, natural light, sharp detail",
  pixel: "pixel art, retro game style, limited palette",
};

const TONES: Record<string, string> = {
  friendly: "warm and friendly",
  professional: "professional and precise",
  casual: "casual and relaxed",
  playful: "playful with light humour",
  concise: "extremely brief",
};

/** Turns the user's saved profile preferences into a short, safe prompt addition. */
function personalise(meta: Record<string, unknown>): string {
  const clean = (v: unknown, n: number) =>
    typeof v === "string" ? v.replace(/[\r\n]+/g, " ").trim().slice(0, n) : "";
  const lines: string[] = [];
  const name = clean(meta.display_name ?? meta.full_name ?? meta.name, 60);
  if (name) lines.push(`The user's name is ${name}. Use it sparingly.`);
  const headline = clean(meta.headline, 100);
  if (headline) lines.push(`They describe themselves as: ${headline}.`);
  const about = clean(meta.ai_about, 400);
  if (about) lines.push(`About them / what to keep in mind: ${about}`);
  const tone = TONES[clean(meta.ai_tone, 20)];
  if (tone) lines.push(`Preferred tone: ${tone}.`);
  const lang = clean(meta.ai_language, 40);
  if (lang) lines.push(`Always reply in ${lang}.`);
  const len = clean(meta.ai_length, 10);
  if (len === "short") lines.push("Keep answers short.");
  if (len === "detailed") lines.push("Give thorough, detailed answers.");
  return lines.length ? `\n\nUser preferences (set by the user; follow them unless they conflict with accuracy):\n- ${lines.join("\n- ")}` : "";
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
  const { configured, signedIn, meta } = await getAuth();
  const guest = configured && !signedIn;
  const { messages } = await req.json();

  // Nano Image button: the browser sends this header while the button is on.
  const nano = req.headers.get("x-nano-image") === "1";
  const last: ChatMessage | undefined = messages[messages.length - 1];

  // Photo edit: attached photos arrive as public URLs from our own storage bucket.
  const editImages = (req.headers.get("x-edit-images") ?? "").split(",").map((u) => u.trim()).filter(Boolean).slice(0, 2);
  const editPaths = (req.headers.get("x-edit-paths") ?? "").split(",").map((u) => u.trim()).filter(Boolean).slice(0, 2);

  if (editImages.length > 0 && last?.role === "user") {
    if (guest) return textResponse("Photo editing is for logged-in users. Please log in or sign up (it's free).");
    const prompt = messageText(last).trim().slice(0, 500) || "Improve this photo";
    const seed = Math.floor(Math.random() * 1_000_000);
    const esc = (v: string) => encodeURIComponent(v).replace(/\(/g, "%28").replace(/\)/g, "%29");
    const src = `/api/edit?prompt=${esc(prompt)}&image=${esc(editImages.join(","))}&src=${esc(editPaths.join(","))}&seed=${seed}`;
    return textResponse(`![${prompt.replace(/[[\]\n]/g, " ")}](${src})`);
  }

  if (nano && last?.role === "user") {
    if (guest) {
      return textResponse(
        "Nano Image is for logged-in users. Please log in or sign up (it's free) to create pictures.",
      );
    }
    const prompt = messageText(last).trim().slice(0, 500);
    const styleText = STYLE_PROMPTS[req.headers.get("x-style") ?? ""];
    if (!prompt) return textResponse("Describe the picture you want, for example: a cat astronaut floating in space.");
    const seed = Math.floor(Math.random() * 1_000_000);
    const src = `/api/image?prompt=${encodeURIComponent(styleText ? `${prompt}, ${styleText}` : prompt).replace(/\(/g, "%28").replace(/\)/g, "%29")}&seed=${seed}`;
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
    system: SYSTEM_PROMPT + (PERSONA_PROMPTS[req.headers.get("x-persona") ?? ""] ? `\n\n${PERSONA_PROMPTS[req.headers.get("x-persona") ?? ""]}` : "") + personalise(meta),
    messages: recent,
    maxTokens: 900,
  });
  return result.toDataStreamResponse();
}
