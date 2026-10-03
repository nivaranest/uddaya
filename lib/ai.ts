import "server-only";
import { z } from "zod";

/**
 * LLM access for Uddaya's AI features (PRD §9.2) via any OpenAI-compatible
 * chat-completions endpoint. All calls run server-side only; the API key never
 * reaches the browser.
 *
 * Env: AI_API_KEY, AI_BASE_URL (default https://api.scalemax.pro/token/v1), AI_MODEL.
 */

export const AI_MODEL = process.env.AI_MODEL || "gpt-5.6-luna";
const BASE_URL = (process.env.AI_BASE_URL || "https://api.scalemax.pro/token/v1").replace(/\/$/, "");

export class AIUnavailableError extends Error {}

export function isAIConfigured(): boolean {
  return !!process.env.AI_API_KEY;
}

type StructuredRequest<T extends z.ZodType> = {
  system: string;
  prompt: string;
  schema: T;
  effort?: "low" | "medium" | "high";
};

/** One chat-completion call that returns JSON validated against `schema`. */
export async function structuredCompletion<T extends z.ZodType>({
  system,
  prompt,
  schema,
}: StructuredRequest<T>): Promise<z.infer<T>> {
  if (!isAIConfigured()) throw new AIUnavailableError("AI_API_KEY is not set");

  const jsonSchema = z.toJSONSchema(schema);
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          {
            role: "system",
            content: `${system}\n\nRespond with only a JSON object matching this JSON Schema:\n${JSON.stringify(jsonSchema)}`,
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });
  } catch (e) {
    throw new AIUnavailableError(`AI request failed: ${(e as Error).message}`);
  }
  if (!res.ok) throw new AIUnavailableError(`AI request failed (HTTP ${res.status})`);

  const data = await res.json();
  const choice = data?.choices?.[0];
  const text: string | undefined = choice?.message?.content;
  if (!text) throw new AIUnavailableError(`No output (finish_reason: ${choice?.finish_reason})`);

  // Tolerate code fences around the JSON.
  const json = text.replace(/^\s*```(?:json)?\s*|\s*```\s*$/g, "");
  const parsed = schema.safeParse(JSON.parse(json));
  if (!parsed.success) throw new AIUnavailableError("Model output did not match the expected schema");
  return parsed.data;
}
