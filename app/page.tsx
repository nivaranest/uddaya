import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icon";
import { Logo } from "@/components/logo";
import { HeroSearch, LiveCandidateStat } from "./landing-client";

const STEPS = [
  { icon: "person_add", title: "Build your profile", body: "Sign up with email or LinkedIn and upload your resume. We pull out your skills and experience automatically." },
  { icon: "join_inner", title: "Get matched, with reasons", body: "Every job shows a match score and exactly which of your skills fit — and which are missing." },
  { icon: "rocket_launch", title: "Prepare and apply", body: "Check your resume against the job's ATS, practise with an AI mock interview, then apply in two minutes." },
];

const FEATURES = [
  { icon: "monitoring", title: "Smart Matching", body: "Semantic AI reads what a role actually needs, not just keywords, and ranks jobs by how well you fit." },
  { icon: "fact_check", title: "ATS Resume Checker", body: "See how applicant tracking systems read your resume, which keywords you're missing, and how to fix it.", href: "/resume-checker" },
  { icon: "star", title: "AI Mock Interviews", body: "Role-specific questions with instant scores for clarity, technical depth and communication.", href: "/interview" },
  { icon: "auto_awesome", title: "Match Explanations", body: "A clear “why you match” for every job — skills you have, skills they need, and the gaps to close." },
  { icon: "notifications_active", title: "Live Alerts", body: "Get notified the moment a job matching your skills is posted. Real-time, daily or weekly." },
  { icon: "view_kanban", title: "Application Tracker", body: "Every application in one board, from applied to offer, with interview dates and next steps." },
];

const COMPARISON: [string, string, string][] = [
  ["Job matching", "Keyword search", "Semantic AI matching"],
  ["Why a job fits you", "Not shown", "Skill-by-skill explanation"],
  ["Resume feedback", "None", "ATS score + AI rewrite suggestions"],
  ["Interview preparation", "External links", "AI mock interviews with scoring"],
  ["Recruiter screening", "Manual CV review", "AI-ranked candidates and pipeline"],
];

const RECRUITER_POINTS = [
  { icon: "filter_alt", title: "Screen 5x faster", body: "Applications arrive ranked by match, so you read the best-fit CVs first." },
  { icon: "edit_note", title: "AI-written job posts", body: "Turn a few notes into a polished description and 20+ interview questions." },
  { icon: "view_kanban", title: "One hiring pipeline", body: "Move candidates from new to offer, schedule interviews and message in one place." },
  { icon: "insights", title: "Hiring analytics", body: "Track time-to-hire, sources and funnel conversion across every role." },
];

const PLANS = [
  { name: "Starter", price: "₹5,000", period: "/month", blurb: "For small teams starting to hire.", features: ["5 active job posts", "Basic candidate filtering", "500 candidate searches / month", "Email support"], cta: "Start with Starter" },
  { name: "Professional", price: "₹15,000", period: "/month", blurb: "For growing teams hiring every month.", features: ["Unlimited job posts", "AI matching and ranking", "Full resume database access", "Up to 10 team members", "AI job descriptions and interview questions"], cta: "Choose Professional", highlight: true },
  { name: "Enterprise", price: "Custom", period: "", blurb: "For large hiring teams with custom needs.", features: ["Everything in Professional", "Dedicated account manager", "API access and SSO", "White-label options"], cta: "Talk to sales" },
];

const FAQS = [
  { q: "Is Uddaya free for job seekers?", a: "Yes. Creating a profile, getting matched, the ATS resume checker, mock interviews and job alerts are all free for candidates." },
  { q: "What is an ATS, and why does my resume need to pass it?", a: "An applicant tracking system is the software most companies use to collect and filter applications. It reads your resume as plain text and scores it against the job's keywords before a recruiter sees it. Our checker shows you what it will see." },
  { q: "How is the match score calculated?", a: "We compare the skills, experience and seniority in your profile with what the job requires, using AI that understands related skills rather than exact keyword matches. Each score comes with the reasons behind it." },
  { q: "Do you store the resume I check?", a: "No. Resumes uploaded to the checker are analysed for that check only and aren't saved. Resumes you add to your profile are stored privately so you can apply with them." },
  { q: "Who can see my profile?", a: "Recruiters on paid plans can find profiles of candidates who have opted in to recruiter contact. You can make your profile private at any time." },
  { q: "Which roles and cities do you cover?", a: "We're starting with technology and startup roles across Bengaluru, Hyderabad, Pune, Mumbai, Chennai, Delhi NCR and remote positions, and adding more categories soon." },
];

const BARS = [
  { h: "22%", bg: "#EFE6D8" },
  { h: "40%", bg: "#E6D8C4" },
  { h: "60%", bg: "#DCC7A8" },
  { h: "82%", bg: "#CFAE84" },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-line bg-white">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-5 gap-y-3 px-6 py-3.5">
          <Logo size="lg" />
          <nav className="order-last flex w-full flex-wrap gap-x-6 gap-y-2 text-[15px] font-medium lg:order-none lg:mx-auto lg:w-auto">
            <Link href="/dashboard" className="text-gray-700 hover:text-bronze">Find Jobs</Link>
            <a href="#features" className="text-gray-700 hover:text-bronze">Features</a>
            <Link href="/resume-checker" className="text-gray-700 hover:text-bronze">Resume Checker</Link>
            <a href="#recruiters" className="text-gray-700 hover:text-bronze">For Companies</a>
            <a href="#pricing" className="text-gray-700 hover:text-bronze">Pricing</a>
          </nav>
          <div className="ml-auto flex gap-2.5 lg:ml-0">
            <Link href="/login" className="rounded-[10px] border border-line px-[18px] py-2.5 text-[15px] font-semibold text-gray-800 hover:border-line-hover hover:text-gray-800">
              Login
            </Link>
            <Link href="/register" className="btn-primary rounded-[10px] px-[18px] py-2.5 text-[15px]">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-cream px-6 pb-[140px] pt-[72px] text-gray-800">
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 [grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr))]">
          <div className="flex flex-col gap-[22px]">
            <div className="inline-flex items-center gap-2 self-start rounded-full bg-white/75 px-3.5 py-1.5 text-sm font-medium text-bronze-deep">
              <Icon name="trending_up" className="text-[18px]" />
              Uddaya · Sanskrit for rise, ascent, progress
            </div>
            <h1 className="m-0 text-balance font-display text-[clamp(44px,6vw,72px)] font-semibold leading-[1.02] tracking-[-0.03em]">
              Rise. Achieve. Succeed.
            </h1>
            <p className="m-0 max-w-[36ch] text-pretty text-[clamp(18px,2vw,22px)] leading-[1.45] text-gray-600">
              AI-powered job matching for your next opportunity. See why every job fits, get your resume past the ATS, and walk into interviews prepared.
            </p>
            <div className="mt-1.5 flex flex-wrap gap-3">
              <Link href="/register" className="btn-primary rounded-xl px-7 py-4 text-[17px]">Sign Up Free</Link>
              <Link href="/resume-checker" className="flex items-center gap-2 rounded-xl bg-white px-7 py-4 text-[17px] font-semibold text-bronze-deep hover:bg-sand-50 hover:text-bronze-deep">
                <Icon name="fact_check" className="text-[20px]" />
                Check My Resume
              </Link>
            </div>
            <ul className="m-0 flex list-none flex-wrap gap-x-5 gap-y-2 p-0 text-sm text-gray-600">
              {["Free for job seekers", "No spam, ever", "Built for India's tech hiring"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Icon name="check_circle" filled className="text-[18px] text-sage" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Decorative rising-sun illustration */}
          <div aria-hidden="true" className="relative aspect-[5/4] overflow-hidden rounded-xl border border-[#EFE3D1] bg-[#FFFDF9]">
            {[
              { w: "78%", cls: "border border-[#F1E2CC]" },
              { w: "58%", cls: "border border-[#EBD5B5]" },
              { w: "38%", cls: "bg-[#F3DDBD]" },
            ].map((c) => (
              <div
                key={c.w}
                className={`absolute bottom-[22%] left-1/2 aspect-square -translate-x-1/2 translate-y-1/2 rounded-full ${c.cls}`}
                style={{ width: c.w }}
              />
            ))}
            <div className="absolute inset-x-0 bottom-0 h-[22%] border-t border-[#E6D3B8] bg-[#FFFDF9]" />
            <div className="absolute bottom-[22%] left-[14%] right-[14%] flex h-[42%] items-end gap-[6%]">
              {BARS.map((b) => (
                <div key={b.h} className="flex-1 rounded-t" style={{ height: b.h, background: b.bg }} />
              ))}
              <div className="relative h-full flex-1 rounded-t bg-bronze">
                <Icon name="north_east" className="absolute -top-[38px] left-1/2 -translate-x-1/2 text-[30px] text-bronze-dark" />
              </div>
            </div>
            <div className="absolute bottom-[7%] left-[8%] right-[8%] flex items-center justify-between text-xs uppercase tracking-[0.06em] text-[#8A7A66]">
              <span>Rise</span>
              <span>Achieve</span>
              <span>Succeed</span>
            </div>
          </div>
        </div>
      </section>

      <section className="relative -mt-[72px] px-6">
        <HeroSearch />
      </section>

      {/* Stats */}
      <section className="px-6 pt-16">
        <div className="mx-auto grid max-w-[1040px] gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr))]">
          <LiveCandidateStat />
          <Stat value="500+" label="hiring companies" />
          <Stat value="87%" label="average match accuracy" />
          <Stat value="3x" label="faster to interview" />
        </div>
      </section>

      {/* How it works */}
      <Section id="how" eyebrow="How it works" title="From profile to offer in three steps">
        <ol className="m-0 grid list-none gap-6 p-0 [grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))]">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex flex-col gap-3 rounded-xl border border-line bg-white p-7">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 font-display text-sm font-semibold text-white">{i + 1}</span>
                <Icon name={s.icon} className="text-[26px] text-bronze" />
              </div>
              <h3 className="m-0 font-display text-xl font-semibold">{s.title}</h3>
              <p className="m-0 text-[15px] leading-[1.6] text-gray-600">{s.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Features */}
      <Section id="features" eyebrow="Features" title="Everything you need to rise" className="bg-white">
        <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))]">
          {FEATURES.map((f) => {
            const body = (
              <>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sand-100">
                  <Icon name={f.icon} className="text-[26px] text-bronze" />
                </span>
                <h3 className="m-0 font-display text-[19px] font-semibold text-gray-800">{f.title}</h3>
                <p className="m-0 text-[15px] leading-[1.6] text-gray-600">{f.body}</p>
                {f.href && (
                  <span className="mt-auto flex items-center gap-1 pt-1 text-sm font-semibold text-bronze">
                    Try it free <Icon name="arrow_forward" className="text-[18px]" />
                  </span>
                )}
              </>
            );
            const cls = "flex flex-col gap-3 rounded-xl border border-line bg-gray-50 p-7";
            return f.href ? (
              <Link key={f.title} href={f.href} className={`${cls} transition-colors hover:border-bronze`}>
                {body}
              </Link>
            ) : (
              <div key={f.title} className={cls}>
                {body}
              </div>
            );
          })}
        </div>
      </Section>

      {/* ATS spotlight */}
      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 [grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr))]">
          <div className="flex flex-col gap-5">
            <Eyebrow>New · ATS Resume Checker</Eyebrow>
            <h2 className="m-0 text-balance font-display text-[clamp(28px,3.4vw,40px)] font-semibold tracking-[-0.02em]">
              Get your resume past the robots — and in front of a recruiter
            </h2>
            <p className="m-0 text-base leading-[1.65] text-gray-600">
              Most applications are filtered by software before anyone reads them. Upload your resume and a job description to see your ATS score, the keywords you&apos;re missing, and AI rewrites that make your achievements stand out.
            </p>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {[
                "Score out of 100 across keywords, structure, impact and formatting",
                "Checks that your PDF or Word file is actually machine-readable",
                "Missing keywords from the exact job you're applying to",
                "Bullet-point rewrites that never invent experience",
              ].map((t) => (
                <li key={t} className="flex gap-2.5 text-[15px] leading-normal">
                  <Icon name="check_circle" filled className="mt-px flex-none text-[20px] text-forest" />
                  {t}
                </li>
              ))}
            </ul>
            <Link href="/resume-checker" className="btn-primary flex items-center gap-2 self-start rounded-xl px-7 py-3.5 text-base">
              <Icon name="fact_check" className="text-[20px]" />
              Check my resume — free
            </Link>
          </div>
          <AtsPreview />
        </div>
      </section>

      {/* Comparison */}
      <Section id="why" eyebrow="Why Uddaya" title="Not another job board" className="bg-white">
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[560px] border-collapse text-left text-[15px]">
            <thead>
              <tr className="bg-gray-50 text-sm">
                <th className="px-5 py-4 font-semibold text-gray-500" scope="col"><span className="sr-only">Capability</span></th>
                <th className="px-5 py-4 font-semibold text-gray-500" scope="col">Traditional job portals</th>
                <th className="px-5 py-4 font-display font-semibold text-bronze-dark" scope="col">Uddaya</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map(([cap, old, ours]) => (
                <tr key={cap} className="border-t border-gray-100">
                  <th scope="row" className="px-5 py-4 font-semibold">{cap}</th>
                  <td className="px-5 py-4 text-gray-500">{old}</td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-2 font-medium">
                      <Icon name="check_circle" filled className="text-[20px] text-forest" />
                      {ours}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Recruiters */}
      <section id="recruiters" className="scroll-mt-20 bg-gray-800 px-6 py-20 text-white">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="flex max-w-[640px] flex-col gap-3">
              <span className="text-sm font-semibold uppercase tracking-[0.08em] text-gold">For companies</span>
              <h2 className="m-0 text-balance font-display text-[clamp(28px,3.4vw,40px)] font-semibold tracking-[-0.02em]">
                Hire in weeks, not months
              </h2>
              <p className="m-0 text-base leading-[1.65] text-gray-300">
                Uddaya screens and ranks applicants for you, so your team spends its time talking to the right people. Our goal: cut time-to-hire from 45 days to 21.
              </p>
            </div>
            <Link href="/recruiter/jobs/new" className="flex items-center gap-2 rounded-xl bg-gold px-6 py-3.5 font-semibold text-gray-800 hover:bg-sand-200 hover:text-gray-800">
              <Icon name="add" className="text-[20px]" />
              Post a job
            </Link>
          </div>
          <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr))]">
            {RECRUITER_POINTS.map((p) => (
              <div key={p.title} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-6">
                <Icon name={p.icon} className="text-[28px] text-gold" />
                <h3 className="m-0 font-display text-lg font-semibold">{p.title}</h3>
                <p className="m-0 text-[15px] leading-[1.6] text-gray-300">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <Section id="pricing" eyebrow="Pricing" title="Simple plans for hiring teams" subtitle="Always free for job seekers. Save 15% with annual billing.">
        <div className="grid items-stretch gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))]">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`relative flex flex-col gap-5 rounded-xl border bg-white p-7 ${p.highlight ? "border-bronze shadow-[0_12px_32px_rgba(176,122,72,0.15)]" : "border-line"}`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-7 rounded-full bg-bronze px-3 py-1 text-xs font-semibold text-white">Most popular</span>
              )}
              <div className="flex flex-col gap-1.5">
                <h3 className="m-0 font-display text-xl font-semibold">{p.name}</h3>
                <p className="m-0 text-sm text-gray-600">{p.blurb}</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-4xl font-semibold tracking-[-0.02em]">{p.price}</span>
                <span className="text-sm text-gray-500">{p.period}</span>
              </div>
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2 text-[15px] leading-normal">
                    <Icon name="check" className="mt-0.5 flex-none text-[18px] text-forest" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/recruiter"
                className={`mt-auto rounded-[10px] px-5 py-3 text-center text-[15px] ${p.highlight ? "btn-primary" : "btn-outline"}`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section id="faq" eyebrow="FAQ" title="Questions, answered" className="bg-white">
        <div className="mx-auto flex w-full max-w-[820px] flex-col gap-3">
          {FAQS.map((f) => (
            <details key={f.q} className="group rounded-xl border border-line bg-gray-50 px-5 py-4 open:bg-white">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-base font-semibold [&::-webkit-details-marker]:hidden">
                {f.q}
                <Icon name="expand_more" className="flex-none text-[24px] text-gray-500 transition-transform group-open:rotate-180" />
              </summary>
              <p className="m-0 mt-3 text-[15px] leading-[1.65] text-gray-600">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>

      {/* Final CTA */}
      <section className="px-6 py-20">
        <div className="mx-auto flex max-w-[1040px] flex-col items-center gap-5 rounded-2xl bg-cream px-6 py-14 text-center">
          <h2 className="m-0 text-balance font-display text-[clamp(28px,3.4vw,40px)] font-semibold tracking-[-0.02em]">Your next role is waiting</h2>
          <p className="m-0 max-w-[48ch] text-base leading-[1.6] text-gray-600">
            Create your free profile in minutes and see the jobs that fit you best — with the reasons why.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/register" className="btn-primary rounded-xl px-7 py-4 text-[17px]">Sign Up Free</Link>
            <Link href="/dashboard" className="rounded-xl bg-white px-7 py-4 text-[17px] font-semibold text-bronze-deep hover:bg-sand-50 hover:text-bronze-deep">
              Explore Jobs
            </Link>
          </div>
        </div>
      </section>

      <footer className="mt-auto border-t border-[#E7E1D6] bg-paper px-6 pb-8 pt-14">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-10">
          <div className="grid gap-10 [grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr))]">
            <div className="flex flex-col gap-2">
              <span className="font-display text-[22px] font-semibold">
                udda<span className="text-gold">ya</span>
              </span>
              <span className="text-sm leading-normal text-gray-500">Rise. Achieve. Succeed.<br />AI-powered job matching for India.</span>
            </div>
            <FooterCol title="Candidates" links={[["Find jobs", "/dashboard"], ["ATS resume checker", "/resume-checker"], ["Mock interviews", "/interview"], ["Track applications", "/applications"]]} />
            <FooterCol title="Companies" links={[["Post a job", "/recruiter/jobs/new"], ["Recruiter dashboard", "/recruiter"], ["Pricing", "#pricing"]]} />
            <FooterCol title="Company" links={[["About", "#"], ["Contact", "#"], ["Privacy", "#"], ["Terms", "#"]]} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#E7E1D6] pt-6">
            <span className="text-[13px] text-gray-500">© 2026 Uddaya. All rights reserved.</span>
            <div className="flex gap-2.5">
              {["LinkedIn", "X", "Instagram"].map((l) => (
                <a key={l} href="#" className="rounded-lg border border-[#DDD5C8] px-3 py-2 text-[13px] text-gray-700 hover:border-gold hover:text-gold">
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1 text-center">
      <div className="font-display text-[44px] font-semibold tracking-[-0.02em]">{value}</div>
      <div className="text-base text-gray-600">{label}</div>
    </div>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="self-start text-sm font-semibold uppercase tracking-[0.08em] text-bronze">{children}</span>;
}

function Section({ id, eyebrow, title, subtitle, className = "", children }: { id: string; eyebrow: string; title: string; subtitle?: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} className={`scroll-mt-20 px-6 py-20 ${className}`}>
      <div className="mx-auto flex max-w-[1200px] flex-col gap-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.08em] text-bronze">{eyebrow}</span>
          <h2 className="m-0 text-balance font-display text-[clamp(28px,3.4vw,40px)] font-semibold tracking-[-0.02em]">{title}</h2>
          {subtitle && <p className="m-0 text-base text-gray-600">{subtitle}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-semibold">{title}</span>
      {links.map(([label, href]) =>
        href.startsWith("/") ? (
          <Link key={label} href={href} className="text-sm text-gray-600 hover:text-bronze">{label}</Link>
        ) : (
          <a key={label} href={href} className="text-sm text-gray-600 hover:text-bronze">{label}</a>
        ),
      )}
    </div>
  );
}

/** Static, illustrative ATS result card for the spotlight section. */
function AtsPreview() {
  const cats: [string, number, string][] = [
    ["Keyword match", 78, "#E3C08A"],
    ["Sections & structure", 100, "#8FC3A8"],
    ["Impact & achievements", 64, "#E3C08A"],
    ["Formatting & length", 90, "#8FC3A8"],
  ];
  return (
    <div aria-hidden="true" className="flex flex-col gap-5 rounded-2xl border border-line bg-white p-7 shadow-[0_20px_50px_rgba(31,41,55,0.08)]">
      <div className="flex items-center gap-5">
        <div className="relative h-24 w-24 flex-none">
          <svg viewBox="0 0 96 96" className="h-full w-full">
            <circle cx="48" cy="48" r="40" fill="none" stroke="#F3F4F6" strokeWidth="10" />
            <circle cx="48" cy="48" r="40" fill="none" stroke="#B07A48" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 40 * 0.82} 999`} transform="rotate(-90 48 48)" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-display text-[26px] font-semibold">82</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="font-display text-lg font-semibold">ATS score</span>
          <span className="self-start rounded-full bg-mint-soft px-2.5 py-0.5 text-xs font-semibold text-forest-dark">Good</span>
          <span className="text-[13px] text-gray-500">Senior Python Engineer — TechCorp</span>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {cats.map(([label, v, c]) => (
          <div key={label} className="flex flex-col gap-1">
            <div className="flex justify-between text-[13px]">
              <span className="font-medium">{label}</span>
              <span className="font-semibold">{v}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full" style={{ width: `${v}%`, background: c }} />
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {["Python", "AWS", "PostgreSQL"].map((k) => (
          <span key={k} className="rounded-lg bg-mint-soft px-2.5 py-1 text-xs font-medium text-forest-dark">✓ {k}</span>
        ))}
        {["Django", "Kubernetes"].map((k) => (
          <span key={k} className="rounded-lg bg-sand-100 px-2.5 py-1 text-xs font-medium text-bronze-deep">+ {k}</span>
        ))}
      </div>
      <div className="rounded-[10px] bg-sand-50 p-3 text-[13px] leading-normal">
        <span className="text-gray-400 line-through">Worked on code reviews and hiring</span>
        <span className="mt-1 block font-medium">→ Led code reviews for a team of 5 and interviewed [N] engineering candidates</span>
      </div>
    </div>
  );
}
