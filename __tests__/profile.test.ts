import { profileCompletion, type ProfileSnapshot } from "@/lib/profile";

const full: ProfileSnapshot = {
  photo: "data:image/png;base64,xyz",
  basic: { name: "A", email: "a@b.c", phone: "1", location: "Pune", headline: "h" },
  about: "A sufficiently long professional summary.",
  experience: [{}],
  education: [{}],
  skills: [{}, {}, {}],
  certifications: [{}],
  resumes: [{}],
};

describe("profileCompletion", () => {
  it("is 100% with every section filled", () => {
    expect(profileCompletion(full)).toEqual({ pct: 100, nextTip: null });
  });

  it("drops the photo weight and suggests adding one first", () => {
    expect(profileCompletion({ ...full, photo: "" })).toEqual({ pct: 85, nextTip: "Next: Add a profile photo" });
  });

  it("requires at least three skills and a real bio", () => {
    const r = profileCompletion({ ...full, skills: [{}, {}], about: "short" });
    expect(r.pct).toBe(75);
    expect(r.nextTip).toBe("Next: Add a bio");
  });

  it("requires all basic contact fields", () => {
    const r = profileCompletion({ ...full, basic: { ...full.basic, phone: "" } });
    expect(r.pct).toBe(80);
  });
});
