"use client";

import { useEffect, useRef, type ReactNode } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  children: ReactNode;
};

/** Centered dialog with scrim; closes on Escape or scrim click. */
export function Modal({ open, onClose, labelledBy, children }: ModalProps) {
  const panel = useRef<HTMLDivElement>(null);
  // Keep the latest onClose without re-running the effect (which would steal focus).
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeRef.current();
    document.addEventListener("keydown", onKey);
    panel.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/50 p-5"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className="flex w-full max-w-[480px] flex-col gap-[18px] rounded-xl bg-white p-7 outline-none"
      >
        {children}
      </div>
    </div>
  );
}
