import { NextResponse } from "next/server";
import type { z } from "zod";

/** Parse and validate a JSON request body; returns a 400 response on failure. */
export async function readBody<T extends z.ZodType>(
  req: Request,
  schema: T,
): Promise<{ data: z.infer<T> } | { error: NextResponse }> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return { error: NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }) };
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return { error: NextResponse.json({ error: "Invalid request", issues: parsed.error.issues }, { status: 400 }) };
  }
  return { data: parsed.data };
}
