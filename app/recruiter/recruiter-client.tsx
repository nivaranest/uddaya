"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Dropdown } from "@/components/dropdown";
import { Icon } from "@/components/icon";
import { Logo } from "@/components/logo";
import { MenuButton, NavItem, Sidebar } from "@/components/sidebar";
import { Toast, useToast } from "@/components/toast";
import { PIPELINE_CARDS, PIPELINE_TOTALS, RECRUITER, RECRUITER_JOBS, type PipelineCard, type PipelineStage } from "@/lib/data";
import { cx } from "@/lib/format";

const STAGES: { id: PipelineStage; name: string; color: string }[] = [
  { id: "new", name: "New", color: "#B07A48" },
  { id: "screen", name: "Screening", color: "#4A6490" },
  { id: "interview", name: "Interview", color: "#E3C08A" },
  { id: "offer", name: "Offer", color: "#8FC3A8" },
];

const NAV: { icon: string; label: string; href: string; active?: boolean }[] = [
  { icon: "home", label: "Dashboard", href: "#", active: true },
  { icon: "work", label: "My Jobs", href: "#jobs" },
  { icon: "inbox", label: "Applications", href: "#pipeline" },
  { icon: "chat", label: "Messages", href: "#" },
  { icon: "group", label: "Team", href: "#" },
  { icon: "bar_chart", label: "Analytics", href: "#analytics" },
  { icon: "credit_card", label: "Billing", href: "#" },
  { icon: "settings", label: "Settings", href: "#" },
];

/** Time-to-hire trend, days (last 30 days). */
const TTH_POINTS = [70, 64, 80, 76, 96, 90, 110, 104, 120, 126, 132];

export function RecruiterClient() {
  const [menu, setMenu] = useState(false);
  const [user, setUser] = useState(false);
  const [jobs, setJobs] = useState(RECRUITER_JOBS);
  const [cards, setCards] = useState<PipelineCard[]>(PIPELINE_CARDS);
  const [dragId, setDragId] = useState<number | null>(null);
  const [dropCol, setDropCol] = useState<PipelineStage | null>(null);
  const [toast, showToast] = useToast();
  const closeUser = useCallback(() => setUser(false), []);

  const activeCount = jobs.filter((j) => j.active).length;

  const stageCount = (id: PipelineStage) =>
    PIPELINE_TOTALS[id] + cards.filter((c) => c.col === id).length - cards.filter((c) => (c.orig ?? c.col) === id).length;

  function drop(id: PipelineStage, name: string) {
    if (dragId == null) return;
    setCards((cs) =>
      cs.map((c) =>
        c.id === dragId && c.col !== id
          ? { ...c, orig: c.orig ?? c.col, col: id, scheduled: id === "interview" || c.scheduled, meta: `Moved to ${name} just now` }
          : c,
      ),
    );
    setDropCol(null);
    setDragId(null);
    showToast(`Moved to ${name}`);
  }

  const points = TTH_POINTS.map((y, i) => `${i * 60},${y}`).join(" ");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-white">
        <div className="flex h-[66px] items-center gap-2.5 px-4 py-3 sm:gap-3.5 sm:px-5">
          <MenuButton onClick={() => setMenu((m) => !m)} />
          <Logo />
          <span className="hidden rounded-full bg-sand-100 px-2.5 py-1 text-[13px] font-semibold text-bronze-deep sm:inline">Recruiter Portal</span>
          <div className="ml-auto flex items-center gap-2.5">
            <button
              onClick={() => showToast("2 new applications today")}
              aria-label="Notifications"
              className="flex h-[42px] w-[42px] cursor-pointer items-center justify-center rounded-xl border border-line bg-white"
            >
              <Icon name="notifications" className="text-[22px]" />
            </button>
            <Dropdown
              open={user}
              onClose={closeUser}
              className="flex w-[220px] flex-col p-1.5"
              trigger={
                <button
                  onClick={() => setUser((u) => !u)}
                  aria-label="Account menu"
                  className="flex h-[42px] cursor-pointer items-center gap-2 rounded-xl border border-line bg-white py-1 pl-1 pr-2.5"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-gray-800 font-display text-[13px] font-semibold text-white">
                    {RECRUITER.initials}
                  </span>
                  <Icon name="expand_more" className="text-[20px] text-gray-500" />
                </button>
              }
            >
              <span className="px-3 py-2.5 text-[13px] text-gray-500">
                {RECRUITER.name} · {RECRUITER.company}
              </span>
              <Link href="/dashboard" className="rounded-lg px-3 py-2.5 text-sm text-gray-800 hover:bg-gray-50 hover:text-gray-800">Switch to Candidate</Link>
              <Link href="/" className="rounded-lg px-3 py-2.5 text-sm text-red-700 hover:bg-red-50 hover:text-red-700">Log out</Link>
            </Dropdown>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <Sidebar open={menu} onClose={() => setMenu(false)} top={66} className="gap-1 bg-gray-50">
          <Link href="/recruiter/jobs/new" className="btn-primary mb-2.5 flex items-center justify-center gap-2 rounded-xl p-3 text-[15px]">
            <Icon name="add" className="text-[20px]" />
            Post New Job
          </Link>
          {NAV.map((n) => (
            <NavItem
              key={n.label}
              icon={n.icon}
              label={n.label}
              href={n.href}
              active={n.active}
              onClick={(e) => {
                setMenu(false);
                if (n.href === "#") {
                  e.preventDefault();
                  if (!n.active) showToast(`${n.label} is coming soon`);
                }
              }}
            />
          ))}
        </Sidebar>

        <main className="flex min-w-0 flex-1 flex-col gap-9 bg-white px-6 pb-16 pt-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="m-0 font-display text-[28px] font-semibold tracking-[-0.02em]">Hiring overview</h1>
              <p className="m-0 text-[15px] text-gray-600">{RECRUITER.company} · Last 30 days</p>
            </div>
            {activeCount >= RECRUITER.planJobSlots && (
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-sand-line bg-sand-50 px-3.5 py-2.5 text-sm">
                <span>
                  {activeCount} of {RECRUITER.planJobSlots} job slots used
                </span>
                <a href="#" onClick={(e) => { e.preventDefault(); showToast("Plan upgrades are coming soon"); }} className="font-semibold text-bronze-dark">
                  Upgrade plan to post more jobs
                </a>
              </div>
            )}
          </div>

          <section className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(210px,1fr))]">
            <StatCard title="Jobs Posted" icon="trending_up" iconCls="text-sage" value={activeCount} valueCls="text-bronze" caption="Active Job Posts">
              <svg width="72" height="24" viewBox="0 0 72 24" aria-hidden="true">
                <polyline points="0,20 12,18 24,19 36,12 48,13 60,6 72,4" fill="none" stroke="#B07A48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </StatCard>
            <StatCard title="Applications Received" icon="trending_up" iconCls="text-sage" value={42} valueCls="text-gray-800" caption="Total Applications" />
            <StatCard title="To Interview" icon="event" iconCls="text-bronze-dark" value={8} valueCls="text-bronze" caption="Candidates to Interview" note="Next interview: Tomorrow at 2 PM" />
            <StatCard title="Hired" icon="task_alt" iconCls="text-sage" value={2} valueCls="text-forest" caption="Offers Accepted" note="Last hired: 3 days ago" />
          </section>

          <section id="jobs" className="flex scroll-mt-24 flex-col gap-3.5">
            <h2 className="m-0 font-display text-lg font-semibold">Your Job Posts</h2>
            <div className="overflow-x-auto rounded-[10px] border border-line">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs uppercase tracking-[0.05em] text-gray-500">
                    {["Job Title", "Applications", "Views", "Status", "Posted"].map((h) => (
                      <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                    ))}
                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((j, i) => (
                    <tr key={j.title} className="group border-t border-gray-100 bg-white hover:bg-sand-50">
                      <td className="px-4 py-3.5 font-semibold">{j.title}</td>
                      <td className="px-4 py-3.5">{j.apps}</td>
                      <td className="px-4 py-3.5 text-gray-600">{j.views.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3.5">
                        <span className={cx("rounded-full px-2.5 py-1 text-xs font-semibold", j.active ? "bg-mint-soft text-forest-dark" : "bg-gray-100 text-gray-500")}>
                          {j.active ? "Active" : "Closed"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600">{j.posted}</td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="inline-flex gap-1.5 opacity-[.35] transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                          <Link href="/recruiter/jobs/new" className="rounded-lg border border-line px-2.5 py-1.5 text-[13px] text-gray-800 hover:border-line-hover hover:text-gray-800">Edit</Link>
                          <button
                            onClick={() => {
                              setJobs((js) => js.map((x, k) => (k === i ? { ...x, active: !x.active } : x)));
                              showToast(j.active ? `${j.title} closed` : `${j.title} reopened`);
                            }}
                            className="cursor-pointer rounded-lg border border-line bg-white px-2.5 py-1.5 text-[13px] text-gray-800"
                          >
                            {j.active ? "Close" : "Reopen"}
                          </button>
                          <a href="#analytics" className="rounded-lg border border-line px-2.5 py-1.5 text-[13px] text-gray-800 hover:border-line-hover hover:text-gray-800">Analytics</a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="pipeline" className="flex scroll-mt-24 flex-col gap-3.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="m-0 font-display text-lg font-semibold">Application Pipeline</h2>
              <span className="text-[13px] text-gray-500">Drag cards between stages</span>
            </div>
            <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(230px,1fr))]">
              {STAGES.map((st) => {
                const over = dropCol === st.id;
                return (
                  <div
                    key={st.id}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (!over) setDropCol(st.id);
                    }}
                    onDragLeave={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropCol(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      drop(st.id, st.name);
                    }}
                    className={cx("flex min-h-[220px] flex-col gap-2.5 rounded-[10px] p-3.5", over ? "bg-sand-50" : "bg-gray-50")}
                    style={{ borderTop: `4px solid ${st.color}`, outline: over ? `2px dashed ${st.color}` : "none" }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display text-[15px] font-semibold">{st.name}</span>
                      <span className="rounded-full border border-line bg-white px-2 py-0.5 text-xs text-gray-600">{stageCount(st.id)} applications</span>
                    </div>
                    {cards
                      .filter((c) => c.col === st.id)
                      .map((c) => (
                        <div
                          key={c.id}
                          draggable
                          tabIndex={0}
                          onDragStart={(e) => {
                            e.dataTransfer.effectAllowed = "move";
                            setDragId(c.id);
                          }}
                          onDragEnd={() => {
                            setDragId(null);
                            setDropCol(null);
                          }}
                          className="group flex cursor-grab flex-col gap-1 rounded-[10px] border border-line bg-white p-3 outline-bronze"
                        >
                          <div className="flex items-center gap-1.5">
                            {c.scheduled && st.id === "interview" && <span className="h-2 w-2 rounded-full bg-mint" />}
                            <span className="text-sm font-bold">{c.name}</span>
                          </div>
                          <span className="text-xs text-gray-600">{c.job}</span>
                          <span className="text-xs text-gray-500">{c.meta}</span>
                          {c.offer && st.id === "offer" && (
                            <span
                              className={cx(
                                "mt-1.5 self-start rounded-md px-2 py-[3px] text-xs font-semibold",
                                c.offer === "Accepted" ? "bg-mint-soft text-forest-dark" : "bg-sand-100 text-bronze-deep",
                              )}
                            >
                              {c.offer}
                            </span>
                          )}
                          <div className="mt-1.5 hidden flex-wrap gap-1.5 focus-within:flex group-hover:flex group-focus:flex [@media(hover:none)]:flex">
                            <button onClick={() => showToast(`Interview invite sent to ${c.name}`)} className="cursor-pointer rounded-md border border-line bg-gray-50 px-2 py-[5px] text-xs text-gray-800">
                              Schedule Interview
                            </button>
                            <button onClick={() => showToast(`Message sent to ${c.name}`)} className="cursor-pointer rounded-md border border-line bg-gray-50 px-2 py-[5px] text-xs text-gray-800">
                              Send Message
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                );
              })}
            </div>
          </section>

          <section id="analytics" className="flex scroll-mt-24 flex-wrap gap-6">
            <div className="flex min-w-0 flex-[2_1_420px] flex-col gap-4 rounded-xl border border-line p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="m-0 font-display text-lg font-semibold">Hiring Analytics</h2>
                <span className="text-[13px] text-gray-500">Time to hire, past 30 days</span>
              </div>
              <svg viewBox="0 0 600 200" className="h-auto w-full" preserveAspectRatio="none" role="img" aria-label="Time to hire trending down over the past 30 days">
                {[50, 100, 150].map((y) => (
                  <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="#F3F4F6" />
                ))}
                <polygon points={`0,200 ${points} 600,200`} fill="#FAF0DF" />
                <polyline points={points} fill="none" stroke="#B07A48" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Aug 30</span>
                <span>Sept 14</span>
                <span>Sept 29</span>
              </div>
              <div className="text-base">
                Average time to hire: <strong className="font-display text-bronze-dark">21 days</strong>
              </div>
            </div>
            <div className="flex flex-[1_1_260px] flex-col gap-4 rounded-xl border border-line p-6">
              <h3 className="m-0 font-display text-base font-semibold">Source breakdown</h3>
              <div className="flex h-3 overflow-hidden rounded-full">
                <span className="w-[40%] bg-gray-800" />
                <span className="w-[30%] bg-sand-200" />
                <span className="w-[30%] bg-mint" />
              </div>
              <div className="flex flex-col gap-2.5 text-sm">
                {[
                  ["LinkedIn", "40%", "bg-gray-800"],
                  ["Direct", "30%", "bg-sand-200"],
                  ["Referral", "30%", "bg-mint"],
                ].map(([label, pct, bg]) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className={cx("h-2.5 w-2.5 rounded-[3px]", bg)} />
                    {label}
                    <span className="ml-auto font-semibold">{pct}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>

      <Toast message={toast} />
    </div>
  );
}

type StatCardProps = {
  title: string;
  icon: string;
  iconCls: string;
  value: number;
  valueCls: string;
  caption: string;
  note?: string;
  children?: React.ReactNode;
};

function StatCard({ title, icon, iconCls, value, valueCls, caption, note, children }: StatCardProps) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-line bg-gray-50 p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-600">{title}</span>
        <Icon name={icon} className={cx("text-[22px]", iconCls)} />
      </div>
      <span className={cx("font-display text-4xl font-semibold leading-[1.1]", valueCls)}>{value}</span>
      <div className="flex items-end justify-between gap-2">
        <span className="text-[13px] text-gray-500">{caption}</span>
        {children}
      </div>
      {note && <span className="text-xs text-gray-700">{note}</span>}
    </div>
  );
}
