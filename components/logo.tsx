import Link from "next/link";
import { Icon } from "./icon";

type LogoProps = {
  href?: string;
  /** Show the dark tile with the rising arrow before the wordmark. */
  mark?: boolean;
  size?: "md" | "lg";
  /** Hide the wordmark below 640px, keeping only the mark (for crowded headers). */
  compact?: boolean;
};

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-semibold tracking-[-0.02em] text-gray-800 ${className}`}>
      udda<span className="text-bronze">ya</span>
    </span>
  );
}

export function Logo({ href = "/", mark = true, size = "md", compact = false }: LogoProps) {
  const lg = size === "lg";
  return (
    <Link href={href} className="flex flex-none items-center gap-2.5 text-gray-800 hover:text-gray-800">
      {mark && (
        <span
          className={`flex items-center justify-center rounded-[10px] bg-gray-800 ${lg ? "h-9 w-9" : "h-[34px] w-[34px]"}`}
        >
          <Icon name="north_east" className={`text-gold ${lg ? "text-[24px]" : "text-[22px]"}`} />
        </span>
      )}
      <Wordmark className={`${lg ? "text-[22px]" : "text-xl"} ${compact ? "hidden sm:inline" : ""}`} />
    </Link>
  );
}
