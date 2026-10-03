"use client";

import type { ReactNode } from "react";

/** Clears the session cookie, then goes to the login page. */
export function LogoutLink({ className, children = "Log out" }: { className?: string; children?: ReactNode }) {
  return (
    <button
      className={className}
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/login";
      }}
    >
      {children}
    </button>
  );
}
