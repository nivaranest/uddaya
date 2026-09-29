"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";
import { ProgressRing } from "@/components/progress-ring";
import { Spinner } from "@/components/spinner";
import { Toast, useToast } from "@/components/toast";
import { cx, mmss } from "@/lib/format";
import type { GradedAnswer } from "@/lib/interview";
import { scoreColor } from "@/lib/score";
import { useSpeech } from "./use-speech";

const QUESTION_SECONDS = 120;
const MAX_CHARS = 500;
const TOTAL_MINUTES = 15;

type Props = {
  jobId: string;
  role: string;
  company: string;
  questions: string[];
  interviewType: string;
  difficulty: "easy" | "medium" | "hard";
};

export function InterviewClient({ jobId, role, company, questions, interviewType, difficulty }: Props) {
  const total = questions.length;
  const [qi, setQi] = useState(0);
  const [answer, setAnswer] = useState("");
  const [results, setResults] = useState<(GradedAnswer | null)[]>([]);
  const [current, setCurrent] = useState<GradedAnswer | null>(null);
  const [grading, setGrading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [qLeft, setQLeft] = useState(QUESTION_SECONDS);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [toast, showToast] = useToast();
  const speech = useSpeech((text) => setAnswer((a) => (a ? `${a} ${text}` : text).slice(0, MAX_CHARS)));

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => {
      setElapsed((e) => e + 1);
      if (!current) setQLeft((q) => Math.max(0, q - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [done, current]);

  async function grade() {
    setGrading(true);
    setError("");
    speech.stop();
    try {
      const res = await fetch("/api/ai/interview-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: questions[qi], answer, role, company, difficulty }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setCurrent((await res.json()) as GradedAnswer);
    } catch {
      setError("AI feedback is unavailable right now. Try again, or skip this question.");
    } finally {
      setGrading(false);
    }
  }

  function advance(result: GradedAnswer | null) {
    const next = [...results, result];
    setResults(next);
    setCurrent(null);
    setAnswer("");
    setError("");
    speech.stop();
    if (qi === total - 1) setDone(true);
    else {
      setQi(qi + 1);
      setQLeft(QUESTION_SECONDS);
    }
    window.scrollTo(0, 0);
  }

  function restart() {
    setQi(0);
    setAnswer("");
    setResults([]);
    setCurrent(null);
    setElapsed(0);
    setQLeft(QUESTION_SECONDS);
    setDone(false);
    setError("");
  }

  const primaryDisabled = grading || (!current && answer.trim().length < 10);
  const primaryLabel = grading ? "Scoring your answer…" : current ? (qi === total - 1 ? "Finish Interview →" : "Next Question →") : "Submit Answer";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-[1200px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-3.5">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="font-display text-[clamp(18px,2.4vw,24px)] font-semibold">Mock Interview Prep</span>
            <span className="truncate text-sm text-gray-600">
              {role} @ {company}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3.5 py-2 text-sm tabular-nums">
            <Icon name="timer" className="text-[18px] text-bronze" />
            <span className="hidden sm:inline">Interview time:</span> <strong>{mmss(elapsed)}</strong>
          </div>
          <Link href={`/jobs/${jobId}`} aria-label="Close" className="flex h-10 w-10 items-center justify-center justify-self-end rounded-[10px] border border-line text-gray-800 hover:text-gray-800">
            <Icon name="close" className="text-[22px]" />
          </Link>
        </div>
      </header>

      {!done ? (
        <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-start gap-6 px-6 pb-16 pt-7">
          <main className="card flex min-w-0 flex-[1_1_480px] flex-col gap-5 p-[clamp(20px,3vw,32px)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.06em] text-gray-500">
                Question {qi + 1} of {total}
              </span>
              <span className={cx("text-sm font-semibold tabular-nums", qLeft < 30 ? "text-danger" : "text-forest")}>
                {mmss(qLeft).replace(/^0/, "")} remaining
              </span>
            </div>
            <h1 className="m-0 text-pretty font-display text-xl font-semibold leading-[1.45]">{questions[qi]}</h1>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => (speech.supported ? speech.toggle() : showToast("Voice input isn't supported in this browser"))}
                disabled={!!current}
                className={cx(
                  "flex cursor-pointer items-center gap-1.5 rounded-full border-[1.5px] px-3.5 py-2 text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-50",
                  speech.recording ? "border-danger bg-red-50 text-danger" : "border-line bg-white text-gray-800",
                )}
              >
                <Icon name={speech.recording ? "mic_off" : "mic"} className="text-[20px]" />
                {speech.recording ? "Stop recording" : "Answer by voice"}
              </button>
              {speech.recording && (
                <span className="flex items-center gap-2 text-[13px] font-semibold text-danger">
                  <span className="h-2.5 w-2.5 animate-ud-rec rounded-full bg-danger" />
                  Recording...
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value.slice(0, MAX_CHARS))}
                disabled={!!current}
                aria-label="Your answer"
                placeholder="Type or speak your answer here..."
                className="min-h-[220px] resize-y rounded-xl border border-line bg-gray-50 p-4 text-[15px] leading-relaxed text-gray-800"
              />
              <span className="self-end text-xs text-gray-500">
                {answer.length} / {MAX_CHARS}
              </span>
            </div>

            {error && <div role="alert" className="text-[13px] text-danger">{error}</div>}

            <div className="flex flex-wrap justify-between gap-3">
              <button onClick={() => advance(null)} className="btn-outline h-[46px] cursor-pointer rounded-[10px] px-5 text-[15px]">
                Skip Question
              </button>
              <button
                onClick={() => (current ? advance(current) : grade())}
                disabled={primaryDisabled}
                className={cx(
                  "flex h-[46px] items-center gap-2 rounded-[10px] border-0 px-6 text-[15px] font-bold",
                  primaryDisabled ? "cursor-not-allowed bg-[#EEF3F0] text-gray-400" : "cursor-pointer bg-mint text-mint-ink hover:bg-mint-hover",
                )}
              >
                {grading && <Spinner />}
                {primaryLabel}
              </button>
            </div>

            {current && <FeedbackPanel fb={current} />}
          </main>

          <aside className="flex min-w-0 flex-[1_1_320px] flex-col gap-4">
            <div className="card flex items-center gap-[18px] p-[22px]">
              <ProgressRing pct={((qi + 1) / total) * 100} size={84} stroke={9}>
                <span className="text-[17px]">{Math.round(((qi + 1) / total) * 100)}%</span>
              </ProgressRing>
              <div className="flex flex-1 flex-col gap-2">
                <span className="font-display text-[15px] font-semibold">
                  Question {qi + 1} of {total}
                </span>
                <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }}>
                  {questions.map((_, i) => (
                    <span key={i} className={cx("h-1.5 rounded-full", i < qi ? "bg-bronze" : i === qi ? "bg-gold" : "bg-gray-100")} />
                  ))}
                </div>
              </div>
            </div>
            <div className="card flex flex-col gap-2.5 p-[22px] text-sm">
              <KV k="Role" v={role} />
              <KV k="Company" v={company} />
              <KV k="Interview Type" v={interviewType} />
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500">Difficulty</span>
                <span className="rounded-full bg-sand-100 px-2.5 py-[3px] text-xs font-semibold capitalize text-bronze-deep">{difficulty}</span>
              </div>
            </div>
            <div className="card flex flex-col gap-2.5 p-[22px]">
              <h3 className="m-0 font-display text-base font-semibold">Interview Tips</h3>
              <ul className="m-0 flex list-disc flex-col gap-1.5 pl-[18px] text-[13px] leading-normal text-gray-700">
                <li>Speak clearly and at a moderate pace</li>
                <li>Provide specific examples from your experience</li>
                <li>Ask clarifying questions if needed</li>
                <li>Show enthusiasm about the role</li>
              </ul>
            </div>
            <div className="card flex flex-col gap-2 p-[22px] text-sm">
              <KV k="Total interview" v={`~${TOTAL_MINUTES} minutes`} />
              <KV k="You've spent" v={minutes(Math.floor(elapsed / 60))} />
              <KV k="Remaining" v={`~${Math.max(0, TOTAL_MINUTES - Math.floor(elapsed / 60))} minutes`} />
            </div>
          </aside>
        </div>
      ) : (
        <Summary results={results} total={total} elapsed={elapsed} jobId={jobId} onRestart={restart} />
      )}

      <Toast message={toast} />
    </div>
  );
}

function FeedbackPanel({ fb }: { fb: GradedAnswer }) {
  const bars: [string, number][] = [
    ["Clarity", fb.clarity],
    ["Technical Depth", fb.depth],
    ["Communication", fb.communication],
  ];
  const tips = [
    { text: fb.strength, icon: "check", cls: "text-forest" },
    ...fb.improvements.map((t) => ({ text: t, icon: "arrow_upward", cls: "text-bronze-dark" })),
  ].filter((t) => t.text);

  return (
    <section aria-live="polite" className="flex flex-col gap-3.5 rounded-[10px] bg-sand-100 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="m-0 flex items-center gap-1.5 font-display text-base font-semibold text-bronze-dark">
          <Icon name="auto_awesome" className="text-[20px]" />
          AI Feedback
          {fb.source === "heuristic" && <span className="font-sans text-xs font-medium text-gray-500">(offline estimate)</span>}
        </h2>
        <span className="font-display text-[26px] font-semibold">
          {fb.overall}
          <span className="text-sm text-gray-500">/10</span>
        </span>
      </div>
      <div className="flex flex-col gap-3 rounded-xl bg-white p-4">
        {bars.map(([label, score]) => (
          <div key={label} className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[13px]">
              <span className="font-medium">{label}</span>
              <span className="font-semibold">{score}/10</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full transition-[width]" style={{ width: `${score * 10}%`, background: scoreColor(score) }} />
            </div>
          </div>
        ))}
      </div>
      <p className="m-0 text-sm leading-relaxed">{fb.feedback}</p>
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
        {tips.map((t) => (
          <li key={t.text} className="flex gap-2 text-sm leading-[1.45]">
            <Icon name={t.icon} className={cx("flex-none text-[18px]", t.cls)} />
            {t.text}
          </li>
        ))}
      </ul>
    </section>
  );
}

type SummaryProps = { results: (GradedAnswer | null)[]; total: number; elapsed: number; jobId: string; onRestart: () => void };

function Summary({ results, total, elapsed, jobId, onRestart }: SummaryProps) {
  const answered = results.filter((r): r is GradedAnswer => r !== null);
  const avg = (k: "clarity" | "depth" | "communication") => (answered.length ? answered.reduce((a, r) => a + r[k], 0) / answered.length : 0);
  const cats = ([["Clarity", "clarity"], ["Technical Depth", "depth"], ["Communication", "communication"]] as const)
    .map(([n, k]) => ({ n, v: avg(k) }))
    .sort((a, b) => b.v - a.v);
  const has = answered.length > 0;

  const summary = [
    { k: "Questions answered", v: `${answered.length}/${total} ✓` },
    { k: "Average score", v: has ? `${(answered.reduce((a, r) => a + r.overall, 0) / answered.length).toFixed(1)}/10` : "—" },
    { k: "Time taken", v: minutes(Math.max(1, Math.round(elapsed / 60))) },
    { k: "Best performance", v: has ? `${cats[0].n} (${cats[0].v.toFixed(1)}/10)` : "—" },
    { k: "Area to improve", v: has ? `${cats[2].n} (${cats[2].v.toFixed(1)}/10)` : "—" },
  ];
  const strengths = answered.map((r) => r.strength).filter(Boolean).slice(0, 3).join(" · ") || "Answer a few questions to see strengths.";
  const improve =
    [...answered]
      .sort((a, b) => a.overall - b.overall)
      .slice(0, 2)
      .map((r) => r.improvements[0])
      .filter(Boolean)
      .join(" · ") || "—";

  return (
    <div className="mx-auto flex w-full max-w-[960px] flex-col gap-6 px-6 pb-16 pt-10">
      <section className="card flex flex-col gap-6 p-[clamp(24px,4vw,40px)]">
        <div className="flex items-center gap-3.5">
          <span className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-mint-soft">
            <Icon name="emoji_events" className="text-[32px] text-forest" />
          </span>
          <h1 className="m-0 font-display text-2xl font-semibold text-forest">Interview Complete!</h1>
        </div>
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
          {summary.map((m) => (
            <div key={m.k} className="flex flex-col gap-1 rounded-[10px] bg-gray-50 p-4">
              <span className="text-xs text-gray-500">{m.k}</span>
              <span className="font-display text-[17px] font-semibold">{m.v}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card flex flex-col gap-5 p-[clamp(24px,4vw,40px)]">
        <h2 className="m-0 font-display text-xl font-semibold">Performance Summary</h2>
        <div
          className="grid h-[200px] items-end gap-[clamp(8px,3vw,28px)] border-b border-line px-2"
          style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }}
          role="img"
          aria-label="Score per question"
        >
          {Array.from({ length: total }, (_, i) => {
            const r = results[i];
            return (
              <div key={i} className="flex h-full flex-col items-center justify-end gap-1.5">
                <span className="text-[13px] font-semibold">{r ? r.overall : "Skipped"}</span>
                <div
                  className="w-full max-w-16 rounded-t-lg"
                  style={{ height: r ? Math.max(4, r.overall * 14) : 4, background: r ? scoreColor(r.overall) : "#ECE8E1" }}
                />
              </div>
            );
          })}
        </div>
        <div className="-mt-3 grid gap-[clamp(8px,3vw,28px)] px-2 text-center text-xs text-gray-500" style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }}>
          {Array.from({ length: total }, (_, i) => (
            <span key={i}>Q{i + 1}</span>
          ))}
        </div>
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
          <div className="flex flex-col gap-2 rounded-[10px] bg-mint-wash p-[18px]">
            <span className="text-sm font-bold text-forest-dark">Top strengths</span>
            <span className="text-sm leading-[1.55]">{strengths}</span>
          </div>
          <div className="flex flex-col gap-2 rounded-[10px] bg-sand-50 p-[18px]">
            <span className="text-sm font-bold text-bronze-deep">Areas to improve</span>
            <span className="text-sm leading-[1.55]">{improve}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/jobs/${jobId}?apply=1`} className="btn-primary rounded-[10px] px-6 py-3.5 text-base font-bold">
            Apply to This Job
          </Link>
          <button onClick={onRestart} className="btn-outline cursor-pointer rounded-[10px] px-[22px] py-3.5 text-[15px]">
            Practice Again
          </button>
          <Link href="/dashboard" className="btn-outline rounded-[10px] px-[22px] py-3.5 text-[15px]">
            Practice Another Role
          </Link>
        </div>
      </section>
    </div>
  );
}

const minutes = (n: number) => `${n} ${n === 1 ? "minute" : "minutes"}`;

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-gray-500">{k}</span>
      <span className="text-right font-medium">{v}</span>
    </div>
  );
}
