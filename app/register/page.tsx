"use client";

import { useState, type FormEvent } from "react";
import { Logo } from "@/components/logo";

export default function RegisterPage() {
  const [type, setType] = useState<"candidate" | "company">("candidate");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const input = "rounded-[10px] border border-line px-3.5 py-2.5 text-[15px]";

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, ...f }) });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setDone(true);
    else setError(data.error ?? "Registration failed");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-8">
        <Logo size="lg" />
        <h1 className="mt-6 font-display text-2xl font-semibold text-gray-800">Create an account</h1>
        {done ? (
          <p className="mt-5 text-[15px] text-gray-700">
            Account created. {type === "company" && "Your company needs a licence from the Uddaya team before you can post jobs. "}
            <a href="/login" className="font-semibold text-bronze-deep">Log in</a>
          </p>
        ) : (
          <>
            <div className="mt-4 flex gap-2 text-sm font-semibold">
              {(["candidate", "company"] as const).map((t) => (
                <button key={t} type="button" onClick={() => setType(t)} className={`flex-1 rounded-[10px] border px-3 py-2 ${type === t ? "border-bronze bg-sand-100 text-bronze-deep" : "border-line text-gray-700"}`}>
                  {t === "candidate" ? "Job seeker" : "Company"}
                </button>
              ))}
            </div>
            <form onSubmit={submit} className="mt-4 flex flex-col gap-3.5">
              {type === "company" && <input name="companyName" required placeholder="Company name" className={input} />}
              <input name="name" required placeholder={type === "company" ? "Your name" : "Full name"} className={input} />
              <input name="email" type="email" required placeholder="Email" className={input} />
              <input name="password" type="password" required minLength={8} placeholder="Password (min 8)" className={input} />
              {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
              <button className="btn-primary rounded-[10px] px-[18px] py-2.5 text-[15px]">Sign up</button>
            </form>
            <p className="mt-4 text-sm text-gray-600">Already registered? <a href="/login" className="font-semibold text-bronze-deep">Log in</a></p>
          </>
        )}
      </div>
    </main>
  );
}
