"use client";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";

type Props = {
  title: string;
  src: string;
  closeLabel: string;
  errorText: string;
  onClosed: () => void;
};

const CLOSE_MS = 180;
const FOCUSABLE = 'button:not([disabled]),video[controls],[href],[tabindex]:not([tabindex="-1"])';

/* Native HTML5 video in an accessible modal. One <video> exists only while the modal is open, so no video is
   fetched on page load and two videos can never play at once. Closing pauses, rewinds and empties the element. */
export default function ReferenceVideoModal({ title, src, closeLabel, errorText, onClosed }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const closingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [closing, setClosing] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const titleId = "rf-modal-title";

  const release = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    try { video.currentTime = 0; } catch { /* metadata not loaded yet */ }
    video.removeAttribute("src");
    video.load(); // aborts any download and frees the decoder
  }, []);

  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    release(); // stop playback immediately, before the exit animation
    setClosing(true);
    const calm = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    timerRef.current = setTimeout(onClosed, calm ? 0 : CLOSE_MS);
  }, [onClosed, release]);

  /* Scroll lock: hide the page scrollbar (compensating its width) and restore the exact position afterwards. */
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const y = window.scrollY;
    const scrollbar = window.innerWidth - html.clientWidth;
    const prevOverflow = html.style.overflow;
    const prevPad = body.style.paddingRight;
    html.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    return () => {
      html.style.overflow = prevOverflow;
      body.style.paddingRight = prevPad;
      if (Math.abs(window.scrollY - y) > 1) window.scrollTo({ top: y, left: 0, behavior: "instant" as ScrollBehavior });
    };
  }, []);

  /* Escape closes; focus starts on the close button; focus returns to the Watch Video button on unmount. */
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: globalThis.KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); requestClose(); } };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      clearTimeout(timerRef.current);
      videoRef.current?.pause(); // pause only: src is emptied in requestClose, so React strict-mode re-mounts keep a working player
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, [requestClose]);

  /* Keep Tab inside the dialog. */
  const onDialogKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const items = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
  };

  return createPortal(
    <div className={`rf-back${closing ? " is-closing" : ""}`} onClick={(e) => { if (e.target === e.currentTarget) requestClose(); }}>
      <div ref={dialogRef} className="rf-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} onKeyDown={onDialogKeyDown}>
        <div className="rf-bar">
          <span id={titleId} className="rf-bar-t">{title}</span>
          <button ref={closeRef} type="button" className="rf-x" aria-label={closeLabel} onClick={requestClose}>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>
        <div className="rf-stage" data-status={status}>
          <video
            ref={videoRef}
            className="rf-video"
            src={src}
            controls
            playsInline
            preload="metadata"
            onLoadedData={() => setStatus((s) => (s === "error" ? s : "ready"))}
            onError={() => { if (!closingRef.current) setStatus("error"); }}
          />
          {status === "loading" && <span className="rf-spin" aria-hidden="true" />}
          {status === "error" && <p className="rf-err" role="alert">{errorText}</p>}
        </div>
      </div>
    </div>,
    document.body,
  );
}
