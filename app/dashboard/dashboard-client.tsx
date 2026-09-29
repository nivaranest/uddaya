"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { CompanyLogo } from "@/components/company-logo";
import { Dropdown } from "@/components/dropdown";
import { Icon } from "@/components/icon";
import { useLiveCandidateCount } from "@/components/live-counter";
import { Logo } from "@/components/logo";
import { ProgressRing } from "@/components/progress-ring";
import { MenuButton, NavItem, Sidebar } from "@/components/sidebar";
import { Toast, useToast } from "@/components/toast";
import { CANDIDATE, CANDIDATE_NOTIFICATIONS, FEATURED_JOB, JOBS } from "@/lib/data";
import { cx } from "@/lib/format";
import { profileCompletion } from "@/lib/profile";

const PROFILE_STEPS: [string, boolean][] = [
  ["Basic Info", true],
  ["Experience", true],
  ["Skills", true],
  ["Resume", true],
  ["Profile Photo", false],
];

export function DashboardClient({ initialQuery }: { initialQuery: string }) {
  const [q, setQ] = useState(initialQuery);
  const [menu, setMenu] = useState(false);
  const [bell, setBell] = useState(false);
  const [user, setUser] = useState(false);
  const [unread, setUnread] = useState(true);
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [applied, setApplied] = useState<Record<string, boolean>>({});
  const [featuredSaved, setFeaturedSaved] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [toast, showToast] = useToast();
  const counter = useLiveCandidateCount();

  const closeBell = useCallback(() => setBell(false), []);
  const closeUser = useCallback(() => setUser(false), []);

  const query = q.trim().toLowerCase();
  const jobs = useMemo(() => {
    let list = JOBS;
    if (query) list = list.filter((j) => `${j.title} ${j.company} ${j.location}`.toLowerCase().includes(query));
    if (savedOnly) list = list.filter((j) => saved[j.id]);
    return list;
  }, [query, savedOnly, saved]);

  const { pct: profilePct } = profileCompletion({
    photo: "",
    basic: CANDIDATE,
    about: CANDIDATE.about,
    experience: CANDIDATE.experience,
    education: CANDIDATE.education,
    skills: CANDIDATE.skills,
    certifications: CANDIDATE.certifications,
    resumes: CANDIDATE.resumes,
  });

  const gridTitle = savedOnly ? "Saved Jobs" : query ? `Results for “${q}”` : "Other Opportunities for You";
  const closeMenu = () => setMenu(false);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-white">
        <div className="flex items-center gap-2.5 px-4 py-3 sm:gap-4 sm:px-5">
          <MenuButton onClick={() => setMenu((m) => !m)} />
          <Logo compact />
          <label className="mx-auto flex h-[42px] min-w-0 max-w-[520px] flex-auto items-center gap-2.5 rounded-xl border border-line bg-gray-50 px-3.5">
            <Icon name="search" className="text-[20px] text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Find more jobs"
              aria-label="Find more jobs"
              className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
            />
          </label>

          <Dropdown
            open={bell}
            onClose={closeBell}
            className="w-[320px] p-2"
            trigger={
              <button
                onClick={() => {
                  setBell((b) => !b);
                  setUser(false);
                  setUnread(false);
                }}
                aria-label="Notifications"
                className="relative flex h-[42px] w-[42px] cursor-pointer items-center justify-center rounded-xl border border-line bg-white"
              >
                <Icon name="notifications" className="text-[22px] text-gray-800" />
                {unread && <span className="absolute right-[9px] top-2 h-2 w-2 rounded-full border-2 border-white bg-sand-200" />}
              </button>
            }
          >
            <div className="px-2.5 py-2 font-display text-[15px] font-semibold">Notifications</div>
            {CANDIDATE_NOTIFICATIONS.map((n) => (
              <Link key={n.text} href={n.href} onClick={closeBell} className="flex gap-2.5 rounded-[10px] p-2.5 text-gray-800 hover:bg-sand-50 hover:text-gray-800">
                <Icon name={n.icon} className="text-[20px] text-bronze" />
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{n.text}</span>
                  <span className="text-xs text-gray-500">{n.time}</span>
                </span>
              </Link>
            ))}
          </Dropdown>

          <Dropdown
            open={user}
            onClose={closeUser}
            className="flex w-[220px] flex-col p-1.5"
            trigger={
              <button
                onClick={() => {
                  setUser((u) => !u);
                  setBell(false);
                }}
                aria-label="Account menu"
                className="flex h-[42px] cursor-pointer items-center gap-2 rounded-xl border border-line bg-white py-1 pl-1 pr-2.5"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-sand-100 font-display text-[13px] font-semibold text-bronze-deep">
                  {CANDIDATE.initials}
                </span>
                <Icon name="expand_more" className="text-[20px] text-gray-500" />
              </button>
            }
          >
            <MenuLink href="/profile">My Profile</MenuLink>
            <MenuLink href="/applications">My Applications</MenuLink>
            <MenuLink href="/recruiter">Switch to Recruiter</MenuLink>
            <Link href="/" className="rounded-lg border-t border-gray-100 px-3 py-2.5 text-sm text-red-700 hover:bg-red-50 hover:text-red-700">
              Log out
            </Link>
          </Dropdown>
        </div>
      </header>

      <div className="flex flex-1 items-stretch">
        <Sidebar open={menu} onClose={closeMenu} top={67} className="gap-5 bg-gray-100">
          <nav className="flex flex-col gap-1">
            <NavItem icon="home" label="Dashboard" href="#" active={!savedOnly} onClick={(e) => { e.preventDefault(); setSavedOnly(false); closeMenu(); }} />
            <NavItem icon="search" label="Explore Jobs" href="#jobs" onClick={closeMenu} />
            <NavItem icon="work" label="My Applications" href="/applications" />
            <NavItem icon="favorite" label="Saved Jobs" href="#jobs" active={savedOnly} onClick={() => { setSavedOnly(true); closeMenu(); }} />
            <NavItem icon="star" label="Interview Prep" href="/interview" />
            <NavItem icon="chat" label="Messages" href="#" onClick={(e) => { e.preventDefault(); closeMenu(); showToast("No new messages"); }} />
            <NavItem icon="person" label="Profile" href="/profile" />
          </nav>
          <Link href="/profile" className="mt-auto flex items-center gap-3 rounded-xl border border-line bg-white p-3 text-gray-800 hover:border-bronze hover:text-gray-800">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sand-100 font-display text-sm font-semibold text-bronze-deep">
              {CANDIDATE.initials}
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold">{CANDIDATE.name}</span>
              <span className="text-xs font-medium text-bronze">View Profile</span>
            </span>
          </Link>
        </Sidebar>

        <div className="flex min-w-0 flex-1 flex-wrap content-start gap-6 px-6 py-7">
          <main className="flex min-w-0 flex-[1_1_560px] flex-col gap-8">
            <div className="flex flex-col gap-1">
              <h1 className="m-0 font-display text-[28px] font-semibold tracking-[-0.02em]">Good morning, {CANDIDATE.firstName}</h1>
              <p className="m-0 text-[15px] text-gray-600">3 new jobs match your skills since yesterday.</p>
            </div>

            <section className="flex flex-col gap-3.5">
              <h2 className="m-0 font-display text-lg font-semibold">Recommended For You</h2>
              <div className="flex flex-wrap items-center gap-6 rounded-xl border border-sand-line bg-cream p-7">
                <div className="flex flex-[1_1_320px] flex-col gap-3.5">
                  <div className="flex items-center gap-3">
                    <CompanyLogo company={FEATURED_JOB.company} />
                    <div className="flex flex-col">
                      <span className="text-[15px] font-semibold">{FEATURED_JOB.company}</span>
                      <span className="text-[13px] text-gray-600">
                        {FEATURED_JOB.location} · {FEATURED_JOB.workMode}
                      </span>
                    </div>
                  </div>
                  <Link href={`/jobs/${FEATURED_JOB.id}`} className="font-display text-2xl font-semibold tracking-[-0.01em] text-gray-800 hover:text-bronze">
                    {FEATURED_JOB.title}
                  </Link>
                  <div className="text-[15px] font-semibold text-bronze-dark">{FEATURED_JOB.salary}</div>
                  <div className="text-[13px] text-gray-600">Python (Advanced) • AWS (3 yrs) • Leadership</div>
                  <div className="mt-1 flex flex-wrap gap-2.5">
                    <Link href={`/jobs/${FEATURED_JOB.id}?apply=1`} className="btn-primary rounded-[10px] px-[22px] py-3 text-[15px]">
                      Apply Now
                    </Link>
                    <button
                      onClick={() => {
                        setFeaturedSaved((v) => !v);
                        showToast(featuredSaved ? "Removed from saved jobs" : "Saved to your list");
                      }}
                      className="flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-line-strong bg-white px-5 py-3 text-[15px] font-semibold text-gray-800"
                    >
                      <Icon name="favorite" filled={featuredSaved} className={cx("text-[20px]", featuredSaved ? "text-rose" : "text-gray-800")} />
                      {featuredSaved ? "Saved" : "Save Job"}
                    </button>
                  </div>
                </div>
                <span className="flex-none self-start rounded-full bg-sand-200 px-3.5 py-2 font-display text-[15px] font-semibold text-bronze-deep">
                  {FEATURED_JOB.match}% Match
                </span>
              </div>
            </section>

            <section id="jobs" className="flex scroll-mt-24 flex-col gap-3.5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="m-0 font-display text-lg font-semibold">{gridTitle}</h2>
                {(query || savedOnly) && (
                  <button
                    onClick={() => {
                      setQ("");
                      setSavedOnly(false);
                    }}
                    className="cursor-pointer border-0 bg-transparent text-sm font-semibold text-bronze"
                  >
                    Show all jobs
                  </button>
                )}
              </div>
              {jobs.length === 0 && (
                <div className="rounded-[10px] border border-dashed border-line bg-white p-10 text-center text-[15px] text-gray-600">
                  {savedOnly ? "You haven't saved any jobs yet. Tap the heart on a job to save it." : `No jobs match “${q}”. Try a different skill or title.`}
                </div>
              )}
              <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
                {jobs.map((j) => {
                  const ap = applied[j.id];
                  const sv = saved[j.id];
                  return (
                    <div key={j.id} className="group flex flex-col gap-2 rounded-[10px] border border-[#EEEAE3] bg-white p-[18px]">
                      <div className="flex items-start justify-between gap-2">
                        <CompanyLogo company={j.company} />
                        <span className="rounded-full bg-sand-200 px-[9px] py-1 text-xs font-semibold text-bronze-deep">{j.match}% Match</span>
                      </div>
                      <Link href={`/jobs/${j.id}`} className="font-display text-base font-semibold leading-[1.3] text-gray-800 hover:text-bronze">
                        {j.title}
                      </Link>
                      <div className="text-sm text-gray-600">
                        {j.company} · {j.location}
                      </div>
                      <div className="text-sm font-semibold text-bronze-dark">{j.salary}</div>
                      <div className="mt-auto flex items-center justify-between pt-1.5">
                        <button
                          onClick={() => {
                            if (ap) return;
                            setApplied((p) => ({ ...p, [j.id]: true }));
                            showToast(`Applied to ${j.title} at ${j.company}`);
                          }}
                          className={cx(
                            "rounded-lg border-0 px-3.5 py-2 text-[13px] font-semibold text-mint-ink transition-opacity",
                            ap ? "cursor-default bg-mint-pale opacity-100" : "cursor-pointer bg-mint opacity-0 focus:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100",
                          )}
                        >
                          {ap ? "Applied ✓" : "Quick Apply"}
                        </button>
                        <button
                          onClick={() => {
                            setSaved((p) => ({ ...p, [j.id]: !p[j.id] }));
                            showToast(sv ? "Removed from saved jobs" : "Saved to your list");
                          }}
                          aria-label={sv ? "Remove from saved jobs" : "Save job"}
                          aria-pressed={!!sv}
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent hover:bg-red-50"
                        >
                          <Icon name="favorite" filled={sv} className={cx("text-[22px]", sv ? "text-rose" : "text-gray-400")} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="flex flex-col gap-3.5">
              <h2 className="m-0 font-display text-lg font-semibold">Your Activity</h2>
              <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
                <ActivityCard icon="trending_up" value={12 + Object.keys(applied).length} label="Applications" />
                <ActivityCard icon="event" value={2} label="Interviews Scheduled" />
                <ActivityCard icon="task_alt" value={1} label="Offer Received" tone="bronze" />
              </div>
            </section>
          </main>

          <aside className="flex max-w-full flex-[1_1_260px] flex-col gap-5">
            <div className="card flex flex-col gap-[18px] p-6">
              <h3 className="m-0 font-display text-[17px] font-semibold">Complete Your Profile</h3>
              <div className="flex items-center gap-[18px]">
                <ProgressRing pct={profilePct} size={96} stroke={10}>
                  <span className="text-xl">{profilePct}%</span>
                </ProgressRing>
                <div className="text-sm leading-normal text-gray-600">Profile {profilePct}% Complete</div>
              </div>
              <div className="flex flex-col gap-2.5">
                {PROFILE_STEPS.map(([label, done]) => (
                  <div key={label} className="flex items-center gap-2.5 text-sm">
                    <Icon
                      name={done ? "check_circle" : "radio_button_unchecked"}
                      filled={done}
                      className={cx("text-[20px]", done ? "text-sage" : "text-gray-300")}
                    />
                    {label}
                  </div>
                ))}
              </div>
              <Link href="/profile" className="btn-primary rounded-[10px] p-3 text-center text-[15px]">
                Complete Now
              </Link>
            </div>
            <div className="flex flex-col gap-1.5 rounded-xl bg-cream p-6 text-bronze-deep">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em]">
                <span className="h-2 w-2 animate-ud-pulse rounded-full bg-bronze" />
                Live
              </div>
              <div className="font-display text-[40px] font-semibold leading-[1.1] tracking-[-0.02em] tabular-nums">{counter}</div>
              <div className="text-[15px]">Candidates Onboarded</div>
            </div>
          </aside>
        </div>
      </div>

      <Toast message={toast} />
    </div>
  );
}

function MenuLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="rounded-lg px-3 py-2.5 text-sm text-gray-800 hover:bg-gray-50 hover:text-gray-800">
      {children}
    </Link>
  );
}

function ActivityCard({ icon, value, label, tone = "green" }: { icon: string; value: number; label: string; tone?: "green" | "bronze" }) {
  const color = tone === "green" ? "text-forest" : "text-bronze-dark";
  return (
    <Link
      href="/applications"
      className={cx(
        "flex items-center gap-3.5 rounded-[10px] border border-line bg-white p-5 text-gray-800 hover:text-gray-800",
        tone === "green" ? "hover:border-sage" : "hover:border-gold",
      )}
    >
      <Icon name={icon} className={cx("text-[24px]", color)} />
      <span className="flex flex-col">
        <span className={cx("font-display text-[28px] font-semibold leading-[1.1]", color)}>{value}</span>
        <span className="text-sm text-gray-600">{label}</span>
      </span>
    </Link>
  );
}
