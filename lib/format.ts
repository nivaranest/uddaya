/** ₹ amount with Indian digit grouping, e.g. 150000 → "₹1,50,000". */
export function inr(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

/** Seconds → "MM:SS". */
export function mmss(totalSeconds: number): string {
  const t = Math.max(0, Math.floor(totalSeconds));
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
