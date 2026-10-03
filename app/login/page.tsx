"use client";

import { useState, type FormEvent } from "react";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Login failed");
      setBusy(false);
      return;
    }
    const next = new URLSearchParams(window.location.search).get("next");
    window.location.href = next && next.startsWith("/") && !next.startsWith("//") ? next : data.redirect;
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-8">
        <Logo size="lg" />
        <h1 className="mt-6 font-display text-2xl font-semibold text-gray-800">Log in</h1>
        <form onSubmit={submit} className="mt-5 flex flex-col gap-3.5">
          <input name="email" type="email" required autoComplete="email" placeholder="Email" className="rounded-[10px] border border-line px-3.5 py-2.5 text-[15px]" />
          <input name="password" type="password" required autoComplete="current-password" placeholder="Password" className="rounded-[10px] border border-line px-3.5 py-2.5 text-[15px]" />
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <button disabled={busy} className="btn-primary rounded-[10px] px-[18px] py-2.5 text-[15px] disabled:opacity-60">
            {busy ? "Logging in…" : "Log in"}
          </button>
        </form>
      </div>
    </main>
  );
}
