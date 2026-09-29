import type { ReactNode } from "react";

type ProgressRingProps = {
  /** 0–100 */
  pct: number;
  size: number;
  stroke: number;
  children?: ReactNode;
};

export function ProgressRing({ pct, size, stroke, children }: ProgressRingProps) {
  const r = size / 2 - stroke / 2 - 3;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className="relative flex-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${Math.round(clamped)}%`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F3F4F6" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#B07A48"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${(c * clamped) / 100} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dasharray .3s" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display font-semibold text-gray-800">
        {children}
      </span>
    </div>
  );
}
