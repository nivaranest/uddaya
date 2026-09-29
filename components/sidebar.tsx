"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "./icon";
import { cx } from "@/lib/format";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  /** Height of the sticky header above the sidebar, in px. */
  top: number;
  className?: string;
  children: ReactNode;
};

/**
 * Sticky sidebar on desktop (≥1024px); slide-in drawer with a scrim below that.
 */
export function Sidebar({ open, onClose, top, className = "", children }: SidebarProps) {
  return (
    <>
      <aside
        style={{ ["--top" as string]: `${top}px` }}
        className={cx(
          "w-60 flex-none flex-col border-r border-line px-3.5 py-5",
          "fixed inset-y-0 left-0 z-[25] pt-20 shadow-drawer",
          "lg:sticky lg:top-[var(--top)] lg:z-auto lg:flex lg:h-[calc(100vh-var(--top))] lg:pt-5 lg:shadow-none",
          open ? "flex" : "hidden",
          className,
        )}
      >
        {children}
      </aside>
      {open && <div onClick={onClose} className="fixed inset-0 z-20 bg-gray-800/35 lg:hidden" aria-hidden="true" />}
    </>
  );
}

export function MenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Menu"
      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[10px] border border-line bg-white lg:hidden"
    >
      <Icon name="menu" className="text-[22px] text-gray-800" />
    </button>
  );
}

type NavItemProps = {
  icon: string;
  label: string;
  href: string;
  active?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
};

export function NavItem({ icon, label, href, active, onClick }: NavItemProps) {
  const cls = cx(
    "flex items-center gap-3 rounded-[10px] px-3.5 py-[11px] text-[15px]",
    active ? "bg-sand-100 font-semibold text-bronze-deep hover:text-bronze-deep" : "font-medium text-gray-700 hover:bg-white/60 hover:text-gray-800",
  );
  const content = (
    <>
      <Icon name={icon} className="text-[20px]" />
      {label}
    </>
  );
  return href.startsWith("/") ? (
    <Link href={href} onClick={onClick} className={cls} aria-current={active ? "page" : undefined}>
      {content}
    </Link>
  ) : (
    <a href={href} onClick={onClick} className={cls} aria-current={active ? "page" : undefined}>
      {content}
    </a>
  );
}
