import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { z } from "zod";

/**
 * Claude API access for Uddaya's AI features (PRD §9.2). All calls run
 * server-side only; the API key never reaches the browser.
 */

export const CLAUDE_MODEL = "claude-opus-5-5";

export class AIUnavailableError extends Error {}

let client: Anthropic | null = null;

export function isAIConfigured(): boolean {
  return !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

function getClient(): Anthropic {
  if (!isAIConfigured()) throw new AIUnavailableError("ANTHROPIC_API_KEY is not set");
  client ??= new Anthropic();
  return client;
}

type StructuredRequest<T extends z.ZodType> = {
  system: string;
  prompt: string;
  schema: T;
  effort?: "low" | "medium" | "high";
};

/**
 * One Claude call that returns JSON validated against `schema`.
 * Uses structured outputs, and server-side fallbacks so a safety-classifier
 * decline is retried on Anthropic's recommended fallback model.
 */
export async function structuredCompletion<T extends z.ZodType>({
  system,
  prompt,
  schema,
  effort = "medium",
}: StructuredRequest<T>): Promise<z.infer<T>> {
  const response = await getClient().beta.messages.parse({
    model: CLAUDE_MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system,
    messages: [{ role: "user", content: prompt }],
    output_config: { effort, format: betaZodOutputFormat(schema) },
  });

  if (response.stop_reason === "refusal") {
    throw new AIUnavailableError("The request was declined by the model");
  }
  if (response.parsed_output == null) {
    throw new AIUnavailableError(`No structured output (stop_reason: ${response.stop_reason})`);
  }
  return response.parsed_output as z.infer<T>;
}
