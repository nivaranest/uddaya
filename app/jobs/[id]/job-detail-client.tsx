"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CompanyLogo } from "@/components/company-logo";
import { Icon } from "@/components/icon";
import { Wordmark } from "@/components/logo";
import { Modal } from "@/components/modal";
import { Toast, useToast } from "@/components/toast";
import type { Company, Job } from "@/lib/data";
import { cx } from "@/lib/format";
import type { MatchReason } from "@/lib/matching";

type Props = {
  job: Job;
  company: Company;
  reasons: MatchReason[];
  resumes: string[];
};

export function JobDetailClient({ job, company, reasons, resumes }: Props) {
  const [more, setMore] = useState(false);
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);
  const [modal, setModal] = useState(false);
  const [resume, setResume] = useState(0);
  const [note, setNote] = useState("");
  const [toast, showToast] = useToast();

  // `?apply=1` deep-links straight into the application modal. Read on the
  // client because job pages are statically prerendered.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("apply")) setModal(true);
  }, []);

  const resp = more ? job.responsibilities : job.responsibilities.slice(0, 3);
  const hiddenCount = job.responsibilities.length - 3;
  const stats = [
    { icon: "work_history", label: "Experience", value: job.experience },
    { icon: "schedule", label: "Job type", value: job.jobType },
    { icon: "payments", label: "Salary", value: job.salary },
    { icon: "calendar_today", label: "Posted", value: job.posted },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-white">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-4 px-6 py-3.5">
          <Link href="/dashboard" aria-label="Back" className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-line text-gray-800 hover:border-line-hover hover:text-gray-800">
            <Icon name="arrow_back" className="text-[22px]" />
          </Link>
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <Link href="/dashboard" className="text-gray-500 hover:text-bronze">Dashboard</Link>
            <Icon name="chevron_right" className="text-base" />
            <Link href="/dashboard#jobs" className="text-gray-500 hover:text-bronze">Explore Jobs</Link>
            <Icon name="chevron_right" className="text-base" />
            <span className="font-medium text-gray-800" aria-current="page">{job.title}</span>
          </nav>
          <Link href="/" className="ml-auto">
            <Wordmark className="text-xl" />
          </Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-start gap-12 px-6 py-10">
        <main className="flex min-w-0 flex-[7_1_520px] flex-col gap-9">
          <div className="flex flex-col gap-[18px]">
            <div className="flex items-center gap-4">
              <CompanyLogo company={job.company} size={60} />
              <div className="flex flex-col gap-1.5">
                <span className="font-display text-2xl font-semibold">{company.name}</span>
                <div className="flex flex-wrap gap-2">
                  <span className="flex items-center gap-1 text-[13px] text-gray-600">
                    <Icon name="location_on" className="text-base" />
                    {company.location}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2.5 py-[3px] text-xs text-gray-700">{company.industry}</span>
                </div>
              </div>
            </div>
            <h1 className="m-0 font-display text-[clamp(28px,4vw,36px)] font-semibold tracking-[-0.02em]">{job.title}</h1>
            <div className="grid gap-2.5 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
              {stats.map((s) => (
                <div key={s.label} className="flex items-center gap-2.5 rounded-xl bg-gray-100 px-3.5 py-3">
                  <Icon name={s.icon} className="text-[22px] text-bronze" />
                  <span className="flex flex-col">
                    <span className="text-xs text-gray-500">{s.label}</span>
                    <span className="text-sm font-semibold">{s.value}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Section title="About the Role">
            {job.about.map((p) => (
              <p key={p.slice(0, 24)} className="m-0 text-pretty text-base leading-[1.7] text-gray-600">{p}</p>
            ))}
          </Section>

          <Section title="Key Responsibilities">
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {resp.map((r) => (
                <li key={r} className="flex gap-2.5 text-base leading-normal text-gray-700">
                  <Icon name="arrow_upward" className="flex-none text-[20px] text-bronze" />
                  {r}
                </li>
              ))}
            </ul>
            {hiddenCount > 0 && (
              <button onClick={() => setMore(!more)} className="cursor-pointer self-start border-0 bg-transparent p-0 text-sm font-semibold text-bronze">
                {more ? "Show less" : `+ ${hiddenCount} more responsibilities`}
              </button>
            )}
          </Section>

          <Section title="Skills Required">
            <Tags items={job.requiredSkills} className="bg-mist" />
          </Section>
          <Section title="Nice to Have">
            <Tags items={job.niceToHave} className="bg-line" />
          </Section>
          <Section title="Experience Required" gap="gap-2">
            <p className="m-0 text-base text-gray-600">{job.experienceRequired}</p>
          </Section>
        </main>

        <aside className="sticky top-24 flex min-w-0 flex-[3_1_280px] flex-col gap-4">
          {applied ? (
            <div className="flex h-12 items-center justify-center gap-2 rounded-xl bg-mint-soft text-base font-semibold text-forest-dark">
              <Icon name="check_circle" className="text-[22px]" />
              Application sent
            </div>
          ) : (
            <button onClick={() => setModal(true)} className="btn-primary h-12 cursor-pointer rounded-xl border-0 font-display text-[17px]">
              Apply Now
            </button>
          )}
          <span className="-mt-2 text-center text-[13px] text-gray-500">Takes 2 minutes</span>
          <div className="flex gap-2.5">
            <button
              onClick={() => {
                setSaved(!saved);
                showToast(saved ? "Removed from saved jobs" : "Job saved");
              }}
              aria-pressed={saved}
              className="btn-outline flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] text-sm"
            >
              <Icon name="favorite" filled={saved} className={cx("text-[20px]", saved ? "text-rose" : "text-gray-800")} />
              {saved ? "Saved" : "Save Job"}
            </button>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href).catch(() => {});
                showToast("Link copied to clipboard");
              }}
              className="btn-outline flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[10px] text-sm"
            >
              <Icon name="share" className="text-[20px]" />
              Share
            </button>
          </div>
          <div className="flex flex-col gap-2.5 rounded-[10px] border border-line bg-gray-50 p-4 text-sm">
            <span className="text-base font-bold">{company.name}</span>
            <Row k="Industry" v={company.industry} />
            <Row k="Company size" v={company.size} />
            <Row k="Founded" v={company.founded} />
            {company.website && (
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Website</span>
                <a href={`https://${company.website}`} target="_blank" rel="noopener noreferrer" className="text-steel">{company.website}</a>
              </div>
            )}
          </div>
        </aside>
      </div>

      <div className="mx-auto flex w-full max-w-[1200px] flex-wrap gap-6 px-6 pb-16">
        <section className="flex flex-[2_1_520px] flex-wrap gap-7 rounded-xl bg-sand-100 p-8">
          <div className="flex flex-none flex-col gap-1.5">
            <Icon name="auto_awesome" className="text-[36px] text-bronze" />
            <h2 className="m-0 font-display text-xl font-semibold text-bronze-dark">Why You&apos;re a Great Match</h2>
            <span className="font-display text-4xl font-semibold leading-[1.1] text-bronze-dark">{job.match}% Match</span>
          </div>
          <ul className="m-0 flex flex-[1_1_280px] list-none flex-col gap-3 p-0">
            {reasons.map((w) => (
              <li key={w.skill} className="flex items-start gap-2.5 text-[15px] leading-[1.45]">
                <Icon name={w.ok ? "check_circle" : "error"} filled className={cx("flex-none text-[20px]", w.ok ? "text-forest" : "text-bronze-dark")} />
                <span>
                  <strong className="font-semibold">{w.skill}</strong> · {w.note}
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section className="flex flex-[1_1_280px] flex-col items-start gap-3 rounded-xl bg-white p-7">
          <Icon name="star" filled className="text-[32px] text-bronze" />
          <h3 className="m-0 font-display text-lg font-semibold">Prepare for this role</h3>
          <p className="m-0 text-[15px] text-gray-600">Get AI feedback on your answers, and check your resume against this job&apos;s ATS keywords.</p>
          <div className="mt-auto flex flex-wrap gap-2.5">
            <Link href={`/interview?job=${job.id}`} className="rounded-[10px] bg-sand-200 px-5 py-3 text-[15px] font-semibold text-bronze-deep hover:bg-sand-300 hover:text-bronze-deep">
              Start Mock Interview
            </Link>
            <Link href={`/resume-checker?job=${job.id}`} className="btn-outline rounded-[10px] px-5 py-3 text-[15px]">
              Check My Resume
            </Link>
          </div>
        </section>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} labelledBy="apply-title">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span id="apply-title" className="font-display text-xl font-semibold">Apply to {company.name}</span>
            <span className="text-sm text-gray-500">{job.title}</span>
          </div>
          <button onClick={() => setModal(false)} aria-label="Close" className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-gray-100">
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>
        <div role="radiogroup" aria-label="Resume" className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold">Resume</span>
          {resumes.map((name, i) => (
            <button
              key={name}
              role="radio"
              aria-checked={resume === i}
              onClick={() => setResume(i)}
              className={cx(
                "flex cursor-pointer items-center gap-2.5 rounded-[10px] border-[1.5px] px-3.5 py-3 text-left text-sm text-gray-800",
                resume === i ? "border-bronze bg-sand-50" : "border-line bg-white",
              )}
            >
              <Icon name="description" className="text-[20px] text-bronze" />
              {name}
            </button>
          ))}
        </div>
        <label className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold">
            Note to recruiter <span className="font-normal text-gray-400">(optional)</span>
          </span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="A line on why this role fits you"
            className="resize-y rounded-[10px] border border-line p-3 text-sm"
          />
        </label>
        <button
          onClick={() => {
            setModal(false);
            setApplied(true);
            showToast(`Application sent to ${company.name}`);
          }}
          className="btn-primary h-12 cursor-pointer rounded-xl border-0 font-display text-base"
        >
          Submit Application
        </button>
      </Modal>

      <Toast message={toast} />
    </div>
  );
}

function Section({ title, children, gap = "gap-3" }: { title: string; children: React.ReactNode; gap?: string }) {
  return (
    <section className={cx("flex flex-col", gap)}>
      <h2 className="m-0 font-display text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Tags({ items, className }: { items: string[]; className: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((k) => (
        <span key={k} className={cx("rounded-lg px-3.5 py-2 text-sm font-medium text-gray-800", className)}>{k}</span>
      ))}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-gray-500">{k}</span>
      <span>{v}</span>
    </div>
  );
}
