"use client";
import { useCallback, useEffect, useRef } from "react";

type EmbedWindow = Window & { __mrsgSetPaused?: (paused: boolean) => void };

/**
 * Full-bleed first screen. The original MRS.G Three.js project runs unchanged inside a
 * borderless iframe (public/3d/embed.html), isolated from React, SSR and the page's own scripts.
 * Its render loop is paused while the hero is scrolled out of view.
 */
export default function Hero3D() {
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const visible = useRef(true);

  const sync = useCallback(() => {
    (frame.current?.contentWindow as EmbedWindow | null)?.__mrsgSetPaused?.(!visible.current);
  }, []);

  useEffect(() => {
    if (!box.current) return;
    const io = new IntersectionObserver(([e]) => { visible.current = e.isIntersecting; sync(); }, { threshold: 0 });
    io.observe(box.current);
    return () => io.disconnect();
  }, [sync]);

  return (
    <div id="hero3d" ref={box} role="region" aria-label="Interactive MRS.G machine">
      <h1 className="sr" data-i="h1" suppressHydrationWarning>Clean helmets. Anywhere</h1>
      <iframe
        ref={frame}
        src="/3d/embed.html"
        title="MRS.G helmet cleaning machine, interactive 3D"
        allow="fullscreen"
        onLoad={sync}
      />
      <a className="cue" href="#story" aria-label="Scroll to content">
        <span data-i="sc" suppressHydrationWarning>Scroll</span><i />
      </a>
    </div>
  );
}
