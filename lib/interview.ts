import { z } from "zod";

// Scores are clamped to 0–10 after parsing (withOverall) rather than with
// schema bounds, which structured outputs does not enforce.
export const InterviewFeedbackSchema = z.object({
  clarity: z.number(),
  depth: z.number(),
  communication: z.number(),
  feedback: z.string(),
  strength: z.string(),
  improvements: z.array(z.string()),
});

export type InterviewFeedback = z.infer<typeof InterviewFeedbackSchema>;

export type GradedAnswer = InterviewFeedback & { overall: number; source: "claude" | "heuristic" };

const clamp = (n: number) => Math.max(0, Math.min(10, Number.isFinite(n) ? n : 0));

export function withOverall(f: InterviewFeedback, source: GradedAnswer["source"]): GradedAnswer {
  const clarity = clamp(f.clarity);
  const depth = clamp(f.depth);
  const communication = clamp(f.communication);
  return {
    ...f,
    clarity,
    depth,
    communication,
    overall: Math.round(((clarity + depth + communication) / 3) * 10) / 10,
    source,
  };
}

/**
 * Offline grader used when the Claude API is not configured or unavailable.
 * Deliberately simple: rewards length, concrete detail (numbers, named tech)
 * and structure. It is a stand-in, not an evaluation of quality.
 */
export function heuristicFeedback(answer: string): GradedAnswer {
  const text = answer.trim();
  const words = text.split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 3).length;
  const hasNumbers = /\d/.test(text);
  const techTerms = (text.match(/\b(api|aws|python|sql|postgres|redis|kafka|cache|queue|latency|scal\w*|test\w*|deploy\w*|monitor\w*)\b/gi) ?? []).length;
  const hasExample = /\b(for example|for instance|when i|at my|we (built|shipped|migrated|reduced))\b/i.test(text);

  const lengthScore = Math.min(10, words.length / 12);
  const clarity = clamp(Math.round((3 + Math.min(sentences, 5) + (words.length > 25 ? 2 : 0)) * 10) / 10);
  const depth = clamp(Math.round((lengthScore * 0.5 + Math.min(techTerms, 5) + (hasNumbers ? 1.5 : 0)) * 10) / 10);
  const communication = clamp(Math.round((4 + (hasExample ? 3 : 0) + Math.min(sentences, 3)) * 10) / 10);

  const improvements: string[] = [];
  if (!hasExample) improvements.push("Anchor the answer in a specific example from your work");
  if (!hasNumbers) improvements.push("Quantify the impact (latency, scale, time saved)");
  if (techTerms < 2) improvements.push("Name the concrete tools and techniques you used");
  if (words.length < 40) improvements.push("Go one level deeper on how and why, not just what");

  return withOverall(
    {
      clarity,
      depth,
      communication,
      feedback:
        words.length < 25
          ? "This answer is quite short, so it's hard to judge your experience. Expand on what you did and the outcome."
          : "Solid start with a clear structure. Adding a concrete example and measurable results would make it stronger.",
      strength: hasExample ? "Grounded the answer in real experience" : sentences > 2 ? "Clear, structured explanation" : "Direct and to the point",
      improvements: improvements.slice(0, 3),
    },
    "heuristic",
  );
}
