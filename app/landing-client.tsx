"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icon";
import { useLiveCandidateCount } from "@/components/live-counter";

const SELECTS = [
  { key: "loc", icon: "location_on", label: "Location", options: ["Any location", "Hyderabad", "Bengaluru", "Pune", "Mumbai", "Delhi NCR", "Remote"] },
  { key: "exp", icon: "work_history", label: "Experience", options: ["Any experience", "Junior (0–2 yrs)", "Mid-level (2–5 yrs)", "Senior (5+ yrs)", "Lead / Manager"] },
  { key: "sal", icon: "payments", label: "Salary", options: ["Any salary", "₹5–10 LPA", "₹10–20 LPA", "₹20–30 LPA", "₹30 LPA+"] },
] as const;

type FilterKey = (typeof SELECTS)[number]["key"];

export function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<Record<FilterKey, string>>({ loc: "Any location", exp: "Any experience", sal: "Any salary" });

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/dashboard?q=${encodeURIComponent(q)}`);
      }}
      className="mx-auto flex max-w-[1040px] flex-col gap-3.5 rounded-xl bg-white p-5"
    >
      <div className="flex flex-wrap gap-3">
        <label className="flex h-[60px] flex-[1_1_320px] items-center gap-3 rounded-[10px] border-[1.5px] border-line px-4">
          <Icon name="search" className="text-[24px] text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Job title, skills, or company"
            aria-label="Job title, skills, or company"
            className="min-w-0 flex-1 border-0 bg-transparent text-[17px] text-gray-800 outline-none"
          />
        </label>
        <button type="submit" className="btn-primary h-[60px] flex-none cursor-pointer rounded-[10px] border-0 px-8 font-display text-[17px]">
          Search Jobs
        </button>
      </div>
      <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
        {SELECTS.map((s) => (
          <label key={s.key} className="flex h-11 items-center gap-2 rounded-[10px] border border-line bg-gray-50 px-3">
            <Icon name={s.icon} className="text-[20px] text-bronze" />
            <select
              aria-label={s.label}
              value={filters[s.key]}
              onChange={(e) => setFilters({ ...filters, [s.key]: e.target.value })}
              className="flex-1 border-0 bg-transparent text-sm text-gray-800 outline-none"
            >
              {s.options.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </form>
  );
}

export function LiveCandidateStat() {
  const count = useLiveCandidateCount();
  return (
    <div className="flex flex-col gap-1 text-center">
      <div className="font-display text-[44px] font-semibold tracking-[-0.02em] tabular-nums">{count}</div>
      <div className="text-base text-gray-600">candidates onboarded</div>
    </div>
  );
}
