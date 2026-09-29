"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Minimal typing for the Web Speech API (not in lib.dom for all browsers).
type Recognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

/** Dictation via the browser's SpeechRecognition, when available. */
export function useSpeech(onText: (text: string) => void) {
  const [recording, setRecording] = useState(false);
  const [supported, setSupported] = useState(false);
  const rec = useRef<Recognition | null>(null);
  const onTextRef = useRef(onText);
  onTextRef.current = onText;

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;
    const r = new Ctor();
    r.continuous = true;
    r.interimResults = false;
    r.lang = "en-IN";
    r.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) onTextRef.current(e.results[i][0].transcript.trim());
      }
    };
    r.onend = () => setRecording(false);
    r.onerror = () => setRecording(false);
    rec.current = r;
    setSupported(true);
    return () => r.stop();
  }, []);

  const toggle = useCallback(() => {
    if (!rec.current) return;
    if (recording) rec.current.stop();
    else rec.current.start();
    setRecording(!recording);
  }, [recording]);

  const stop = useCallback(() => {
    rec.current?.stop();
    setRecording(false);
  }, []);

  return { supported, recording, toggle, stop };
}
