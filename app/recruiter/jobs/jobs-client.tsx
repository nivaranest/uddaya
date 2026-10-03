"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { LogoutLink } from "@/components/logout-link";

type App = { id: string; name: string; email: string; status: string; matchScore: number | null; note: string | null; appliedAt: string };
export type JobRow = { id: string; title: string; status: string; posted: string; applications: App[] };

const STATUSES = ["applied", "screening", "interview", "offer", "hired", "rejected"];

export function JobsClient({ jobs: initial, canManage }: { jobs: JobRow[]; canManage: boolean }) {
  const [jobs, setJobs] = useState(initial);
  const [open, setOpen] = useState<string | null>(initial[0]?.id ?? null);
  const [msg, setMsg] = useState("");

  async function setStatus(jobId: string, appId: string, status: string) {
    const res = await fetch(`/api/recruiter/applications/${appId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (!res.ok) return setMsg((await res.json().catch(() => ({}))).error ?? "Failed");
    setMsg("Status updated");
    setJobs((js) => js.map((j) => (j.id === jobId ? { ...j, applications: j.applications.map((a) => (a.id === appId ? { ...a, status } : a)) } : j)));
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3"><Logo href="/recruiter" /><span className="rounded-full bg-sand-100 px-3 py-1 text-sm font-semibold text-bronze-deep">My Jobs &amp; Applications</span></div>
        <div className="flex gap-4 text-sm font-semibold text-gray-700"><Link href="/recruiter">Dashboard</Link><Link href="/recruiter/jobs/new">Post a job</Link><LogoutLink /></div>
      </header>
      {msg && <p role="status" className="mt-4 rounded-[10px] bg-sand-100 px-4 py-2 text-sm">{msg}</p>}
      <div className="mt-6 flex flex-col gap-3">
        {jobs.length === 0 && <p className="text-sm text-gray-600">No jobs yet. <Link href="/recruiter/jobs/new" className="font-semibold text-bronze-deep">Post your first job</Link>.</p>}
        {jobs.map((j) => (
          <section key={j.id} className="rounded-2xl border border-line bg-white p-5">
            <button className="flex w-full items-center justify-between text-left" onClick={() => setOpen(open === j.id ? null : j.id)}>
              <span className="font-semibold text-gray-800">{j.title} <span className="ml-2 text-sm font-normal text-gray-600">{j.status} · posted {j.posted.slice(0, 10)}</span></span>
              <span className="text-sm text-gray-600">{j.applications.length} application{j.applications.length === 1 ? "" : "s"}</span>
            </button>
            {open === j.id && (
              <ul className="mt-3 divide-y divide-line text-sm">
                {j.applications.length === 0 && <li className="py-2 text-gray-600">No applications yet.</li>}
                {j.applications.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                    <span>
                      {a.name} <span className="text-gray-600">&lt;{a.email}&gt;</span>
                      {a.matchScore != null && <b className="ml-2 text-bronze-deep">{a.matchScore}% match</b>}
                      {a.note && <span className="block text-gray-600">“{a.note}”</span>}
                    </span>
                    <select disabled={!canManage} value={a.status} onChange={(e) => void setStatus(j.id, a.id, e.target.value)} className="rounded-[10px] border border-line px-3 py-1.5 text-sm" aria-label={`Status for ${a.name}`}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
