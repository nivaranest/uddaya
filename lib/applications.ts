import type { AppColumn, CandidateApplication } from "./data";

/** Card moved to a new column: refresh the meta line for that stage. */
export function moveCard(c: CandidateApplication, col: AppColumn): CandidateApplication {
  if (c.col === col) return c;
  const meta =
    col === "interview" ? "Date to be confirmed" : col === "closed" ? "Closed just now" : col === "applied" ? "Applied just now" : c.meta;
  return {
    ...c,
    col,
    meta,
    age: 0,
    salary: c.salary ?? "Offer pending",
    joining: c.joining ?? "To be confirmed",
    offer: col === "offer" ? c.offer ?? "pending" : c.offer,
  };
}
