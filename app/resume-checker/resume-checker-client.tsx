"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { AtsResponse } from "@/app/api/ai/ats-check/route";
import { Icon } from "@/components/icon";
import { ProgressRing } from "@/components/progress-ring";
import { Spinner } from "@/components/spinner";
import { SAMPLE_RESUME, type AtsCheck } from "@/lib/ats";
import { cx } from "@/lib/format";

type Props = { jobs: { id: string; label: string }[]; initialJobId: string };
type TargetMode = "none" | "job" | "paste";

const ACCEPT = ".pdf,.docx,.txt";
const MAX_BYTES = 5 * 1024 * 1024;

const STATUS_STYLE: Record<AtsCheck["status"], { icon: string; cls: string; label: string }> = {
  pass: { icon: "check_circle", cls: "text-forest", label: "Passed" },
  warn: { icon: "error", cls: "text-bronze", label: "Improve" },
  fail: { icon: "cancel", cls: "text-danger", label: "Fix" },
};

const RATING_STYLE: Record<AtsResponse["report"]["rating"], string> = {
  Excellent: "bg-mint-soft text-forest-dark",
  Good: "bg-mint-soft text-forest-dark",
  "Needs work": "bg-sand-100 text-bronze-deep",
  Poor: "bg-red-50 text-danger",
};

export function ResumeCheckerClient({ jobs, initialJobId }: Props) {
  const [mode, setMode] = useState<"upload" | "paste">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [target, setTarget] = useState<TargetMode>(initialJobId ? "job" : "none");
  const [jobId, setJobId] = useState(initialJobId || jobs[0]?.id || "");
  const [jd, setJd] = useState("");
  const [dz, setDz] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AtsResponse | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  function pickFile(f?: File | null) {
    setError("");
    if (!f) return;
    const ext = f.name.slice(f.name.lastIndexOf(".")).toLowerCase();
    if (![".pdf", ".docx", ".txt"].includes(ext)) return setError("Upload a PDF, DOCX or TXT file.");
    if (f.size > MAX_BYTES) return setError("Resumes must be 5 MB or smaller.");
    setFile(f);
  }

  const hasInput = mode === "upload" ? !!file : text.trim().length > 0;

  async function analyze() {
    if (!hasInput) return setError(mode === "upload" ? "Choose a resume file first." : "Paste your resume text first.");
    setLoading(true);
    setError("");
    const body = new FormData();
    if (mode === "upload" && file) body.append("file", file);
    else body.append("text", text);
    if (target === "job") body.append("jobId", jobId);
    if (target === "paste") body.append("jobDescription", jd);
    try {
      const res = await fetch("/api/ai/ats-check", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Something went wrong. Try again.");
      setResult(json as AtsResponse);
      requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const tab = (on: boolean) =>
    cx("cursor-pointer rounded-full border-0 px-3.5 py-1.5 text-[13px] font-semibold", on ? "bg-white text-gray-800 shadow-[0_1px_3px_rgba(31,41,55,0.12)]" : "bg-transparent text-gray-500");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-white">
        <div className="mx-auto flex max-w-[1100px] items-center gap-3.5 px-6 py-3">
          <Link href="/dashboard" aria-label="Back" className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-line text-gray-800 hover:text-gray-800">
            <Icon name="arrow_back" className="text-[22px]" />
          </Link>
          <h1 className="m-0 font-display text-[clamp(20px,3vw,28px)] font-semibold">ATS Resume Checker</h1>
          <span className="ml-auto hidden rounded-full bg-sand-100 px-2.5 py-1 text-[13px] font-semibold text-bronze-deep sm:inline">Free</span>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 px-6 pb-16 pt-7">
        <p className="m-0 max-w-[70ch] text-[15px] leading-relaxed text-gray-600">
          Most companies screen resumes with an applicant tracking system (ATS) before a person reads them. Check how yours will be parsed and scored, and see exactly what to fix — against a specific job or in general.
        </p>

        <div className="grid items-start gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(100%,440px),1fr))]">
          <section className="card flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="m-0 font-display text-lg font-semibold">1. Your resume</h2>
              <div className="flex rounded-full bg-gray-100 p-[3px]" role="group" aria-label="Resume input">
                <button onClick={() => setMode("upload")} className={tab(mode === "upload")} aria-pressed={mode === "upload"}>Upload</button>
                <button onClick={() => setMode("paste")} className={tab(mode === "paste")} aria-pressed={mode === "paste"}>Paste text</button>
              </div>
            </div>

            {mode === "upload" ? (
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setDz(true);
                }}
                onDragLeave={() => setDz(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDz(false);
                  pickFile(e.dataTransfer.files[0]);
                }}
                className={cx(
                  "flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-2 rounded-[10px] border-2 border-dashed p-6 text-center",
                  dz ? "border-sage bg-mint-wash" : "border-line bg-gray-50",
                )}
              >
                <Icon name={file ? "description" : "upload_file"} className="text-[36px] text-bronze" />
                {file ? (
                  <>
                    <span className="max-w-full truncate text-sm font-semibold">{file.name}</span>
                    <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB · click to choose another</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm">
                      Drag and drop, or <strong className="text-forest">choose a file</strong>
                    </span>
                    <span className="text-xs text-gray-500">PDF, DOCX or TXT · max 5 MB</span>
                  </>
                )}
                <input type="file" accept={ACCEPT} onChange={(e) => pickFile(e.target.files?.[0])} className="sr-only" aria-label="Upload resume" />
              </label>
            ) : (
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, 30000))}
                aria-label="Resume text"
                placeholder="Paste the full text of your resume…"
                className="min-h-[200px] resize-y rounded-[10px] border border-line bg-gray-50 p-3 text-sm leading-relaxed"
              />
            )}
            <button
              onClick={() => {
                setMode("paste");
                setText(SAMPLE_RESUME);
                setFile(null);
              }}
              className="cursor-pointer self-start border-0 bg-transparent p-0 text-[13px] font-semibold text-bronze"
            >
              Try it with a sample resume
            </button>
          </section>

          <section className="card flex flex-col gap-4 p-6">
            <h2 className="m-0 font-display text-lg font-semibold">2. Target job <span className="font-sans text-sm font-normal text-gray-500">(recommended)</span></h2>
            <div className="flex flex-col gap-2" role="radiogroup" aria-label="Target job">
              {(
                [
                  ["job", "A job on Uddaya"],
                  ["paste", "Paste a job description"],
                  ["none", "General ATS check"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  role="radio"
                  aria-checked={target === value}
                  onClick={() => setTarget(value)}
                  className={cx(
                    "flex cursor-pointer items-center gap-2 rounded-[10px] border-[1.5px] px-3.5 py-2.5 text-left text-sm text-gray-800",
                    target === value ? "border-bronze bg-sand-50 font-semibold" : "border-line bg-white",
                  )}
                >
                  <Icon name={target === value ? "radio_button_checked" : "radio_button_unchecked"} filled={target === value} className={cx("text-[20px]", target === value ? "text-bronze" : "text-gray-400")} />
                  {label}
                </button>
              ))}
            </div>
            {target === "job" && (
              <select value={jobId} onChange={(e) => setJobId(e.target.value)} aria-label="Job" className="h-11 rounded-lg border border-line bg-white px-3 text-sm">
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>{j.label}</option>
                ))}
              </select>
            )}
            {target === "paste" && (
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value.slice(0, 8000))}
                aria-label="Job description"
                placeholder="Paste the job description you're applying to…"
                className="min-h-[120px] resize-y rounded-[10px] border border-line p-3 text-sm leading-relaxed"
              />
            )}
            <p className="m-0 text-[13px] leading-normal text-gray-500">
              With a target job, we check your resume for the keywords its ATS will screen for.
            </p>
          </section>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={analyze}
            disabled={loading}
            className="btn-primary flex h-12 cursor-pointer items-center gap-2 rounded-xl border-0 px-7 font-display text-base disabled:cursor-wait disabled:opacity-70"
          >
            {loading ? <Spinner /> : <Icon name="fact_check" className="text-[20px]" />}
            {loading ? "Checking your resume…" : "Check my resume"}
          </button>
          {error && <span role="alert" className="text-sm text-danger">{error}</span>}
          <span className="ml-auto text-xs text-gray-500">Your resume is analysed for this check only and isn&apos;t saved.</span>
        </div>

        <div ref={resultsRef} className="scroll-mt-24">
          {result && <Results result={result} />}
        </div>
      </div>
    </div>
  );
}

function Results({ result }: { result: AtsResponse }) {
  const { report, review, reviewSource, target } = result;
  const issues = report.checks.filter((c) => c.status !== "pass").length;

  return (
    <div className="flex flex-col gap-6" aria-live="polite">
      <section className="card flex flex-wrap items-center gap-7 p-[clamp(20px,3vw,32px)]">
        <ProgressRing pct={report.score} size={132} stroke={12}>
          <span className="flex flex-col items-center leading-none">
            <span className="text-[34px]">{report.score}</span>
            <span className="mt-1 font-sans text-xs font-medium text-gray-500">/ 100</span>
          </span>
        </ProgressRing>
        <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="m-0 font-display text-2xl font-semibold">ATS score</h2>
            <span className={cx("rounded-full px-3 py-1 text-[13px] font-semibold", RATING_STYLE[report.rating])}>{report.rating}</span>
          </div>
          <p className="m-0 text-[15px] leading-relaxed text-gray-600">
            {target ? `Scored against ${target}. ` : "General ATS readiness check. "}
            {issues ? `${issues} thing${issues > 1 ? "s" : ""} to improve below.` : "No issues found — nice work."}
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-gray-500">
            <span>{report.stats.words.toLocaleString("en-IN")} words</span>
            <span>{report.stats.bullets} bullets</span>
            <span>{report.stats.quantifiedBullets} with metrics</span>
          </div>
        </div>
        <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-3">
          {report.categories.map((c) => (
            <div key={c.id} className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[13px]">
                <span className="font-medium">{c.label}</span>
                <span className="font-semibold tabular-nums">{c.score}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full" style={{ width: `${c.score}%`, background: c.score >= 75 ? "#8FC3A8" : c.score >= 50 ? "#E3C08A" : "#D08A84" }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {report.keywords && (
        <section className="card flex flex-col gap-4 p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="m-0 font-display text-lg font-semibold">Keyword match</h2>
            <span className="text-sm text-gray-600">
              {report.keywords.matched.length} of {report.keywords.matched.length + report.keywords.missing.length} found
            </span>
          </div>
          <KeywordRow label="Found in your resume" items={report.keywords.matched} cls="bg-mint-soft text-forest-dark" icon="check" />
          <KeywordRow label="Missing — add where they truthfully apply" items={report.keywords.missing} cls="bg-sand-100 text-bronze-deep" icon="add" />
        </section>
      )}

      <div className="grid items-start gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(100%,440px),1fr))]">
        <section className="card flex flex-col gap-3 p-6">
          <h2 className="m-0 font-display text-lg font-semibold">ATS checks</h2>
          <ul className="m-0 flex list-none flex-col p-0">
            {report.checks.map((c) => {
              const st = STATUS_STYLE[c.status];
              return (
                <li key={c.id} className="flex gap-3 border-t border-gray-100 py-3 first:border-t-0">
                  <Icon name={st.icon} filled className={cx("flex-none text-[22px]", st.cls)} />
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-sm font-semibold">
                      {c.label}
                      <span className="sr-only"> — {st.label}</span>
                    </span>
                    <span className="text-[13px] leading-normal text-gray-600">{c.detail}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="flex flex-col gap-4 rounded-xl bg-sand-100 p-6">
          <h2 className="m-0 flex items-center gap-2 font-display text-lg font-semibold text-bronze-dark">
            <Icon name="auto_awesome" className="text-[22px]" />
            AI review
          </h2>
          {review ? (
            <>
              <p className="m-0 text-sm leading-relaxed">{review.summary}</p>
              {review.strengths.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-[0.04em] text-forest-dark">Strengths</span>
                  <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                    {review.strengths.map((s) => (
                      <li key={s} className="flex gap-2 text-sm leading-[1.45]">
                        <Icon name="check" className="flex-none text-[18px] text-forest" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.04em] text-bronze-deep">Top fixes</span>
                {review.improvements.map((i) => (
                  <div key={i.issue} className="flex flex-col gap-0.5 rounded-[10px] bg-white p-3">
                    <span className="text-sm font-semibold">{i.issue}</span>
                    <span className="text-[13px] leading-normal text-gray-600">{i.fix}</span>
                  </div>
                ))}
              </div>
              {review.bulletRewrites.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.04em] text-bronze-deep">Stronger bullets</span>
                  {review.bulletRewrites.map((b) => (
                    <div key={b.original} className="flex flex-col gap-1.5 rounded-[10px] bg-white p-3 text-[13px] leading-normal">
                      <span className="text-gray-500 line-through decoration-gray-300">{b.original}</span>
                      <span className="flex gap-1.5 font-medium">
                        <Icon name="arrow_forward" className="flex-none text-[16px] text-forest" />
                        {b.improved}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="m-0 text-sm leading-relaxed text-gray-700">
              {reviewSource === "not-configured"
                ? "AI suggestions appear here when the Claude API is configured for this site. Your score and checks above are computed without it."
                : "AI suggestions aren't available right now. Your score and checks above are complete — try again later for written suggestions."}
            </p>
          )}
        </section>
      </div>

      <section className="flex flex-wrap items-center gap-4 rounded-xl border border-sand-line bg-cream p-6">
        <Icon name="work" className="text-[28px] text-bronze" />
        <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-0.5">
          <span className="font-display text-base font-semibold">Ready to apply?</span>
          <span className="text-sm text-gray-600">Update your resume on your profile, then find jobs matched to your skills.</span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link href="/profile" className="btn-outline rounded-[10px] px-5 py-2.5 text-sm">Update profile</Link>
          <Link href="/dashboard#jobs" className="btn-primary rounded-[10px] px-5 py-2.5 text-sm">See matched jobs</Link>
        </div>
      </section>
    </div>
  );
}

function KeywordRow({ label, items, cls, icon }: { label: string; items: string[]; cls: string; icon: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px] font-medium text-gray-600">{label}</span>
      {items.length ? (
        <div className="flex flex-wrap gap-2">
          {items.map((k) => (
            <span key={k} className={cx("inline-flex items-center gap-1 rounded-lg py-1.5 pl-2 pr-3 text-[13px] font-medium", cls)}>
              <Icon name={icon} className="text-[16px]" />
              {k}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-[13px] text-gray-400">None</span>
      )}
    </div>
  );
}
