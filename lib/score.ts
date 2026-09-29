/** Bar colour for a 0–10 interview score: green ≥ 8, gold ≥ 6, rose below. */
export function scoreColor(v: number): string {
  return v >= 8 ? "#8FC3A8" : v >= 6 ? "#E3C08A" : "#D08A84";
}
