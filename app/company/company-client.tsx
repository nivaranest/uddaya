"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { LogoutLink } from "@/components/logout-link";

type Member = { userId: string; name: string; email: string; isCompanyAdmin: boolean; isActive: boolean; hiringRole: string | null; canPostJobs: boolean; canManageApplications: boolean; canScheduleInterviews: boolean; canSendOffers: boolean };
type Data = { company: string; me: string; license: { planType: string; status: string; jobsLimit: number | null; candidateSearchLimit: number | null; teamMembersLimit: number | null; expiresAt: string | null } | null; team: Member[] };

const PERMS = [["canPostJobs", "Post jobs"], ["canManageApplications", "Manage applications"], ["canScheduleInterviews", "Schedule interviews"], ["canSendOffers", "Send offers"]] as const;
const input = "rounded-[10px] border border-line px-3 py-2 text-[14px]";
const lim = (n: number | null) => (n == null ? "unlimited" : String(n));

export function CompanyClient() {
  const [data, setData] = useState<Data | null>(null);
  const [denied, setDenied] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/company/team");
    if (res.status === 403) return setDenied(true);
    if (res.ok) setData(await res.json());
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function call(url: string, method: string, body: unknown, ok: string, form?: HTMLFormElement) {
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await res.json().catch(() => ({}));
    setMsg(res.ok ? ok : j.error ?? "Failed");
    if (res.ok) { form?.reset(); await load(); }
  }

  const l = data?.license;
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3"><Logo href="/recruiter" /><span className="rounded-full bg-sand-100 px-3 py-1 text-sm font-semibold text-bronze-deep">Company &amp; Team</span></div>
        <div className="flex gap-4 text-sm font-semibold text-gray-700"><Link href="/recruiter">Recruiter portal</Link><LogoutLink /></div>
      </header>

      {denied && <p className="mt-6 rounded-[10px] bg-sand-100 px-4 py-3 text-sm">Only your company&apos;s admin can manage the team. Ask them, or contact Uddaya.</p>}
      {msg && <p role="status" className="mt-4 rounded-[10px] bg-sand-100 px-4 py-2 text-sm">{msg}</p>}

      {data && (
        <>
          <section className="mt-6 rounded-2xl border border-line bg-white p-5">
            <h2 className="font-display text-lg font-semibold text-gray-800">{data.company}</h2>
            {l ? (
              <p className={`mt-1 text-sm ${l.status === "active" ? "text-forest" : "text-red-600"}`}>
                {l.planType} licence · {l.status} · jobs {lim(l.jobsLimit)} · searches {lim(l.candidateSearchLimit)} · team {data.team.length}/{lim(l.teamMembersLimit)}
                {l.expiresAt && ` · expires ${l.expiresAt.slice(0, 10)}`}
              </p>
            ) : <p className="mt-1 text-sm text-red-600">No licence. Contact Uddaya to get one.</p>}
          </section>

          <section className="mt-4 rounded-2xl border border-line bg-white p-5">
            <h3 className="font-semibold text-gray-800">Team</h3>
            <ul className="mt-2 divide-y divide-line">
              {data.team.map((m) => (
                <li key={m.userId} className="py-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>{m.name} <span className="text-gray-600">&lt;{m.email}&gt;</span>{m.isCompanyAdmin && <b className="ml-2 text-bronze-deep">company admin</b>}{!m.isActive && <b className="ml-2 text-red-600">disabled</b>}</span>
                    {!m.isCompanyAdmin && <button className="font-semibold text-gray-700" onClick={() => void call(`/api/company/team/${m.userId}`, "PATCH", { isActive: !m.isActive }, m.isActive ? "Disabled" : "Enabled")}>{m.isActive ? "Disable" : "Enable"}</button>}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
                    {PERMS.map(([k, label]) => (
                      <label key={k} className="flex items-center gap-1.5">
                        <input type="checkbox" checked={m[k]} disabled={m.isCompanyAdmin} onChange={(e) => void call(`/api/company/team/${m.userId}`, "PATCH", { [k]: e.target.checked }, "Permissions updated")} /> {label}
                      </label>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-4 rounded-2xl border border-line bg-white p-5">
            <h3 className="font-semibold text-gray-800">Add a recruiter</h3>
            <form className="mt-2 grid gap-2 sm:grid-cols-5" onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); void call("/api/company/team", "POST", { name: f.get("name"), email: f.get("email"), password: f.get("password"), hiringRole: f.get("hiringRole") || undefined }, "Recruiter added", e.currentTarget); }}>
              <input name="name" required placeholder="Name" className={input} />
              <input name="email" type="email" required placeholder="Email" className={input} />
              <input name="password" required minLength={8} placeholder="Password (min 8)" className={input} />
              <input name="hiringRole" placeholder="Role (optional)" className={input} />
              <button className="btn-primary rounded-[10px] px-4 py-2 text-[15px]">Add</button>
            </form>
            <p className="mt-2 text-xs text-gray-600">Share the password with them securely. They can&apos;t change it yet.</p>
          </section>
        </>
      )}
    </main>
  );
}
