"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "./icon";

/** Transient confirmation message, shown bottom-centre for 2.4s. */
export function useToast(duration = 2400) {
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const show = useCallback(
    (msg: string) => {
      clearTimeout(timer.current);
      setMessage(msg);
      timer.current = setTimeout(() => setMessage(""), duration);
    },
    [duration],
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  return [message, show] as const;
}

export function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-xl bg-gray-800 px-[18px] py-3 text-sm text-white shadow-toast"
    >
      <Icon name="check_circle" className="text-[20px] text-sage" />
      {message}
    </div>
  );
}
