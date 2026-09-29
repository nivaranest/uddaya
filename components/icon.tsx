import type { CSSProperties } from "react";

type IconProps = {
  name: string;
  className?: string;
  filled?: boolean;
  style?: CSSProperties;
};

/** Material Symbols Rounded glyph. Decorative by default (aria-hidden). */
export function Icon({ name, className = "", filled = false, style }: IconProps) {
  return (
    <span aria-hidden="true" className={`icon ${filled ? "icon-filled" : ""} ${className}`} style={style}>
      {name}
    </span>
  );
}
