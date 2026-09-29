"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Icon } from "@/components/icon";
import { Wordmark } from "@/components/logo";
import { Toast, useToast } from "@/components/toast";
import { CANDIDATE_APPLICATIONS, type AppColumn, type CandidateApplication } from "@/lib/data";
import { moveCard } from "@/lib/applications";
import { cx } from "@/lib/format";

const COLS: { id: AppColumn; name: string; color: string }[] = [
  { id: "applied", name: "Applied", color: "#B07A48" },
  { id: "interview", name: "Interview Scheduled", color: "#A9BCDD" },
  { id: "offer", name: "Offer Received", color: "#E3C08A" },
  { id: "closed", name: "Rejected / Closed", color: "#9CA3AF" },
];
const ORDER = COLS.map((c) => c.id);

const FILTERS = {
  All: ORDER,
  Active: ["applied", "interview"],
  Rejected: ["closed"],
  Offers: ["offer"],
} as const satisfies Record<string, readonly AppColumn[]>;
type Filter = keyof typeof FILTERS;

export function ApplicationsClient() {
  const router = useRouter();
  const [cards, setCards] = useState(CANDIDATE_APPLICATIONS);
  const [filter, setFilter] = useState<Filter>("All");
  const [sort, setSort] = useState<"Recent" | "Company A–Z">("Recent");
  const [q, setQ] = useState("");
  const [drag, setDrag] = useState<number | null>(null);
  const [dropCol, setDropCol] = useState<AppColumn | null>(null);
  const [asked, setAsked] = useState<Record<number, boolean>>({});
  const [toast, showToast] = useToast();

  const move = (id: number, col: AppColumn) => {
    setCards((cs) => cs.map((c) => (c.id === id ? moveCard(c, col) : c)));
    setDrag(null);
    setDropCol(null);
    showToast(`Moved to ${COLS.find((c) => c.id === col)!.name}`);
  };
  const update = (id: number, patch: Partial<CandidateApplication>) => setCards((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const visible = useMemo(() => {
    const query = q.trim().toLowerCase();
    const list = cards.filter((c) => !query || `${c.company} ${c.job}`.toLowerCase().includes(query));
    return [...list].sort(sort === "Recent" ? (a, b) => a.age - b.age : (a, b) => a.company.localeCompare(b.company));
  }, [cards, q, sort]);

  const shown: readonly AppColumn[] = FILTERS[filter];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-white">
        <div className="flex items-center gap-3.5 px-6 py-3">
          <Link href="/dashboard" aria-label="Back" className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-line text-gray-800 hover:text-gray-800">
            <Icon name="arrow_back" className="text-[22px]" />
          </Link>
          <Link href="/dashboard">
            <Wordmark className="text-xl" />
          </Link>
        </div>
      </header>

      <div className="flex flex-col gap-[18px] px-6 pb-3 pt-7">
        <h1 className="m-0 font-display text-[28px] font-semibold tracking-[-0.02em]">My Applications</h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter applications">
            {(Object.keys(FILTERS) as Filter[]).map((label) => (
              <button
                key={label}
                onClick={() => setFilter(label)}
                aria-pressed={filter === label}
                className={cx(
                  "cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold",
                  filter === label ? "border-bronze bg-sand-200 text-bronze-deep" : "border-line bg-white text-gray-700",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-1.5 text-sm text-gray-600">
            Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="h-[38px] rounded-[10px] border border-line bg-white px-2.5 text-sm text-gray-800"
            >
              <option>Recent</option>
              <option>Company A–Z</option>
            </select>
          </label>
          <label className="ml-auto flex h-10 flex-[0_1_280px] items-center gap-2 rounded-[10px] border border-line bg-white px-3">
            <Icon name="search" className="text-[20px] text-gray-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search jobs..." aria-label="Search applications" className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none" />
          </label>
        </div>
        <span className="text-xs text-gray-500">Drag cards between columns, or focus a card and use ← → keys.</span>
      </div>

      {cards.length === 0 ? (
        <div className="mx-auto my-10 flex max-w-[420px] flex-col items-center gap-3.5 px-6 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-xl bg-sand-100">
            <Icon name="work" className="text-[44px] text-bronze" />
          </span>
          <span className="font-display text-xl font-semibold">Start applying to jobs</span>
          <Link href="/dashboard#jobs" className="btn-primary rounded-[10px] px-[22px] py-3">Explore Opportunities</Link>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto px-6 pb-12 pt-3">
          <div className="grid min-w-[1100px] grid-cols-[repeat(4,minmax(260px,1fr))] items-start gap-4">
            {COLS.map((col) => {
              const list = shown.includes(col.id) ? visible.filter((c) => c.col === col.id) : [];
              const over = dropCol === col.id;
              return (
                <div
                  key={col.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (!over) setDropCol(col.id);
                  }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropCol(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (drag != null) move(drag, col.id);
                  }}
                  className={cx("flex min-h-[320px] flex-col gap-2.5 rounded-xl p-3", over ? "bg-sand-50" : "bg-gray-100", !shown.includes(col.id) && "opacity-50")}
                  style={{ borderTop: `4px solid ${col.color}`, outline: over ? `2px dashed ${col.color}` : "none" }}
                >
                  <div className="flex items-center justify-between gap-2 px-0.5 pb-1 pt-0.5">
                    <span className="font-display text-base font-semibold">{col.name}</span>
                    <span className="rounded-full bg-line px-[9px] py-0.5 text-xs font-semibold text-gray-700">{cards.filter((c) => c.col === col.id).length}</span>
                  </div>
                  {list.map((c) => (
                    <AppCard
                      key={c.id}
                      card={c}
                      feedbackAsked={!!asked[c.id]}
                      onDragStart={() => setDrag(c.id)}
                      onDragEnd={() => {
                        setDrag(null);
                        setDropCol(null);
                      }}
                      onMove={(dir) => {
                        const idx = ORDER.indexOf(c.col) + dir;
                        if (idx >= 0 && idx < ORDER.length) move(c.id, ORDER[idx]);
                      }}
                      onMessage={() => showToast(`Message sent to ${c.company}`)}
                      onWithdraw={() => move(c.id, "closed")}
                      onExplore={() => router.push(`/dashboard?q=${encodeURIComponent(c.job.split(" ").slice(-1)[0])}`)}
                      onJoin={() => showToast(`Opening video call with ${c.company}`)}
                      onReschedule={() => showToast("Reschedule request sent")}
                      onAccept={() => {
                        update(c.id, { offer: "accepted" });
                        showToast(`You accepted the ${c.company} offer`);
                      }}
                      onDecline={() => {
                        update(c.id, { col: "closed", meta: "Offer declined", offer: "declined" });
                        showToast("Offer declined");
                      }}
                      onReview={() => showToast("Offer letter opened")}
                      onFeedback={() => setAsked((a) => ({ ...a, [c.id]: true }))}
                    />
                  ))}
                  {list.length === 0 && (
                    <div className="rounded-lg border-[1.5px] border-dashed border-line p-5 text-center text-[13px] text-gray-400">Nothing here</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Toast message={toast} />
    </div>
  );
}

type AppCardProps = {
  card: CandidateApplication;
  feedbackAsked: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onMove: (dir: -1 | 1) => void;
  onMessage: () => void;
  onWithdraw: () => void;
  onExplore: () => void;
  onJoin: () => void;
  onReschedule: () => void;
  onAccept: () => void;
  onDecline: () => void;
  onReview: () => void;
  onFeedback: () => void;
};

function AppCard(p: AppCardProps) {
  const c = p.card;
  const closed = c.col === "closed";
  const actions = [
    { icon: "chat", label: "Message", run: p.onMessage },
    ...(closed ? [] : [{ icon: "undo", label: "Withdraw", run: p.onWithdraw }]),
    { icon: "travel_explore", label: "Explore similar", run: p.onExplore },
  ];
  const linkBtn = "cursor-pointer border-0 bg-transparent p-0 text-[13px] font-semibold";

  return (
    <div
      draggable
      tabIndex={0}
      aria-label={`${c.job} at ${c.company}`}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        p.onDragStart();
      }}
      onDragEnd={p.onDragEnd}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "ArrowRight") p.onMove(1);
        if (e.key === "ArrowLeft") p.onMove(-1);
      }}
      className={cx(
        "group flex min-h-[130px] cursor-grab flex-col gap-1.5 rounded-lg bg-white p-4 outline-bronze hover:bg-[#FFFDF7]",
        closed && "opacity-60",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-[0.04em] text-gray-700">{c.company}</span>
        <span className="flex gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100 [@media(hover:none)]:opacity-100">
          {actions.map((a) => (
            <button
              key={a.label}
              onClick={a.run}
              title={a.label}
              aria-label={a.label}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border-0 bg-gray-100"
            >
              <Icon name={a.icon} className="text-[17px] text-gray-700" />
            </button>
          ))}
        </span>
      </div>
      <span className="text-sm font-semibold">{c.job}</span>

      {c.col === "applied" && <span className="text-[11px] text-gray-400">{c.meta}</span>}

      {c.col === "interview" && (
        <div className="flex flex-col gap-1.5">
          <span className="flex items-center gap-1.5 text-[13px] font-bold text-forest">
            <span className="h-2 w-2 rounded-full bg-mint" />
            {c.meta}
          </span>
          <div className="flex gap-3 text-[13px]">
            <button onClick={p.onJoin} className={cx(linkBtn, "flex items-center gap-1 text-steel")}>
              <Icon name="videocam" className="text-[18px]" />
              Join Interview
            </button>
            <button onClick={p.onReschedule} className={cx(linkBtn, "font-normal text-gray-500")}>Reschedule</button>
          </div>
        </div>
      )}

      {c.col === "offer" && (
        <div className="flex flex-col gap-2">
          <span className="font-display text-base font-semibold text-bronze-dark">{c.salary}</span>
          <span className="text-xs text-gray-500">Joining date: {c.joining}</span>
          {c.offer === "pending" && (
            <div className="flex gap-1.5">
              <button onClick={p.onAccept} className="btn-primary h-[34px] flex-1 cursor-pointer rounded-lg border-0 text-[13px]">Accept Offer</button>
              <button onClick={p.onDecline} className="h-[34px] flex-1 cursor-pointer rounded-lg border-[1.5px] border-danger bg-white text-[13px] font-semibold text-danger">Decline</button>
            </div>
          )}
          {c.offer === "accepted" && (
            <span className="self-start rounded-lg bg-mint-soft px-2.5 py-1.5 text-[13px] font-semibold text-forest-dark">Offer accepted</span>
          )}
          <button onClick={p.onReview} className={cx(linkBtn, "self-start text-bronze")}>Review Full Offer</button>
        </div>
      )}

      {closed && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] text-gray-400">{c.meta}</span>
          <button onClick={p.onFeedback} disabled={p.feedbackAsked} className={cx(linkBtn, "self-start text-gray-700 disabled:cursor-default")}>
            {p.feedbackAsked ? "Feedback requested ✓" : "Request Feedback"}
          </button>
        </div>
      )}
    </div>
  );
}
