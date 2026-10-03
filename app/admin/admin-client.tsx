"use client";

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Logo } from "@/components/logo";
import { LogoutLink } from "@/components/logout-link";

type Perms = { canPostJobs: boolean; canManageApplications: boolean; canScheduleInterviews: boolean; canSendOffers: boolean };
type Recruiter = Perms & { userId: string; name: string; email: string; isCompanyAdmin: boolean; isActive: boolean };
type License = { planType: string; status: string; jobsLimit: number | null; candidateSearchLimit: number | null; teamMembersLimit: number | null; priceMonthly: number; billingCycle: string; expiresAt: string | null };
type Company = { id: string; isActive: boolean; name: string; website: string | null; industry: string | null; license: License | null; recruiters: Recruiter[] };
type Plan = { planType: string; name: string; priceMonthly: number; jobsLimit: number | null; candidateSearchLimit: number | null; teamMembersLimit: number | null; trialDays: number };
type User = { id: string; name: string; email: string; role: string; company: string | null; status: string; createdAt: string };
type AdminJob = { id: string; title: string; company: string; postedBy: string; status: string; removedByAdmin: boolean; applications: number; postedAt: string };
type Dash = { jobs: Record<string, number>; users: Record<string, number>; companies: Record<string, number>; licences: Record<string, number>; signups: { date: string; candidates: number; recruiters: number }[] };
type Log = { id: string; actorEmail: string; action: string; targetType: string; targetId: string | null; details: unknown; createdAt: string };

const input = "rounded-[10px] border border-line px-3 py-2 text-[14px]";
const card = "rounded-2xl border border-line bg-white p-5";
const lim = (n: number | null) => (n == null ? "unlimited" : String(n));
const PERMS: [keyof Perms, string][] = [["canPostJobs", "Post jobs"], ["canManageApplications", "Applications"], ["canScheduleInterviews", "Interviews"], ["canSendOffers", "Offers"]];
const TABS = ["Overview", "Companies", "Jobs", "Users", "Plans", "Audit log"] as const;

async function api(url: string, method = "GET", body?: unknown) {
  const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data, error: data?.error as string | undefined };
}

/** "" -> undefined (use default), "unlimited" -> null, else a number. */
function num(v: FormDataEntryValue | null): number | null | undefined {
  const s = String(v ?? "").trim();
  if (s === "") return undefined;
  return s.toLowerCase() === "unlimited" ? null : Number(s);
}

function Stat({ label, value, warn }: { label: string; value: number | undefined; warn?: boolean }) {
  return (
    <div className={card}>
      <div className={`font-display text-3xl font-semibold ${warn && value ? "text-red-600" : "text-gray-800"}`}>{value ?? "–"}</div>
      <div className="mt-1 text-sm text-gray-600">{label}</div>
    </div>
  );
}

function LicenseFields({ l }: { l?: License | null }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <select name="planType" defaultValue={l?.planType ?? "starter"} className={input}><option value="starter">Starter</option><option value="professional">Professional</option><option value="enterprise">Enterprise</option></select>
      <select name="billingCycle" defaultValue={l?.billingCycle ?? "monthly"} className={input}><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="annual">Annual</option></select>
      <input name="priceMonthly" placeholder="₹/month (plan default)" defaultValue={l?.priceMonthly} className={input} />
      <input name="expiresAt" type="date" defaultValue={l?.expiresAt?.slice(0, 10)} title="Expiry (blank = none)" className={input} />
      <input name="jobsLimit" placeholder="Job slots (blank = plan default)" className={input} />
      <input name="candidateSearchLimit" placeholder="Searches / month" className={input} />
      <input name="teamMembersLimit" placeholder="Team members" className={input} />
    </div>
  );
}

function licenseBody(f: FormData) {
  const exp = String(f.get("expiresAt") ?? "");
  return {
    planType: f.get("planType"), status: f.get("status") ?? "active", billingCycle: f.get("billingCycle"),
    priceMonthly: num(f.get("priceMonthly")) ?? undefined,
    jobsLimit: num(f.get("jobsLimit")), candidateSearchLimit: num(f.get("candidateSearchLimit")), teamMembersLimit: num(f.get("teamMembersLimit")),
    expiresAt: exp ? new Date(exp).toISOString() : null,
  };
}

export function AdminClient() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const [msg, setMsg] = useState("");
  const [dash, setDash] = useState<Dash | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [expOnly, setExpOnly] = useState(false);
  const [uq, setUq] = useState({ q: "", role: "", status: "" });

  const loadUsers = useCallback(async () => {
    const p = new URLSearchParams(Object.entries(uq).filter(([, v]) => v));
    const r = await api(`/api/admin/users?${p}`);
    if (r.ok) setUsers(r.data);
  }, [uq]);

  const loadAll = useCallback(async () => {
    const [d, c, p, l, j] = await Promise.all([api("/api/admin/dashboard"), api("/api/admin/companies"), api("/api/admin/plans"), api("/api/admin/audit"), api("/api/admin/jobs")]);
    if (j.ok) setJobs(j.data);
    if (d.ok) setDash(d.data);
    if (c.ok) setCompanies(c.data);
    if (p.ok) setPlans(p.data);
    if (l.ok) setLogs(l.data);
  }, []);

  useEffect(() => { void loadAll(); }, [loadAll]);
  useEffect(() => { void loadUsers(); }, [loadUsers]);

  async function run(url: string, method: string, body: unknown, ok: string, form?: HTMLFormElement) {
    const r = await api(url, method, body);
    setMsg(r.ok ? ok : r.error ?? "Failed");
    if (r.ok) { form?.reset(); await Promise.all([loadAll(), loadUsers()]); }
  }

  const soon = Date.now() + 30 * 86400_000;
  const shown = companies.filter((c) => !expOnly || (c.license?.expiresAt && new Date(c.license.expiresAt).getTime() < soon) || c.license?.status === "expired");
  const BTN = "font-semibold text-gray-700 hover:text-bronze-deep";

  const Row = ({ children }: { children: ReactNode }) => <li className="flex flex-wrap items-center justify-between gap-2 py-2">{children}</li>;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3"><Logo /><span className="rounded-full bg-sand-100 px-3 py-1 text-sm font-semibold text-bronze-deep">Admin Portal</span></div>
        <LogoutLink className="text-sm font-semibold text-gray-700" />
      </header>
      <nav className="mt-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-[10px] border px-4 py-2 text-sm font-semibold ${tab === t ? "border-bronze bg-sand-100 text-bronze-deep" : "border-line text-gray-700"}`}>{t}</button>
        ))}
      </nav>
      {msg && <p role="status" className="mt-4 rounded-[10px] bg-sand-100 px-4 py-2 text-sm text-gray-800">{msg}</p>}

      {tab === "Overview" && dash && (
        <div className="mt-5 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Total users" value={dash.users.total} />
            <Stat label="Candidates" value={dash.users.candidates} />
            <Stat label="Recruiters" value={dash.users.recruiters} />
            <Stat label="Suspended / deleted users" value={dash.users.suspended} warn />
            <Stat label="Companies" value={dash.companies.total} />
            <Stat label="Unlicensed companies" value={dash.companies.unlicensed} warn />
            <Stat label="Active licences" value={dash.licences.active} />
            <Stat label="Expiring in 30 days" value={dash.licences.expiringSoon} warn />
            <Stat label="Active jobs" value={dash.jobs.active} />
            <Stat label="Total jobs" value={dash.jobs.total} />
            <Stat label="Applications (all time)" value={dash.jobs.applications} />
            <Stat label="Applications (30 days)" value={dash.jobs.applicationsLast30} />
          </div>
          <section className={card}>
            <h2 className="font-display text-lg font-semibold text-gray-800">Sign-ups, last 30 days</h2>
            <div className="mt-3 flex h-32 items-end gap-1" role="img" aria-label="Daily sign-ups">
              {dash.signups.map((d) => {
                const max = Math.max(1, ...dash.signups.map((x) => x.candidates + x.recruiters));
                return (
                  <div key={d.date} title={`${d.date}: ${d.candidates} candidates, ${d.recruiters} recruiters`} className="flex flex-1 flex-col justify-end">
                    <div className="bg-bronze" style={{ height: `${(d.recruiters / max) * 100}%` }} />
                    <div className="bg-gray-800" style={{ height: `${(d.candidates / max) * 100}%` }} />
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-gray-600"><span className="text-gray-800">■</span> candidates <span className="ml-3 text-bronze">■</span> recruiters.</p>
          </section>
        </div>
      )}

      {tab === "Companies" && (
        <div className="mt-5">
          <section className={card}>
            <h2 className="font-display text-lg font-semibold text-gray-800">Register a company</h2>
            <form className="mt-3 flex flex-col gap-3" onSubmit={(e: FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              void run("/api/admin/companies", "POST", {
                name: f.get("name"), website: f.get("website") || undefined, industry: f.get("industry") || undefined,
                adminName: f.get("adminName"), adminEmail: f.get("adminEmail"), adminPassword: f.get("adminPassword"),
                license: f.get("issue") === "on" ? licenseBody(f) : undefined,
              }, "Company created", e.currentTarget);
            }}>
              <div className="grid gap-2 sm:grid-cols-3">
                <input name="name" required placeholder="Company name" className={input} />
                <input name="website" placeholder="Website" className={input} />
                <input name="industry" placeholder="Industry" className={input} />
                <input name="adminName" required placeholder="Company admin name" className={input} />
                <input name="adminEmail" type="email" required placeholder="Company admin email" className={input} />
                <input name="adminPassword" required minLength={8} placeholder="Initial password (min 8)" className={input} />
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="issue" defaultChecked /> Issue a licence now</label>
              <LicenseFields />
              <button className="btn-primary w-fit rounded-[10px] px-5 py-2 text-[15px]">Create company</button>
            </form>
          </section>

          <div className="mt-6 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-gray-800">Companies ({shown.length})</h2>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={expOnly} onChange={(e) => setExpOnly(e.target.checked)} /> Expiring within 30 days or expired</label>
          </div>
          <div className="mt-3 flex flex-col gap-3">
            {shown.map((c) => (
              <section key={c.id} className={card}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-800">{c.name}{!c.isActive && <b className="ml-2 text-red-600">suspended</b>}</h3>
                    <p className="text-sm text-gray-600">{[c.industry, c.website].filter(Boolean).join(" · ") || "—"}</p>
                  </div>
                  <div className="text-right text-sm">
                    {c.license ? (
                      <span className={c.license.status === "active" ? "text-forest" : "text-red-600"}>
                        {c.license.planType} · {c.license.status} · jobs {lim(c.license.jobsLimit)} · searches {lim(c.license.candidateSearchLimit)} · team {lim(c.license.teamMembersLimit)}
                        {c.license.expiresAt && ` · expires ${c.license.expiresAt.slice(0, 10)}`}
                      </span>
                    ) : <span className="text-red-600">No licence</span>}
                  </div>
                </div>
                <button className="mt-3 text-sm font-semibold text-bronze-deep" onClick={() => setOpen(open === c.id ? null : c.id)}>{open === c.id ? "Close" : "Manage"}</button>
                {open === c.id && (
                  <div className="mt-3 flex flex-col gap-5">
                    <ul className="divide-y divide-line text-sm">
                      {c.recruiters.map((r) => (
                        <li key={r.userId} className="py-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span>{r.name} <span className="text-gray-600">&lt;{r.email}&gt;</span>{r.isCompanyAdmin && <b className="ml-2 text-bronze-deep">company admin</b>}{!r.isActive && <b className="ml-2 text-red-600">disabled</b>}</span>
                            <span className="flex gap-3">
                              <button className={BTN} onClick={() => void run(`/api/admin/users/${r.userId}`, "PATCH", { isActive: !r.isActive }, r.isActive ? "User suspended" : "User reactivated")}>{r.isActive ? "Suspend" : "Reactivate"}</button>
                              {!r.isCompanyAdmin && (
                                <select defaultValue="" className="text-sm" onChange={(e) => e.target.value && void run(`/api/admin/recruiters/${r.userId}`, "PATCH", { companyId: e.target.value }, "Recruiter moved")}>
                                  <option value="">Move to…</option>
                                  {companies.filter((x) => x.id !== c.id).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                                </select>
                              )}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-x-4">
                            {PERMS.map(([k, label]) => (
                              <label key={k} className="flex items-center gap-1.5 text-gray-700"><input type="checkbox" checked={r[k]} onChange={(e) => void run(`/api/admin/recruiters/${r.userId}`, "PATCH", { [k]: e.target.checked }, "Permissions updated")} /> {label}</label>
                            ))}
                          </div>
                        </li>
                      ))}
                    </ul>
                    <form className="flex flex-col gap-2" onSubmit={(e) => { e.preventDefault(); void run(`/api/admin/companies/${c.id}/license`, "PUT", licenseBody(new FormData(e.currentTarget)), "Licence saved"); }}>
                      <h4 className="text-sm font-semibold">{c.license ? "Update licence" : "Issue licence"}</h4>
                      <LicenseFields l={c.license} />
                      <div className="flex flex-wrap gap-2">
                        <select name="status" defaultValue={c.license?.status ?? "active"} className={input}><option value="active">Active</option><option value="canceled">Revoked</option><option value="expired">Expired</option></select>
                        <button className="btn-primary rounded-[10px] px-5 py-2 text-[15px]">Save licence</button>
                        {c.license && [1, 12].map((m) => <button key={m} type="button" className="rounded-[10px] border border-line px-4 py-2 text-sm font-semibold" onClick={() => void run(`/api/admin/companies/${c.id}/license/renew`, "POST", { months: m }, `Renewed +${m} month${m > 1 ? "s" : ""}`)}>Renew +{m === 12 ? "1 year" : "1 month"}</button>)}
                      </div>
                    </form>
                    <form className="grid gap-2 sm:grid-cols-5" onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); void run(`/api/admin/companies/${c.id}/recruiters`, "POST", { name: f.get("name"), email: f.get("email"), password: f.get("password"), hiringRole: f.get("hiringRole") || undefined }, "Recruiter added", e.currentTarget); }}>
                      <input name="name" required placeholder="Recruiter name" className={input} />
                      <input name="email" type="email" required placeholder="Email" className={input} />
                      <input name="password" required minLength={8} placeholder="Password (min 8)" className={input} />
                      <input name="hiringRole" placeholder="Role (optional)" className={input} />
                      <button className="btn-primary rounded-[10px] px-4 py-2 text-[15px]">Add recruiter</button>
                    </form>
                    <form className="grid gap-2 sm:grid-cols-4" onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); void run(`/api/admin/companies/${c.id}`, "PATCH", { name: f.get("name"), website: f.get("website") || null, industry: f.get("industry") || null }, "Company updated"); }}>
                      <input name="name" required defaultValue={c.name} className={input} />
                      <input name="website" defaultValue={c.website ?? ""} placeholder="Website" className={input} />
                      <input name="industry" defaultValue={c.industry ?? ""} placeholder="Industry" className={input} />
                      <button className="rounded-[10px] border border-line px-4 py-2 text-sm font-semibold">Save details</button>
                    </form>
                    <div className="flex gap-4 text-sm">
                      <button className={BTN} onClick={() => void run(`/api/admin/companies/${c.id}`, "PATCH", { isActive: !c.isActive }, c.isActive ? "Company suspended" : "Company reactivated")}>{c.isActive ? "Suspend company" : "Reactivate company"}</button>
                      <button className="font-semibold text-red-600" onClick={() => confirm(`Delete ${c.name} and disable its recruiters?`) && void run(`/api/admin/companies/${c.id}`, "DELETE", undefined, "Company deleted")}>Delete company</button>
                    </div>
                  </div>
                )}
              </section>
            ))}
            {shown.length === 0 && <p className="text-sm text-gray-600">No companies.</p>}
          </div>
        </div>
      )}

      {tab === "Jobs" && (
        <section className={`${card} mt-5`}>
          <ul className="divide-y divide-line text-sm">
            {jobs.map((j) => (
              <Row key={j.id}>
                <span>
                  <b>{j.title}</b> · {j.company} · {j.applications} application{j.applications === 1 ? "" : "s"} · posted by {j.postedBy} ·{" "}
                  <b className={j.removedByAdmin ? "text-red-600" : j.status === "active" ? "text-forest" : "text-gray-600"}>{j.removedByAdmin ? "taken down" : j.status}</b>
                </span>
                <button className={j.removedByAdmin ? BTN : "font-semibold text-red-600"} onClick={() => void run(`/api/admin/jobs/${j.id}`, "PATCH", { removed: !j.removedByAdmin }, j.removedByAdmin ? "Job restored" : "Job taken down")}>
                  {j.removedByAdmin ? "Restore" : "Take down"}
                </button>
              </Row>
            ))}
            {jobs.length === 0 && <li className="py-2 text-gray-600">No jobs posted yet.</li>}
          </ul>
        </section>
      )}

      {tab === "Users" && (
        <div className="mt-5 flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <input value={uq.q} onChange={(e) => setUq({ ...uq, q: e.target.value })} placeholder="Search name, email or company" className={`${input} min-w-[240px] flex-1`} />
            <select value={uq.role} onChange={(e) => setUq({ ...uq, role: e.target.value })} className={input}><option value="">All roles</option><option value="candidate">Candidates</option><option value="recruiter">Recruiters</option><option value="admin">Admins</option></select>
            <select value={uq.status} onChange={(e) => setUq({ ...uq, status: e.target.value })} className={input}><option value="">Any status</option><option value="active">Active</option><option value="suspended">Suspended</option><option value="deleted">Deleted</option></select>
          </div>
          <section className={card}>
            <ul className="divide-y divide-line text-sm">
              {users.map((u) => (
                <Row key={u.id}>
                  <span>{u.name} <span className="text-gray-600">&lt;{u.email}&gt;</span> · {u.role}{u.company && ` · ${u.company}`} · <b className={u.status === "active" ? "text-forest" : "text-red-600"}>{u.status}</b></span>
                  <span className="flex gap-3">
                    {u.status === "active" && <button className={BTN} onClick={() => void run(`/api/admin/users/${u.id}`, "PATCH", { isActive: false }, "User suspended")}>Suspend</button>}
                    {u.status === "suspended" && <button className={BTN} onClick={() => void run(`/api/admin/users/${u.id}`, "PATCH", { isActive: true }, "User reactivated")}>Reactivate</button>}
                    {u.status !== "deleted" ? <button className="font-semibold text-red-600" onClick={() => confirm(`Delete ${u.email}?`) && void run(`/api/admin/users/${u.id}`, "PATCH", { deleted: true }, "User deleted")}>Delete</button> : <button className={BTN} onClick={() => void run(`/api/admin/users/${u.id}`, "PATCH", { deleted: false }, "User restored")}>Restore</button>}
                    <button className={BTN} onClick={() => { const p = prompt(`New password for ${u.email} (min 8 characters)`); if (p) void run(`/api/admin/users/${u.id}`, "PATCH", { newPassword: p }, "Password reset"); }}>Reset password</button>
                  </span>
                </Row>
              ))}
              {users.length === 0 && <li className="py-2 text-gray-600">No users match.</li>}
            </ul>
          </section>
          <section className={card}>
            <h3 className="font-semibold text-gray-800">Add a portal admin</h3>
            <form className="mt-2 grid gap-2 sm:grid-cols-4" onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); void run("/api/admin/admins", "POST", { name: f.get("name"), email: f.get("email"), password: f.get("password") }, "Admin added", e.currentTarget); }}>
              <input name="name" required placeholder="Name" className={input} />
              <input name="email" type="email" required placeholder="Email" className={input} />
              <input name="password" required minLength={8} placeholder="Password (min 8)" className={input} />
              <button className="btn-primary rounded-[10px] px-4 py-2 text-[15px]">Add admin</button>
            </form>
          </section>
        </div>
      )}

      {tab === "Plans" && (
        <div className="mt-5 flex flex-col gap-4">
          <p className="text-sm text-gray-600">Plan defaults apply to licences issued from now on and to trials. Existing licences keep their values. Leave a limit as &quot;unlimited&quot; for no cap. A plan with trial days is given automatically to companies that register themselves.</p>
          {plans.map((p) => (
            <form key={p.planType} className={`${card} grid gap-2 sm:grid-cols-6`} onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const n = (k: string) => (String(f.get(k)).trim().toLowerCase() === "unlimited" ? null : Number(f.get(k)));
              void run("/api/admin/plans", "PUT", { planType: p.planType, name: f.get("name"), priceMonthly: Number(f.get("priceMonthly")), jobsLimit: n("jobsLimit"), candidateSearchLimit: n("candidateSearchLimit"), teamMembersLimit: n("teamMembersLimit"), trialDays: Number(f.get("trialDays")) }, `${p.name} saved`);
            }}>
              <input name="name" defaultValue={p.name} title="Name" className={input} />
              <input name="priceMonthly" defaultValue={p.priceMonthly} title="₹ per month" className={input} />
              <input name="jobsLimit" defaultValue={lim(p.jobsLimit)} title="Job slots" className={input} />
              <input name="candidateSearchLimit" defaultValue={lim(p.candidateSearchLimit)} title="Searches / month" className={input} />
              <input name="teamMembersLimit" defaultValue={lim(p.teamMembersLimit)} title="Team members" className={input} />
              <input name="trialDays" defaultValue={p.trialDays} title="Trial days (0 = no trial)" className={input} />
              <p className="text-xs text-gray-600 sm:col-span-6">{p.planType}: name · ₹/month · job slots · searches · team members · trial days</p>
              <button className="btn-primary w-fit rounded-[10px] px-5 py-2 text-[15px] sm:col-span-6">Save</button>
            </form>
          ))}
        </div>
      )}

      {tab === "Audit log" && (
        <section className={`${card} mt-5`}>
          <ul className="divide-y divide-line text-sm">
            {logs.map((l) => (
              <li key={l.id} className="py-2">
                <b>{l.action}</b> · {l.targetType}{l.targetId && ` ${l.targetId.slice(0, 8)}`} · by {l.actorEmail} · <span className="text-gray-600">{new Date(l.createdAt).toLocaleString()}</span>
                {l.details != null && <div className="truncate text-xs text-gray-600">{JSON.stringify(l.details)}</div>}
              </li>
            ))}
            {logs.length === 0 && <li className="py-2 text-gray-600">No admin actions yet.</li>}
          </ul>
        </section>
      )}
    </main>
  );
}
