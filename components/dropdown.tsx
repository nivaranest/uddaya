"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cx } from "@/lib/format";

type DropdownProps = {
  open: boolean;
  onClose: () => void;
  trigger: ReactNode;
  className?: string;
  children: ReactNode;
};

/** Anchored popover that closes on outside click or Escape. */
export function Dropdown({ open, onClose, trigger, className = "", children }: DropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div ref={ref} className="relative">
      {trigger}
      {open && (
        <div className={cx("absolute right-0 top-[50px] z-40 rounded-[10px] border border-line bg-white shadow-pop", className)}>
          {children}
        </div>
      )}
    </div>
  );
}
