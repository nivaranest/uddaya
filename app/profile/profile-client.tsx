"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Icon } from "@/components/icon";
import { ProgressRing } from "@/components/progress-ring";
import { Toast, useToast } from "@/components/toast";
import { CANDIDATE, ENDORSERS } from "@/lib/data";
import { cx, initials } from "@/lib/format";
import { profileCompletion } from "@/lib/profile";

type Basic = { name: string; email: string; phone: string; location: string; headline: string };
type Experience = { company: string; title: string; dates: string; desc: string };
type Education = { school: string; degree: string; year: string };
type Cert = { name: string; issuer: string; date: string; cred: string };
type Skill = { name: string; endorsements: number };
type Resume = { name: string; meta: string };

type ProfileData = {
  photo: string;
  basic: Basic;
  about: string;
  exp: Experience[];
  edu: Education[];
  skills: Skill[];
  certs: Cert[];
  resumes: Resume[];
};

const INITIAL: ProfileData = {
  photo: "",
  basic: { name: CANDIDATE.name, email: CANDIDATE.email, phone: CANDIDATE.phone, location: CANDIDATE.location, headline: CANDIDATE.headline },
  about: CANDIDATE.about,
  exp: CANDIDATE.experience,
  edu: CANDIDATE.education,
  skills: CANDIDATE.skills.map((s) => ({ name: s.name, endorsements: s.endorsements })),
  certs: CANDIDATE.certifications,
  resumes: CANDIDATE.resumes,
};

const ABOUT_MAX = 500;
const RESUME_TYPES = [".pdf", ".doc", ".docx"];
const MAX_RESUME_BYTES = 5 * 1024 * 1024;

const inputCls = "h-[38px] rounded-lg border border-line px-2.5 text-sm text-gray-800";

export function ProfileClient() {
  const [data, setData] = useState<ProfileData>(INITIAL);
  const [edit, setEdit] = useState(false);
  const [backup, setBackup] = useState<ProfileData | null>(null);
  const [newSkill, setNewSkill] = useState("");
  const [dz, setDz] = useState(false);
  const [toast, showToast] = useToast();

  const set = (patch: Partial<ProfileData>) => setData((d) => ({ ...d, ...patch }));
  const startEdit = () => {
    if (edit) return;
    setBackup(data);
    setEdit(true);
  };

  const { pct, nextTip } = profileCompletion({
    photo: data.photo,
    basic: data.basic,
    about: data.about,
    experience: data.exp,
    education: data.edu,
    skills: data.skills,
    certifications: data.certs,
    resumes: data.resumes,
  });

  /** Helpers for the editable list sections (experience, education, certifications). */
  function listOps<K extends "exp" | "edu" | "certs">(key: K) {
    type Item = ProfileData[K][number];
    return {
      change: (i: number, field: keyof Item, value: string) =>
        setData((d) => ({ ...d, [key]: (d[key] as Item[]).map((x, k) => (k === i ? { ...x, [field]: value } : x)) })),
      remove: (i: number) => {
        setData((d) => ({ ...d, [key]: (d[key] as Item[]).filter((_, k) => k !== i) }));
        showToast("Removed");
      },
    };
  }
  const exp = listOps("exp");
  const edu = listOps("edu");
  const certs = listOps("certs");

  function addSkill() {
    const n = newSkill.trim();
    if (!n || data.skills.some((k) => k.name.toLowerCase() === n.toLowerCase())) return;
    set({ skills: [...data.skills, { name: n, endorsements: 0 }] });
    setNewSkill("");
    showToast(`${n} added`);
  }

  function addResume(file?: File) {
    if (!file) return;
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!RESUME_TYPES.includes(ext)) return showToast("Upload a PDF, DOC or DOCX file");
    if (file.size > MAX_RESUME_BYTES) return showToast("Resumes must be 5 MB or smaller");
    // Upload to S3 + Claude resume parsing (PRD §5.1.2) will hook in here.
    set({ resumes: [...data.resumes, { name: file.name, meta: "Uploaded just now" }] });
    showToast(`${file.name} uploaded`);
  }

  function onPhoto(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return showToast("Choose an image file");
    const r = new FileReader();
    r.onload = () => {
      set({ photo: String(r.result) });
      showToast("Photo updated");
    };
    r.readAsDataURL(file);
  }

  const b = data.basic;
  const fields: { label: string; key: keyof Basic; locked?: boolean }[] = [
    { label: "Full Name", key: "name" },
    { label: "Email", key: "email", locked: true },
    { label: "Phone", key: "phone" },
    { label: "Location", key: "location" },
    { label: "Professional Headline", key: "headline" },
  ];

  const tab = (on: boolean) =>
    cx("cursor-pointer rounded-full border-0 px-3.5 py-1.5 text-[13px] font-semibold", on ? "bg-white text-gray-800 shadow-[0_1px_3px_rgba(31,41,55,0.12)]" : "bg-transparent text-gray-500");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-white">
        <div className="mx-auto flex max-w-[1100px] items-center gap-3.5 px-6 py-3">
          <Link href="/dashboard" aria-label="Back" className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-line text-gray-800 hover:text-gray-800">
            <Icon name="arrow_back" className="text-[22px]" />
          </Link>
          <h1 className="m-0 font-display text-[clamp(22px,3vw,28px)] font-semibold">My Profile</h1>
          <div className="ml-auto flex items-center gap-2.5">
            {edit && (
              <>
                <button
                  onClick={() => {
                    if (backup) setData(backup);
                    setEdit(false);
                    setBackup(null);
                  }}
                  className="h-[38px] cursor-pointer rounded-[10px] border border-line bg-white px-3.5 text-sm font-semibold text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setEdit(false);
                    setBackup(null);
                    showToast("Profile saved");
                  }}
                  className="btn-primary h-[38px] cursor-pointer rounded-[10px] border-0 px-4 text-sm"
                >
                  Save
                </button>
              </>
            )}
            <div className="flex rounded-full bg-gray-100 p-[3px]" role="group" aria-label="Mode">
              <button onClick={() => { setEdit(false); setBackup(null); }} className={tab(!edit)} aria-pressed={!edit}>View</button>
              <button onClick={startEdit} className={tab(edit)} aria-pressed={edit}>Edit</button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 px-6 pb-16 pt-7">
        <section className="card flex flex-wrap items-center gap-7 p-[clamp(20px,3vw,32px)]">
          <label className="group relative flex h-[120px] w-[120px] flex-none cursor-pointer items-center justify-center overflow-hidden rounded-full bg-sand-100">
            {data.photo ? (
              // eslint-disable-next-line @next/next/no-img-element -- local data: URL preview
              <img src={data.photo} alt="Profile photo" className="h-full w-full object-cover" />
            ) : (
              <span className="font-display text-[40px] font-semibold text-bronze-deep">{initials(b.name)}</span>
            )}
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 bg-gray-800/60 text-xs font-semibold text-white opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
              <Icon name="photo_camera" className="text-[24px]" />
              Change Photo
            </span>
            <input type="file" accept="image/*" onChange={(e) => onPhoto(e.target.files?.[0])} className="sr-only" aria-label="Change profile photo" />
          </label>
          <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-1.5">
            <span className="font-display text-2xl font-semibold">{b.name}</span>
            <span className="text-base text-gray-500">{b.headline}</span>
            <span className="flex items-center gap-1 text-sm">
              <Icon name="location_on" className="text-[18px] text-bronze" />
              {b.location}
            </span>
            <span className="text-xs text-gray-500">Member since {CANDIDATE.memberSince}</span>
          </div>
          <div className="flex flex-[0_1_260px] items-center gap-4">
            <ProgressRing pct={pct} size={104} stroke={10}>
              <span className="text-[22px]">{pct}%</span>
            </ProgressRing>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold">Profile {pct}% Complete</span>
              <span className="text-[13px] text-gray-500">{nextTip ?? "Your profile is complete"}</span>
              {nextTip && (
                <button
                  onClick={() => (nextTip.includes("photo") ? showToast("Click your avatar to add a photo") : startEdit())}
                  className="btn-primary cursor-pointer self-start rounded-lg border-0 px-3.5 py-2 text-[13px]"
                >
                  Complete Profile
                </button>
              )}
            </div>
          </div>
        </section>

        <div className="grid items-start gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(100%,440px),1fr))]">
          <Card title="Basic Information" action={<EditIconButton onClick={startEdit} />}>
            {fields.map((f) => (
              <div key={f.key} className="flex flex-col gap-1">
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  {f.label}
                  {f.locked && <Icon name="verified" className="text-sm text-forest" />}
                </span>
                {edit && !f.locked ? (
                  <input
                    value={b[f.key]}
                    aria-label={f.label}
                    onChange={(e) => set({ basic: { ...b, [f.key]: e.target.value } })}
                    className="h-10 rounded-lg border border-line px-3 text-sm text-gray-800"
                  />
                ) : (
                  <span className="flex items-center gap-1.5 text-[15px]">
                    {b[f.key]}
                    {f.locked && edit && <span className="text-[11px] text-gray-500">(verified, locked)</span>}
                  </span>
                )}
              </div>
            ))}
          </Card>

          <Card title="About You" gap="gap-3" action={<EditIconButton onClick={startEdit} />}>
            {edit ? (
              <textarea
                value={data.about}
                aria-label="About you"
                onChange={(e) => set({ about: e.target.value.slice(0, ABOUT_MAX) })}
                rows={7}
                className="resize-y rounded-[10px] border border-line p-3 text-sm leading-relaxed text-gray-800"
              />
            ) : (
              <p className="m-0 whitespace-pre-wrap text-[15px] leading-[1.7]">{data.about || "Add a short summary about yourself."}</p>
            )}
            <span className="self-end text-xs text-gray-500">
              {data.about.length}/{ABOUT_MAX}
            </span>
          </Card>

          <Card
            title="Experience"
            action={
              <AddButton
                onClick={() => {
                  startEdit();
                  set({ exp: [{ company: "", title: "", dates: "", desc: "" }, ...data.exp] });
                }}
              />
            }
          >
            <div className="ml-1.5 flex flex-col border-l-2 border-bronze">
              {data.exp.map((x, i) => (
                <div key={i} className="group relative flex flex-col gap-1 pb-5 pl-[22px] pt-1">
                  <span className="absolute -left-[7px] top-2 h-3 w-3 rounded-full border-[3px] border-bronze bg-white" />
                  {edit ? (
                    <>
                      <div className="grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
                        <input value={x.company} onChange={(e) => exp.change(i, "company", e.target.value)} placeholder="Company" aria-label="Company" className={inputCls} />
                        <input value={x.title} onChange={(e) => exp.change(i, "title", e.target.value)} placeholder="Job title" aria-label="Job title" className={inputCls} />
                        <input value={x.dates} onChange={(e) => exp.change(i, "dates", e.target.value)} placeholder="Jan 2023 - Present" aria-label="Dates" className={inputCls} />
                      </div>
                      <textarea value={x.desc} onChange={(e) => exp.change(i, "desc", e.target.value)} rows={2} placeholder="What you did" aria-label="Description" className="resize-y rounded-lg border border-line px-2.5 py-2 text-sm" />
                    </>
                  ) : (
                    <>
                      <span className="font-display text-base font-semibold">{x.company}</span>
                      <span className="text-sm">{x.title}</span>
                      <span className="text-xs text-gray-500">{x.dates}</span>
                      <span className="mt-0.5 text-sm leading-normal">{x.desc}</span>
                      <RowTools onEdit={startEdit} onDelete={() => exp.remove(i)} />
                    </>
                  )}
                </div>
              ))}
            </div>
            <TextAdd
              label="+ Add Experience"
              onClick={() => {
                startEdit();
                set({ exp: [{ company: "", title: "", dates: "", desc: "" }, ...data.exp] });
              }}
            />
          </Card>

          <Card
            title="Education"
            action={
              <AddButton
                onClick={() => {
                  startEdit();
                  set({ edu: [...data.edu, { school: "", degree: "", year: "" }] });
                }}
              />
            }
          >
            {data.edu.map((x, i) => (
              <div key={i} className="group relative flex items-start gap-3.5">
                <Icon name="school" className="flex-none text-[24px] text-bronze" />
                {edit ? (
                  <div className="grid flex-1 gap-2 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
                    <input value={x.school} onChange={(e) => edu.change(i, "school", e.target.value)} placeholder="School" aria-label="School" className={inputCls} />
                    <input value={x.degree} onChange={(e) => edu.change(i, "degree", e.target.value)} placeholder="Degree" aria-label="Degree" className={inputCls} />
                    <input value={x.year} onChange={(e) => edu.change(i, "year", e.target.value)} placeholder="Year" aria-label="Year" className={inputCls} />
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-[3px]">
                      <span className="font-display text-base font-semibold">{x.school}</span>
                      <span className="text-sm">{x.degree}</span>
                      <span className="text-xs text-gray-500">{x.year}</span>
                    </div>
                    <RowTools onEdit={startEdit} onDelete={() => edu.remove(i)} />
                  </>
                )}
              </div>
            ))}
            <TextAdd
              label="+ Add Education"
              onClick={() => {
                startEdit();
                set({ edu: [...data.edu, { school: "", degree: "", year: "" }] });
              }}
            />
          </Card>

          <Card title="Skills">
            <div className="flex flex-wrap gap-2">
              {data.skills.map((k, i) => (
                <span key={k.name} tabIndex={k.endorsements > 0 ? 0 : undefined} className="group relative inline-flex items-center gap-1.5 rounded-lg bg-mist py-[7px] pl-3 pr-2.5 text-sm font-medium">
                  {k.name}
                  {k.endorsements > 0 && (
                    <span className="rounded-full bg-gold px-1.5 py-px text-[11px] font-bold" aria-label={`${k.endorsements} endorsements`}>
                      {k.endorsements}
                    </span>
                  )}
                  {edit && (
                    <button
                      onClick={() => set({ skills: data.skills.filter((_, j) => j !== i) })}
                      aria-label={`Remove ${k.name}`}
                      className="flex cursor-pointer border-0 bg-transparent p-0 text-gray-800"
                    >
                      <Icon name="close" className="text-base" />
                    </button>
                  )}
                  {k.endorsements > 0 && <EndorsementTip count={k.endorsements} />}
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill()}
                list="skill-sug"
                placeholder="Search skills to add"
                aria-label="Add a skill"
                className="h-10 min-w-0 flex-1 rounded-lg border border-line px-3 text-sm"
              />
              <datalist id="skill-sug">
                {["Node.js", "TypeScript", "Docker", "Kubernetes", "Django", "GraphQL"].map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
              <button onClick={addSkill} className="btn-primary h-10 cursor-pointer rounded-lg border-0 px-4 text-sm">
                Add
              </button>
            </div>
          </Card>

          <Card
            title="Certifications"
            action={
              <AddButton
                onClick={() => {
                  startEdit();
                  set({ certs: [...data.certs, { name: "", issuer: "", date: "", cred: "" }] });
                }}
              />
            }
          >
            {data.certs.map((x, i) => (
              <div key={i} className="group relative flex items-start gap-3.5">
                <Icon name="workspace_premium" className="flex-none text-[24px] text-bronze" />
                {edit ? (
                  <div className="grid flex-1 gap-2 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
                    <input value={x.name} onChange={(e) => certs.change(i, "name", e.target.value)} placeholder="Certification" aria-label="Certification" className={inputCls} />
                    <input value={x.issuer} onChange={(e) => certs.change(i, "issuer", e.target.value)} placeholder="Issuer" aria-label="Issuer" className={inputCls} />
                    <input value={x.date} onChange={(e) => certs.change(i, "date", e.target.value)} placeholder="Issue date" aria-label="Issue date" className={inputCls} />
                    <input value={x.cred} onChange={(e) => certs.change(i, "cred", e.target.value)} placeholder="Credential ID" aria-label="Credential ID" className={inputCls} />
                  </div>
                ) : (
                  <>
                    <div className="flex flex-1 flex-col gap-[3px]">
                      <span className="text-sm font-bold">{x.name}</span>
                      <span className="text-xs">{x.issuer}</span>
                      <span className="text-xs text-gray-500">{x.date}</span>
                      <div className="mt-0.5 flex items-center gap-3 text-xs">
                        <span className="text-bronze">Credential ID: {x.cred}</span>
                        <button onClick={() => showToast("Certificate download will be available once files are stored")} className="flex cursor-pointer items-center gap-0.5 border-0 bg-transparent p-0 text-gray-700">
                          <Icon name="download" className="text-base" />
                          Certificate
                        </button>
                      </div>
                    </div>
                    <RowTools onEdit={startEdit} onDelete={() => certs.remove(i)} />
                  </>
                )}
              </div>
            ))}
            <TextAdd
              label="+ Add Certification"
              onClick={() => {
                startEdit();
                set({ certs: [...data.certs, { name: "", issuer: "", date: "", cred: "" }] });
              }}
            />
          </Card>

          <Card title="Resume">
            {data.resumes.map((r, i) => (
              <div key={r.name + i} className="flex items-center gap-3 rounded-xl border border-line p-3">
                <Icon name="description" className="text-[28px] text-bronze" />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className={cx("truncate text-sm text-steel", i === 0 ? "font-bold" : "font-medium")}>{r.name}</span>
                  <span className="text-xs text-gray-500">{i === 0 ? `Primary · ${r.meta}` : r.meta}</span>
                </div>
                {i > 0 && (
                  <button
                    onClick={() => {
                      set({ resumes: [r, ...data.resumes.filter((_, k) => k !== i)] });
                      showToast(`${r.name} is now primary`);
                    }}
                    className="cursor-pointer whitespace-nowrap rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-800"
                  >
                    Make primary
                  </button>
                )}
                <button
                  onClick={() => {
                    set({ resumes: data.resumes.filter((_, k) => k !== i) });
                    showToast("Resume deleted");
                  }}
                  aria-label={`Delete ${r.name}`}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-0 bg-gray-100"
                >
                  <Icon name="delete" className="text-[18px] text-danger" />
                </button>
              </div>
            ))}
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDz(true);
              }}
              onDragLeave={() => setDz(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDz(false);
                addResume(e.dataTransfer.files[0]);
              }}
              className={cx(
                "flex cursor-pointer flex-col items-center gap-1.5 rounded-[10px] border-2 border-dashed p-6 text-center",
                dz ? "border-sage bg-mint-wash" : "border-line bg-gray-50",
              )}
            >
              <Icon name="upload_file" className="text-[32px] text-bronze" />
              <span className="text-sm">
                Drag and drop, or <strong className="text-forest">Upload Resume</strong>
              </span>
              <span className="text-xs text-gray-500">Accepted formats: PDF, DOC, DOCX (max 5 MB)</span>
              <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => addResume(e.target.files?.[0])} className="sr-only" aria-label="Upload resume" />
            </label>
          </Card>
        </div>
      </div>

      <Toast message={toast} />
    </div>
  );
}

function Card({ title, action, gap = "gap-4", children }: { title: string; action?: ReactNode; gap?: string; children: ReactNode }) {
  return (
    <section className={cx("card flex flex-col p-6", gap)}>
      <div className="flex items-center justify-between">
        <h2 className="m-0 font-display text-lg font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function EditIconButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label="Edit" className="flex cursor-pointer border-0 bg-transparent">
      <Icon name="edit" className="text-[20px] text-bronze" />
    </button>
  );
}

function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="btn-primary cursor-pointer rounded-lg border-0 px-3 py-1.5 text-[13px]">
      + Add
    </button>
  );
}

function TextAdd({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="cursor-pointer self-start border-0 bg-transparent p-0 text-sm font-semibold text-forest">
      {label}
    </button>
  );
}

function RowTools({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const btn = "flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-md border-0 bg-gray-100";
  return (
    <div className="absolute right-0 top-0 flex gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
      <button onClick={onEdit} aria-label="Edit" className={btn}>
        <Icon name="edit" className="text-[17px] text-bronze" />
      </button>
      <button onClick={onDelete} aria-label="Delete" className={btn}>
        <Icon name="delete" className="text-[17px] text-danger" />
      </button>
    </div>
  );
}

function EndorsementTip({ count }: { count: number }) {
  const names = count > 2 ? `${ENDORSERS.slice(0, 2).join(", ")} and ${count - 2} others` : ENDORSERS.slice(0, count).join(" and ");
  return (
    <span className="invisible absolute left-0 top-[calc(100%+6px)] z-[5] flex w-[220px] flex-col gap-2 rounded-[10px] border border-line bg-white p-2.5 font-normal shadow-[0_10px_24px_rgba(31,41,55,0.14)] group-focus:visible group-hover:visible">
      <span className="flex">
        {ENDORSERS.slice(0, Math.min(count, 4)).map((p) => (
          <span key={p} className="-mr-1.5 flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 border-white bg-sand-100 text-[10px] font-bold text-bronze-deep">
            {initials(p)}
          </span>
        ))}
      </span>
      <span className="text-xs leading-[1.4]">Endorsed by {names}</span>
    </span>
  );
}
