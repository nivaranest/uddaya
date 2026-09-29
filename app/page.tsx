import Link from "next/link";
import { Icon } from "@/components/icon";
import { Logo } from "@/components/logo";
import { HeroSearch, LiveCandidateStat } from "./landing-client";

const FEATURES = [
  { icon: "monitoring", title: "Smart Matching", body: "AI matches you to 87% compatible jobs" },
  { icon: "star", title: "Interview Prep", body: "AI mock interviews with real-time feedback" },
  { icon: "notifications_active", title: "Live Alerts", body: "Get notified the moment jobs match your skills" },
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
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-5 px-6 py-3.5">
          <Logo size="lg" />
          <nav className="mx-auto flex flex-wrap gap-7 text-[15px] font-medium">
            <Link href="/dashboard" className="text-gray-700 hover:text-bronze">Find Jobs</Link>
            <a href="#features" className="text-gray-700 hover:text-bronze">How It Works</a>
            <Link href="/recruiter" className="text-gray-700 hover:text-bronze">For Companies</Link>
          </nav>
          <div className="flex gap-2.5">
            <Link href="/dashboard" className="rounded-[10px] border border-line px-[18px] py-2.5 text-[15px] font-semibold text-gray-800 hover:border-line-hover hover:text-gray-800">
              Login
            </Link>
            <Link href="/profile" className="btn-primary rounded-[10px] px-[18px] py-2.5 text-[15px]">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

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
            <p className="m-0 max-w-[30ch] text-pretty text-[clamp(18px,2vw,24px)] leading-[1.4] text-gray-600">
              AI-powered job matching for your next opportunity
            </p>
            <div className="mt-1.5 flex flex-wrap gap-3">
              <Link href="/profile" className="btn-primary rounded-xl px-7 py-4 text-[17px]">Sign Up Free</Link>
              <Link href="/dashboard" className="rounded-xl bg-white px-7 py-4 text-[17px] font-semibold text-bronze-deep hover:bg-sand-50 hover:text-bronze-deep">
                Explore Jobs
              </Link>
            </div>
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

      <section id="features" className="px-6 pb-10 pt-24">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-10">
          <h2 className="m-0 text-center font-display text-[clamp(28px,3.4vw,40px)] font-semibold tracking-[-0.02em]">
            How Uddaya helps you rise
          </h2>
          <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))]">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex flex-col gap-3.5 rounded-xl bg-white p-8">
                <Icon name={f.icon} className="text-[28px] text-bronze" />
                <h3 className="m-0 font-display text-[21px] font-semibold">{f.title}</h3>
                <p className="m-0 text-base leading-[1.55] text-gray-600">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 pt-10">
        <div className="mx-auto grid max-w-[1040px] gap-4 border-t border-line pt-12 [grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr))]">
          <LiveCandidateStat />
          <Stat value="500+" label="hiring companies" />
          <Stat value="3x" label="faster interviews" />
        </div>
      </section>

      <footer className="mt-auto border-t border-[#E7E1D6] bg-paper px-6 py-12">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-6">
          <div className="flex flex-col gap-1.5">
            <span className="font-display text-[22px] font-semibold">
              udda<span className="text-gold">ya</span>
            </span>
            <span className="text-sm text-gray-500">Rise. Achieve. Succeed.</span>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm">
            {["Contact", "Privacy", "Terms"].map((l) => (
              <a key={l} href="#" className="text-gray-700 hover:text-gold">{l}</a>
            ))}
          </nav>
          <div className="flex gap-2.5">
            {["LinkedIn", "X", "Instagram"].map((l) => (
              <a key={l} href="#" className="rounded-lg border border-[#DDD5C8] px-3 py-2 text-[13px] text-gray-700 hover:border-gold hover:text-gold">
                {l}
              </a>
            ))}
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
