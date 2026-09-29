import { moveCard } from "@/lib/applications";
import type { CandidateApplication } from "@/lib/data";

const card: CandidateApplication = { id: 1, col: "applied", company: "TechCorp", job: "SWE", meta: "Applied 2 days ago", age: 2 };

describe("moveCard", () => {
  it("is a no-op when dropped on the same column", () => {
    expect(moveCard(card, "applied")).toBe(card);
  });

  it("resets meta for the new stage", () => {
    expect(moveCard(card, "interview").meta).toBe("Date to be confirmed");
    expect(moveCard(card, "closed").meta).toBe("Closed just now");
  });

  it("gives offers a pending status and placeholder terms", () => {
    const m = moveCard(card, "offer");
    expect(m).toMatchObject({ col: "offer", offer: "pending", salary: "Offer pending", joining: "To be confirmed" });
  });
});
