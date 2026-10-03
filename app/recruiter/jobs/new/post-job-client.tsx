"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/icon";
import { Wordmark } from "@/components/logo";
import { Toast, useToast } from "@/components/toast";
import { SKILL_SUGGESTIONS } from "@/lib/data";
import { cx, inr } from "@/lib/format";
import { estimateCandidatePool } from "@/lib/matching";
import { lookupPromo, POSTING_PLANS, postingTotal } from "@/lib/posting";

const STEPS = ["Basic Info", "Details", "Requirements", "AI Assist", "Review & Post"];
const TITLES = ["Basic Information", "Job Details", "Requirements", "AI Assist", "Review & Publish"];
const LEVELS: [string, string?][] = [["Junior", "(0-2 years)"], ["Mid-level", "(2-5 years)"], ["Senior", "(5+ years)"], ["Lead / Manager"]];
const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];
const BENEFITS = ["Health Insurance", "Remote Work Option", "Stock Options", "Professional Development", "Flexible Schedule", "Gym Membership"];
const SCHEDULES = ["9 AM - 5 PM", "Flexible", "Shift-based"];
const CATEGORIES = ["Software Development", "Design", "Marketing", "Sales", "Data & Analytics", "Operations"];
const CITIES = ["Hyderabad", "Bengaluru", "Pune", "Mumbai", "Chennai", "Delhi NCR"];
const EDUCATION = ["High School", "Bachelor's Degree", "Master's Degree", "PhD", "Not Required"];
const DESC_MAX = 2000;
const DRAFT_KEY = "uddaya:post-job-draft";

type Form = {
  title: string;
  category: string;
  level: number;
  types: Record<string, boolean>;
  location: string;
  remote: boolean;
  salFrom: string;
  salTo: string;
  showSal: boolean;
  desc: string;
  resp: string[];
  benefits: Record<string, boolean>;
  schedule: number;
  req: string[];
  nice: string[];
  years: number;
  edu: string;
};

const INITIAL: Form = {
  title: "Senior Python Engineer",
  category: "Software Development",
  level: 2,
  types: { "Full-time": true },
  location: "Hyderabad",
  remote: true,
  salFrom: "20,00,000",
  salTo: "30,00,000",
  showSal: true,
  desc: "We are looking for a Senior Python Engineer to own core services on our payments team. You will design APIs, improve reliability, and mentor engineers across the team.",
  resp: ["Design and build scalable Python services", "Lead code reviews and mentor junior developers"],
  benefits: { "Health Insurance": true },
  schedule: 0,
  req: ["Python", "AWS", "PostgreSQL"],
  nice: ["Kubernetes", "Docker", "Microservices"],
  years: 5,
  edu: "Bachelor's Degree",
};

const inputCls = "h-11 rounded-lg border border-line bg-white px-3 text-[15px] text-gray-800";

export function PostJobClient() {
  const [step, setStep] = useState(0);
  const [tried, setTried] = useState(false);
  const [f, setF] = useState<Form>(INITIAL);
  const [rq, setRq] = useState("");
  const [nq, setNq] = useState("");
  const [aiDesc, setAiDesc] = useState("");
  const [aiQs, setAiQs] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSource, setAiSource] = useState<"claude" | "template" | null>(null);
  const [qsOpen, setQsOpen] = useState(true);
  const [useQs, setUseQs] = useState(true);
  const [suggesting, setSuggesting] = useState(false);
  const [plan, setPlan] = useState(1);
  const [promo, setPromo] = useState("SUMMER2026");
  const [promoApplied, setPromoApplied] = useState<{ code: string; discount: number } | null>(lookupPromo("SUMMER2026"));
  const [promoErr, setPromoErr] = useState(false);
  const [full, setFull] = useState(false);
  const [published, setPublished] = useState<null | { paid: boolean }>(null);
  const [toast, showToast] = useToast();

  const set = (patch: Partial<Form>) => setF((x) => ({ ...x, ...patch }));
  const latest = useRef(f);
  latest.current = f;

  // Restore a saved draft once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) setF({ ...INITIAL, ...(JSON.parse(raw) as Partial<Form>) });
    } catch {
      /* storage unavailable or corrupt draft — start fresh */
    }
  }, []);

  // PRD §5.2.3: auto-save the draft every 30 seconds.
  useEffect(() => {
    if (published) return;
    const t = setInterval(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(latest.current));
      } catch {
        /* ignore */
      }
    }, 30_000);
    return () => clearInterval(t);
  }, [published]);

  function saveDraft() {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(f));
      showToast("Draft saved");
    } catch {
      showToast("Couldn't save the draft in this browser");
    }
  }

  async function generate() {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/job-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: f.title,
          category: f.category,
          level: LEVELS[f.level][0],
          location: f.location,
          remote: f.remote,
          required: f.req,
          nice: f.nice,
          years: f.years,
          notes: f.desc,
          responsibilities: f.resp.filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const j = (await res.json()) as { description: string; questions: string[]; source: "claude" | "template" };
      setAiDesc(j.description);
      setAiQs(j.questions);
      setAiSource(j.source);
    } catch {
      setAiDesc(f.desc);
      setAiQs([]);
      setAiSource("template");
      showToast("AI assist is unavailable — using your description");
    } finally {
      setAiLoading(false);
    }
  }

  async function suggestSkills() {
    setSuggesting(true);
    try {
      const res = await fetch("/api/ai/suggest-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: f.title, description: f.desc, required: f.req, nice: f.nice }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const j = (await res.json()) as { required: string[]; nice: string[] };
      setF((x) => ({ ...x, req: [...new Set([...x.req, ...j.required])], nice: [...new Set([...x.nice, ...j.nice])] }));
      showToast(j.required.length + j.nice.length ? "AI added suggested skills" : "No new skills to suggest");
    } catch {
      showToast("Skill suggestions are unavailable right now");
    } finally {
      setSuggesting(false);
    }
  }

  function go(next: number) {
    if (next > 0 && !f.title.trim()) {
      setTried(true);
      setStep(0);
      return;
    }
    if (next > 1 && f.req.length === 0) {
      setTried(true);
      setStep(2);
      showToast("Add at least one required skill");
      return;
    }
    setStep(next);
    if (next === 3 && !aiDesc && !aiLoading) generate();
    window.scrollTo(0, 0);
  }

  async function publish(paid: boolean) {
    // Razorpay checkout (PRD §9.3) plugs in here for "Publish & Pay Now".
    const money = (v: string) => Number(v.replace(/[^\d]/g, "")) || null;
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: f.title.trim(),
        category: f.category,
        experienceLevel: (["junior", "mid", "senior", "lead"] as const)[f.level],
        jobType: ({ "Full-time": "full_time", "Part-time": "part_time", Contract: "contract", Internship: "internship" } as const)[
          JOB_TYPES.find((t) => f.types[t]) ?? "Full-time"
        ],
        location: f.location,
        isRemote: f.remote,
        salaryMin: money(f.salFrom),
        salaryMax: money(f.salTo),
        isSalaryVisible: f.showSal,
        description: aiDesc || f.desc || f.title,
        responsibilities: f.resp.filter(Boolean),
        benefits: BENEFITS.filter((b) => f.benefits[b]),
        workSchedule: SCHEDULES[f.schedule],
        requiredSkills: f.req,
        niceToHaveSkills: f.nice,
        yearsOfExperienceRequired: f.years,
        educationLevel: f.edu,
        aiQuestions: useQs ? aiQs : [],
      }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      showToast(j.error ?? "Couldn't publish the job");
      return;
    }
    setPublished({ paid });
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
    window.scrollTo(0, 0);
  }

  const titleErr = tried && !f.title.trim();
  const matchCount = estimateCandidatePool({ requiredSkills: f.req.length, years: f.years, remote: f.remote });
  const chosenPlan = POSTING_PLANS[plan];
  const total = postingTotal(chosenPlan.price, promoApplied?.discount ?? 0);
  const descSrc = aiDesc || f.desc;
  const typeSummary = [...JOB_TYPES.filter((t) => f.types[t]), ...(f.remote ? ["Remote"] : [])].join(", ") || "—";

  if (published) {
    return (
      <Shell>
        <div className="mx-auto my-20 flex max-w-[560px] flex-col items-center gap-4 px-6 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-mint-soft">
            <Icon name="task_alt" className="text-[44px] text-forest" />
          </span>
          <h1 className="m-0 font-display text-[28px] font-semibold">{f.title} is live</h1>
          <p className="m-0 text-base leading-relaxed text-gray-600">
            {published.paid
              ? `Payment of ${inr(total)} confirmed. Your post runs for ${chosenPlan.name.toLowerCase()} and ~${matchCount} matching candidates will be notified.`
              : `Your post is live for ${chosenPlan.name.toLowerCase()}. An invoice for ${inr(total)} has been sent to your billing email.`}
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-2.5">
            <Link href="/recruiter" className="btn-primary rounded-[10px] px-[22px] py-3">Go to Dashboard</Link>
            <button
              onClick={() => {
                setPublished(null);
                setStep(0);
                setF({ ...INITIAL, title: "" });
                setAiDesc("");
                setAiQs([]);
                setTried(false);
              }}
              className="btn-outline cursor-pointer rounded-[10px] px-[22px] py-3"
            >
              Post another job
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mx-auto mb-16 mt-8 w-full max-w-[800px] px-4">
        <div className="flex flex-col gap-7 rounded-xl bg-white p-[clamp(20px,4vw,40px)]">
          {/* Progress */}
          <div className="flex flex-col gap-3.5">
            <div className="text-center text-[13px] font-semibold text-gray-500">
              Step {step + 1} of {STEPS.length}
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-100" role="progressbar" aria-valuemin={1} aria-valuemax={5} aria-valuenow={step + 1}>
              <div className="h-full rounded-full bg-bronze transition-[width] duration-300" style={{ width: `${(step + 1) * 20}%` }} />
            </div>
            <ol className="m-0 grid list-none grid-cols-5 gap-1.5 p-0">
              {STEPS.map((label, i) => (
                <li key={label}>
                  <button onClick={() => go(i)} aria-current={i === step ? "step" : undefined} className="flex w-full cursor-pointer flex-col items-center gap-1.5 border-0 bg-transparent px-0 py-1">
                    <span
                      className={cx(
                        "flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-bold",
                        i === step ? "bg-gray-800 text-white" : i < step ? "bg-sand-200 text-bronze-deep" : "border-[1.5px] border-line bg-white text-gray-400",
                      )}
                    >
                      {i < step ? "✓" : i + 1}
                    </span>
                    <span className={cx("text-center text-xs leading-[1.2]", i === step ? "font-semibold text-gray-800" : "font-medium text-gray-500")}>{label}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex flex-col gap-1">
            <h1 className="m-0 font-display text-[28px] font-semibold tracking-[-0.02em]">Post a New Job</h1>
            <span className="font-display text-lg font-semibold text-bronze">
              Step {step + 1}: {TITLES[step]}
            </span>
          </div>

          {step === 0 && (
            <div className="flex flex-col gap-6">
              <label className="flex flex-col gap-2">
                <span className="field-label">Job Title <Req /></span>
                <input
                  value={f.title}
                  onChange={(e) => set({ title: e.target.value })}
                  placeholder="e.g., Senior Python Engineer"
                  aria-invalid={titleErr}
                  className={cx(inputCls, titleErr && "border-danger")}
                />
                <span className={cx("text-xs", titleErr ? "text-danger" : "text-gray-500")}>{titleErr ? "Job title is required" : "Be specific and clear"}</span>
              </label>
              <label className="flex flex-col gap-2">
                <span className="field-label">Job Category <Req /></span>
                <select value={f.category} onChange={(e) => set({ category: e.target.value })} className={inputCls}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <Field label={<>Required Experience Level <Req /></>}>
                <div className="flex flex-wrap gap-2" role="radiogroup">
                  {LEVELS.map(([l, sub], i) => (
                    <Choice key={l} radio on={f.level === i} onClick={() => set({ level: i })} label={sub ? `${l} ${sub}` : l} />
                  ))}
                </div>
              </Field>
              <Field label={<>Job Type <Req /></>}>
                <div className="flex flex-wrap gap-2">
                  {JOB_TYPES.map((t) => (
                    <Choice key={t} on={!!f.types[t]} onClick={() => set({ types: { ...f.types, [t]: !f.types[t] } })} label={t} />
                  ))}
                </div>
              </Field>
              <Field label={<>Work Location <Req /></>}>
                <div className="flex flex-wrap items-center gap-3">
                  <select value={f.location} onChange={(e) => set({ location: e.target.value })} aria-label="City" className={cx(inputCls, "flex-[1_1_220px]")}>
                    {CITIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <button role="switch" aria-checked={f.remote} onClick={() => set({ remote: !f.remote })} className="flex cursor-pointer items-center gap-2.5 border-0 bg-transparent p-0 text-sm text-gray-800">
                    <span className={cx("relative inline-block h-6 w-10 rounded-full transition-colors", f.remote ? "bg-bronze" : "bg-gray-300")}>
                      <span className={cx("absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white transition-[left]", f.remote ? "left-[19px]" : "left-[3px]")} />
                    </span>
                    Remote / Work from Home
                  </button>
                </div>
              </Field>
              <Field label={<>Salary Range <span className="font-medium normal-case text-gray-400">(optional, INR)</span></>}>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex h-11 flex-[1_1_180px] items-center gap-2 rounded-lg border border-line px-3">
                    <span className="text-[13px] text-gray-500">From ₹</span>
                    <input value={f.salFrom} onChange={(e) => set({ salFrom: e.target.value })} inputMode="numeric" aria-label="Salary from" className="min-w-0 flex-1 border-0 text-[15px] outline-none" />
                  </label>
                  <label className="flex h-11 flex-[1_1_180px] items-center gap-2 rounded-lg border border-line px-3">
                    <span className="text-[13px] text-gray-500">To ₹</span>
                    <input value={f.salTo} onChange={(e) => set({ salTo: e.target.value })} inputMode="numeric" aria-label="Salary to" className="min-w-0 flex-1 border-0 text-[15px] outline-none" />
                  </label>
                </div>
                <Check on={f.showSal} onClick={() => set({ showSal: !f.showSal })} label="Show salary to candidates" />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-6">
              <label className="flex flex-col gap-2">
                <span className="field-label">Job Description <Req /></span>
                <textarea
                  value={f.desc}
                  onChange={(e) => set({ desc: e.target.value.slice(0, DESC_MAX) })}
                  placeholder="Describe the role, responsibilities, and impact..."
                  className="min-h-[200px] resize-y rounded-lg border border-line p-3 text-[15px] leading-[1.55]"
                />
                <div className="flex justify-between gap-3 text-xs text-gray-500">
                  <span>Be detailed to attract better candidates</span>
                  <span>{f.desc.length} / {DESC_MAX}</span>
                </div>
              </label>
              <Field label="Key Responsibilities">
                {f.resp.map((r, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={r}
                      onChange={(e) => set({ resp: f.resp.map((x, k) => (k === i ? e.target.value : x)) })}
                      placeholder="Add a responsibility"
                      aria-label={`Responsibility ${i + 1}`}
                      className={cx(inputCls, "min-w-0 flex-1")}
                    />
                    <button onClick={() => set({ resp: f.resp.filter((_, k) => k !== i) })} aria-label="Remove" className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border border-line bg-white">
                      <Icon name="delete" className="text-[20px] text-gray-500" />
                    </button>
                  </div>
                ))}
                <button onClick={() => set({ resp: [...f.resp, ""] })} className="btn-primary flex cursor-pointer items-center gap-1 self-start rounded-lg border-0 px-3 py-2 text-[13px]">
                  <Icon name="add" className="text-[18px]" />
                  Add
                </button>
              </Field>
              <Field label="Benefits Offered">
                <div className="grid gap-2 [grid-template-columns:repeat(auto-fill,minmax(210px,1fr))]">
                  {BENEFITS.map((b) => (
                    <Choice key={b} on={!!f.benefits[b]} onClick={() => set({ benefits: { ...f.benefits, [b]: !f.benefits[b] } })} label={b} />
                  ))}
                </div>
              </Field>
              <Field label="Work Schedule">
                <div className="flex flex-wrap gap-2" role="radiogroup">
                  {SCHEDULES.map((l, i) => (
                    <Choice key={l} radio on={f.schedule === i} onClick={() => set({ schedule: i })} label={l} />
                  ))}
                </div>
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-6">
              <SkillPicker
                label={<>Required Skills <Req /></>}
                tags={f.req}
                others={f.nice}
                query={rq}
                setQuery={setRq}
                tagCls="bg-mist"
                onChange={(req) => set({ req })}
              />
              <SkillPicker label="Nice-to-Have Skills" tags={f.nice} others={f.req} query={nq} setQuery={setNq} tagCls="bg-gray-100" onChange={(nice) => set({ nice })} />
              <div className="flex flex-col gap-2.5">
                <span className="field-label">Required Years of Experience <Req /></span>
                <div className="flex items-center gap-3.5">
                  <span className="text-[13px] text-gray-500">0</span>
                  <input
                    type="range"
                    min={0}
                    max={20}
                    value={f.years}
                    onChange={(e) => set({ years: Number(e.target.value) })}
                    aria-label="Required years of experience"
                    className="flex-1 accent-bronze"
                  />
                  <span className="text-[13px] text-gray-500">20 years</span>
                </div>
                <span className="text-sm">
                  Selected: <strong>{f.years} years</strong>
                </span>
              </div>
              <label className="flex flex-col gap-2">
                <span className="field-label">Minimum Education</span>
                <select value={f.edu} onChange={(e) => set({ edu: e.target.value })} className={inputCls}>
                  {EDUCATION.map((x) => <option key={x}>{x}</option>)}
                </select>
              </label>
              <div className="flex flex-wrap items-center gap-3.5 rounded-xl border border-sand-line bg-sand-50 px-4 py-3.5">
                <Icon name="lightbulb" className="text-[24px] text-bronze" />
                <span className="flex-[1_1_220px] text-sm">AI can help generate skills based on your description</span>
                <button onClick={suggestSkills} disabled={suggesting} className="btn-outline cursor-pointer rounded-lg px-3.5 py-2 text-[13px] disabled:cursor-wait">
                  {suggesting ? "Thinking…" : "Use AI Suggestions"}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3.5">
                <Icon name="auto_awesome" className="flex-none text-[26px] text-bronze" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-display text-[17px] font-semibold">Uddaya AI Enhancements</span>
                  <span className="text-sm text-gray-600">Let AI generate job description and interview questions</span>
                </div>
              </div>
              {aiLoading && (
                <div className="flex items-center justify-center gap-3 rounded-xl bg-gray-50 p-8 text-sm text-gray-600" role="status">
                  <span className="inline-block h-[18px] w-[18px] animate-spin rounded-full border-2 border-sand-line border-t-bronze" />
                  Writing a description and questions from your inputs…
                </div>
              )}
              {!aiLoading && aiDesc && (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="field-label">
                        Generated Job Description
                        {aiSource === "template" && <span className="ml-1.5 font-medium normal-case text-gray-400">(template — AI not configured)</span>}
                      </span>
                      <button onClick={generate} className="btn-outline cursor-pointer rounded-lg px-3 py-1.5 text-[13px]">Regenerate</button>
                    </div>
                    <textarea
                      value={aiDesc}
                      onChange={(e) => setAiDesc(e.target.value.slice(0, DESC_MAX))}
                      aria-label="Generated job description"
                      className="min-h-[180px] resize-y rounded-lg border border-line bg-[#FFFDF7] p-3 text-sm leading-relaxed"
                    />
                  </div>
                  {aiQs.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <button onClick={() => setQsOpen(!qsOpen)} aria-expanded={qsOpen} className="flex cursor-pointer items-center justify-between border-0 bg-transparent p-0 text-gray-800">
                        <span className="field-label">Suggested Interview Questions ({aiQs.length})</span>
                        <Icon name={qsOpen ? "expand_less" : "expand_more"} className="text-[22px]" />
                      </button>
                      {qsOpen && (
                        <ol className="m-0 flex list-decimal flex-col gap-2 pl-5 text-sm leading-normal text-gray-700">
                          {aiQs.map((q) => <li key={q}>{q}</li>)}
                        </ol>
                      )}
                      <Check on={useQs} onClick={() => setUseQs(!useQs)} label="Use AI questions in interviews" />
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-center gap-4 rounded-[10px] bg-paper px-5 py-[18px]">
                <span className="font-display text-[32px] font-semibold text-bronze-dark">~{matchCount}</span>
                <span className="text-sm leading-normal text-gray-600">Based on your description, ~{matchCount} candidates match the requirements</span>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-[18px]">
              <ReviewBox title="Posting Details" action={<LinkBtn onClick={() => go(0)}>Edit</LinkBtn>}>
                <div className="grid gap-x-5 gap-y-2.5 text-sm [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
                  {[
                    { k: "Job Title", v: f.title },
                    { k: "Category", v: f.category },
                    { k: "Location", v: `${f.location}, India` },
                    { k: "Type", v: typeSummary },
                    { k: "Salary", v: f.salFrom && f.salTo ? `₹${f.salFrom} – ₹${f.salTo}${f.showSal ? "" : " (hidden)"}` : "Not specified" },
                    { k: "Experience", v: `${f.years}+ years` },
                  ].map((r) => (
                    <div key={r.k} className="flex flex-col gap-0.5">
                      <span className="text-xs text-gray-500">{r.k}</span>
                      <span className="font-medium">{r.v}</span>
                    </div>
                  ))}
                </div>
              </ReviewBox>
              <ReviewBox title="Description Preview" action={descSrc.length > 200 && <LinkBtn onClick={() => setFull(!full)}>{full ? "Show less" : "View Full Description"}</LinkBtn>}>
                <p className="m-0 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
                  {full ? descSrc : descSrc.slice(0, 200) + (descSrc.length > 200 ? "…" : "")}
                </p>
              </ReviewBox>
              <ReviewBox title="Skills">
                <TagRow label="Required" tags={f.req} cls="bg-mist" />
                <TagRow label="Nice-to-Have" tags={f.nice} cls="bg-line" />
              </ReviewBox>

              <div className="mt-2 flex flex-col gap-3">
                <span className="field-label">Select Posting Duration</span>
                <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(170px,1fr))]" role="radiogroup" aria-label="Posting duration">
                  {POSTING_PLANS.map((p, i) => (
                    <button
                      key={p.name}
                      role="radio"
                      aria-checked={plan === i}
                      onClick={() => setPlan(i)}
                      className={cx(
                        "flex cursor-pointer flex-col items-start gap-1.5 rounded-[10px] border-2 p-[18px] text-left text-gray-800",
                        plan === i ? "border-bronze bg-sand-50" : "border-line bg-white",
                      )}
                    >
                      <span className="font-display text-base font-semibold">{p.name}</span>
                      <span className="font-display text-2xl font-semibold">{inr(p.price)}</span>
                      <span className={cx("rounded-md px-2 py-[3px] text-xs font-semibold", p.recommended ? "bg-mint-soft text-forest-dark" : "bg-sand-100 text-bronze-deep")}>{p.tag}</span>
                    </button>
                  ))}
                </div>
                <div className="flex flex-col gap-3 rounded-[10px] bg-gray-50 px-5 py-[18px] text-sm">
                  <div className="flex justify-between">
                    <span>Base</span>
                    <span>{inr(chosenPlan.price)}</span>
                  </div>
                  <form
                    className="flex flex-wrap gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const found = lookupPromo(promo);
                      setPromoApplied(found);
                      setPromoErr(!found && !!promo.trim());
                    }}
                  >
                    <input
                      value={promo}
                      onChange={(e) => {
                        setPromo(e.target.value);
                        setPromoErr(false);
                      }}
                      placeholder="Promo code"
                      aria-label="Promo code"
                      className="h-10 flex-[1_1_160px] rounded-lg border border-line bg-white px-3 text-sm uppercase"
                    />
                    <button type="submit" className="btn-outline h-10 cursor-pointer rounded-lg px-4 text-[13px]">Apply</button>
                  </form>
                  {promoApplied && (
                    <div className="flex justify-between text-forest">
                      <span className="flex items-center gap-1.5">
                        <Icon name="check_circle" className="text-[18px]" />
                        {promoApplied.code} applied
                      </span>
                      <span>−{inr(promoApplied.discount)}</span>
                    </div>
                  )}
                  {promoErr && <div role="alert" className="text-[13px] text-danger">That code isn&apos;t valid. Try SUMMER2026.</div>}
                  <div className="flex items-baseline justify-between border-t border-line pt-3">
                    <span className="font-semibold">Total</span>
                    <span className="font-display text-[28px] font-semibold text-bronze-dark">{inr(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-6">
            {step === 0 ? (
              <button onClick={saveDraft} className="btn-outline h-11 cursor-pointer rounded-[10px] px-5 text-base">Save as Draft</button>
            ) : (
              <button onClick={() => go(step - 1)} className="btn-outline h-11 cursor-pointer rounded-[10px] px-5 text-base">
                ← Back: {STEPS[step - 1]}
              </button>
            )}
            <div className="ml-auto flex flex-wrap gap-3">
              {step === 4 && (
                <button onClick={() => publish(false)} className="btn-outline h-12 cursor-pointer rounded-[10px] px-5 text-base">Publish &amp; Pay Later</button>
              )}
              <button
                onClick={() => (step === 4 ? publish(true) : go(step + 1))}
                disabled={step === 3 && aiLoading}
                className="btn-primary h-12 cursor-pointer rounded-[10px] border-0 px-6 text-base font-bold disabled:cursor-wait disabled:opacity-60"
              >
                {step === 4 ? "Publish & Pay Now" : step === 3 ? "Accept & Next →" : `Next: ${STEPS[step + 1]} →`}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Toast message={toast} />
    </Shell>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-[1100px] items-center gap-3.5 px-6 py-3.5">
          <Link href="/recruiter" aria-label="Back to dashboard" className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-line text-gray-800 hover:text-gray-800">
            <Icon name="close" className="text-[22px]" />
          </Link>
          <Wordmark className="text-xl" />
          <span className="rounded-full bg-sand-100 px-2.5 py-1 text-[13px] font-semibold text-bronze-deep">Recruiter Portal</span>
        </div>
      </header>
      {children}
    </div>
  );
}

function Req() {
  return <span className="text-danger">*</span>;
}

function Field({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="field-label">{label}</span>
      {children}
    </div>
  );
}

function Choice({ on, onClick, label, radio = false }: { on: boolean; onClick: () => void; label: string; radio?: boolean }) {
  return (
    <button
      role={radio ? "radio" : "checkbox"}
      aria-checked={on}
      onClick={onClick}
      className={cx(
        "flex cursor-pointer items-center gap-2 rounded-[10px] border-[1.5px] px-3.5 py-2.5 text-left text-sm text-gray-800",
        on ? "border-bronze bg-sand-50 font-semibold" : "border-line bg-white font-normal",
      )}
    >
      <Icon
        name={radio ? (on ? "radio_button_checked" : "radio_button_unchecked") : on ? "check_box" : "check_box_outline_blank"}
        filled={on}
        className={cx("text-[20px]", on ? "text-bronze" : "text-gray-400")}
      />
      {label}
    </button>
  );
}

function Check({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button role="checkbox" aria-checked={on} onClick={onClick} className="mt-1 flex cursor-pointer items-center gap-2 self-start border-0 bg-transparent p-0 text-sm text-gray-800">
      <Icon name={on ? "check_box" : "check_box_outline_blank"} filled={on} className={cx("text-[20px]", on ? "text-bronze" : "text-gray-400")} />
      {label}
    </button>
  );
}

type SkillPickerProps = {
  label: ReactNode;
  tags: string[];
  others: string[];
  query: string;
  setQuery: (q: string) => void;
  tagCls: string;
  onChange: (tags: string[]) => void;
};

function SkillPicker({ label, tags, others, query, setQuery, tagCls, onChange }: SkillPickerProps) {
  const q = query.trim().toLowerCase();
  const taken = new Set([...tags, ...others].map((t) => t.toLowerCase()));
  const sug = SKILL_SUGGESTIONS.filter((k) => !taken.has(k.toLowerCase()) && (!q || k.toLowerCase().includes(q))).slice(0, 8);
  const add = (n: string) => {
    if (!taken.has(n.toLowerCase())) onChange([...tags, n]);
    setQuery("");
  };
  return (
    <div className="flex flex-col gap-2">
      <span className="field-label">{label}</span>
      <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-lg border border-line px-2 py-1.5">
        {tags.map((t) => (
          <span key={t} className={cx("inline-flex items-center gap-1 rounded-md py-[5px] pl-2.5 pr-2 text-[13px] font-medium", tagCls)}>
            {t}
            <button onClick={() => onChange(tags.filter((x) => x !== t))} aria-label={`Remove ${t}`} className="flex cursor-pointer border-0 bg-transparent p-0 text-inherit">
              <Icon name="close" className="text-base" />
            </button>
          </span>
        ))}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && query.trim()) {
              e.preventDefault();
              add(query.trim());
            }
          }}
          placeholder="Search skills..."
          aria-label="Search skills"
          className="h-[30px] min-w-[140px] flex-1 border-0 text-sm outline-none"
        />
      </div>
      {sug.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {sug.map((name) => (
            <button key={name} onClick={() => add(name)} className="cursor-pointer rounded-full border border-dashed border-gray-300 bg-white px-2.5 py-1.5 text-[13px] text-gray-700">
              + {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewBox({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-[10px] border border-line p-5">
      <div className="flex items-center justify-between">
        <span className="font-display text-base font-semibold">{title}</span>
        {action}
      </div>
      {children}
    </div>
  );
}

function LinkBtn({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} className="cursor-pointer border-0 bg-transparent text-[13px] font-semibold text-bronze">
      {children}
    </button>
  );
}

function TagRow({ label, tags, cls }: { label: string; tags: string[]; cls: string }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="w-[100px] text-xs text-gray-500">{label}</span>
      {tags.length ? tags.map((t) => <span key={t} className={cx("rounded-md px-2.5 py-[5px] text-[13px]", cls)}>{t}</span>) : <span className="text-[13px] text-gray-400">None</span>}
    </div>
  );
}
