import { inr, mmss, initials } from "@/lib/format";
import { lookupPromo, postingTotal } from "@/lib/posting";

describe("promo codes", () => {
  it("accepts SUMMER2026 case-insensitively", () => {
    expect(lookupPromo(" summer2026 ")).toEqual({ code: "SUMMER2026", discount: 200 });
  });
  it("rejects unknown codes", () => {
    expect(lookupPromo("FREE")).toBeNull();
    expect(lookupPromo("")).toBeNull();
  });
  it("never totals below zero", () => {
    expect(postingTotal(1800, 200)).toBe(1600);
    expect(postingTotal(100, 200)).toBe(0);
  });
});

describe("format helpers", () => {
  it("formats rupees with Indian grouping", () => {
    expect(inr(150000)).toBe("₹1,50,000");
  });
  it("formats mm:ss", () => {
    expect(mmss(0)).toBe("00:00");
    expect(mmss(125)).toBe("02:05");
    expect(mmss(-3)).toBe("00:00");
  });
  it("builds initials", () => {
    expect(initials("Sairam Kumar")).toBe("SK");
    expect(initials("priya  rao nair")).toBe("PR");
  });
});
