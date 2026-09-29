"use client";

import { useEffect, useState } from "react";
import { INITIAL_CANDIDATE_COUNT } from "@/lib/data";

/**
 * "Candidates onboarded" live counter. In production this value is pushed over
 * WebSocket from the live_counters table; here it ticks locally so the UI can
 * be exercised without a backend.
 */
export function useLiveCandidateCount() {
  const [n, setN] = useState(INITIAL_CANDIDATE_COUNT);
  useEffect(() => {
    const t = setInterval(() => {
      if (Math.random() < 0.4) setN((v) => v + 1);
    }, 2500);
    return () => clearInterval(t);
  }, []);
  return n.toLocaleString("en-IN");
}
