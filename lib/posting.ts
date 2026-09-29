export const POSTING_PLANS = [
  { name: "1 Week", price: 500, tag: "Recommended", recommended: true },
  { name: "4 Weeks", price: 1800, tag: "Save ₹200", recommended: false },
  { name: "12 Weeks", price: 4800, tag: "Save ₹1,200", recommended: false },
] as const;

const PROMOS: Record<string, number> = { SUMMER2026: 200 };

/** Validates a promo code; returns the normalised code and its flat discount, or null. */
export function lookupPromo(code: string): { code: string; discount: number } | null {
  const c = code.trim().toUpperCase();
  return c in PROMOS ? { code: c, discount: PROMOS[c] } : null;
}

export function postingTotal(price: number, discount: number): number {
  return Math.max(0, price - discount);
}
