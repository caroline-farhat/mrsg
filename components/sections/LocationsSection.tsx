"use client";
import Image from "next/image";
import { memo, useRef, useState, useEffect, type KeyboardEvent, type ReactElement } from "react";

/*
  Locations section. Layers (back to front):
  1. ONE static cinematic background           -> /public/locations/bg-showroom.webp
  2. white-to-dark fade + map/network overlay (SVG)
  3. the real MRS.G machine (separate transparent PNG) -> /public/locations/machine.png
  4. HTML text and the five expanding cards
  Only the cards react to selection; background and machine never change.
*/

type Loc = { n: string; t: string; s: string; title: string; desc: string; card: string };

const LOCS: Loc[] = [
  { n: "01", t: "p1", s: "p1p", title: "Petrol stations", desc: "Clean helmets during your fuel stop", card: "/locations/card-petrol.webp" },
  { n: "02", t: "p2", s: "p2p", title: "Motorcycle rentals", desc: "Always a fresh helmet for your next ride", card: "/locations/card-rental.webp" },
  { n: "03", t: "p3", s: "p3p", title: "Shared fleets", desc: "Hygiene at scale for every rider", card: "/locations/card-fleet.webp" },
  { n: "04", t: "p4", s: "p4p", title: "Shopping malls", desc: "Conveniently located in your daily stops", card: "/locations/card-mall.webp" },
  { n: "05", t: "p5", s: "p5p", title: "Delivery hubs", desc: "Helmet hygiene for couriers between shifts", card: "/locations/card-delivery.webp" },
];

const ICONS: ReactElement[] = [
  <svg key="i1" viewBox="0 0 48 48" aria-hidden="true"><path d="M10 41V9h18v32M7 41h24M14 15h10v8H14zM28 17l7 4v14a3 3 0 0 0 6 0V19l-5-5" /></svg>,
  <svg key="i2" viewBox="0 0 48 48" aria-hidden="true"><circle cx="11" cy="32" r="6" /><circle cx="37" cy="32" r="6" /><path d="M11 32l8-12h11l7 12M19 20l-2-5h-6M26 20l3-7h5" /></svg>,
  <svg key="i3" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="13" r="4.5" /><circle cx="10" cy="19" r="3.5" /><circle cx="38" cy="19" r="3.5" /><path d="M16 40V28a8 8 0 0 1 16 0v12zM4 38V28a6 6 0 0 1 6-6M44 38V28a6 6 0 0 0-6-6" /></svg>,
  <svg key="i4" viewBox="0 0 48 48" aria-hidden="true"><path d="M10 16h28l2 26H8zM17 20v-5a7 7 0 0 1 14 0v5" /></svg>,
  <svg key="i5" viewBox="0 0 48 48" aria-hidden="true"><path d="M24 6l16 8v20l-16 8-16-8V14zM8 14l16 8 16-8M24 22v20" /></svg>,
];

/* Card: memoised, so selecting a location re-renders only the two cards whose state changed. */
const Card = memo(function Card({ l, i, on, onSelect, setRef }: { l: Loc; i: number; on: boolean; onSelect: (i: number) => void; setRef: (i: number, el: HTMLButtonElement | null) => void }) {
  return (
    <button ref={(el) => setRef(i, el)} type="button" className={"lc" + (on ? " on" : "")} aria-pressed={on} aria-expanded={on} onClick={() => onSelect(i)}>
      <span className="lc-top"><span className="lc-n">{l.n}</span><span className="lc-ic">{ICONS[i]}</span></span>
      <span className="lc-t" data-i={l.t} suppressHydrationWarning>{l.title}</span>
      <span className="lc-img"><Image src={l.card} alt="" fill sizes="(max-width: 700px) 70vw, 320px" quality={85} loading="eager" decoding="async" /></span>
      <span className="lc-sw" aria-hidden={!on}><span className="lc-s" data-i={l.s} suppressHydrationWarning>{l.desc}</span></span>
    </button>
  );
});

export default function LocationsSection() {
  const [sel, setSel] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const n = LOCS.length;

  // swipe layouts: keep the selected card centred while it expands (follows the width transition frame by frame).
  // Works from on-screen geometry, so it is identical in LTR and RTL (RTL scrollLeft is 0 or negative, which the old
  // offsetLeft/clamp-to-[0,max] maths pulled back towards the first card). Scroll-snap is paused while it runs, it stops as
  // soon as the user touches or wheels the track, and a new selection cancels the previous run (never two loops at once).
  const firstRun = useRef(true);
  const selRef = useRef(0);
  // Every selection goes through here. On a swipe layout, scroll-snap is switched off *before* the card starts to grow:
  // otherwise the browser re-snaps the track to the nearest snap point on the first layout change and the view twitches.
  // The effect below restores it when the follow animation ends.
  const select = useRef((i: number) => {
    if (i === selRef.current) return;
    selRef.current = i;
    const t = track.current;
    if (t && t.scrollWidth > t.clientWidth + 2) t.style.scrollSnapType = "none";
    setSel(i);
  }).current;
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }  // nothing to follow on load
    const t = track.current;
    if (!t) return;
    if (t.scrollWidth <= t.clientWidth + 2) { t.style.removeProperty("scroll-snap-type"); return; }   // desktop: all cards fit, no scrolling
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = performance.now();
    const start = last;
    const finish = () => { cancelAnimationFrame(raf); t.style.removeProperty("scroll-snap-type"); t.removeEventListener("touchstart", finish); t.removeEventListener("wheel", finish); };
    t.style.scrollSnapType = "none";
    t.addEventListener("touchstart", finish, { passive: true });
    t.addEventListener("wheel", finish, { passive: true });
    const step = (now: number) => {
      const dt = Math.min(now - last, 50);
      last = now;
      const c = cards.current[sel];
      if (c) {
        const cr = c.getBoundingClientRect();
        const tr = t.getBoundingClientRect();
        const delta = cr.left + cr.width / 2 - (tr.left + tr.width / 2);   // >0: card is right of centre; scrollLeft += moves the view right in both directions
        t.scrollLeft += reduce ? delta : delta * (1 - Math.exp(-dt / 70));
      }
      if (now - start < 520) raf = requestAnimationFrame(step); else finish();
    };
    raf = requestAnimationFrame(step);
    return finish;
  }, [sel]);

  const setRef = useRef((i: number, el: HTMLButtonElement | null) => { cards.current[i] = el; }).current;
  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const rtl = document.documentElement.dir === "rtl";
    let next: number | null = null;
    if (e.key === "ArrowRight") next = sel + (rtl ? -1 : 1);
    else if (e.key === "ArrowLeft") next = sel + (rtl ? 1 : -1);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    if (next === null) return;
    e.preventDefault();
    const i = ((next % n) + n) % n;
    select(i);
    cards.current[i]?.focus({ preventScroll: true });
  }

  return (
    <section id="loc" className="loc" data-scene={sel}>
      {/* 1 · scenes */}
      <div className="loc-scenes" aria-hidden="true"><Image src="/locations/bg-showroom.webp" alt="" fill sizes="100vw" quality={82} priority /></div>

      {/* 2 · fade + network overlay */}
      <div className="loc-fade" aria-hidden="true" />
      <svg className="loc-map" viewBox="0 0 520 380" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="locdots" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.1" /></pattern>
          <radialGradient id="locmask" cx="50%" cy="50%" r="55%"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#000" /></radialGradient>
          <mask id="locm"><rect width="520" height="380" fill="url(#locmask)" /></mask>
        </defs>
        <rect className="dots" width="520" height="380" fill="url(#locdots)" mask="url(#locm)" />
        <g className="lines" fill="none">
          <path d="M118 36C196 44 258 82 300 150" />
          <path d="M118 36C150 100 190 168 262 232" />
          <path d="M262 232C340 196 420 200 468 232" />
          <path d="M300 150C360 140 430 170 468 232" />
        </g>
        {[[118, 36], [262, 232], [300, 150], [468, 232]].map(([x, y], i) => (
          <g key={i} className="pin" transform={`translate(${x} ${y})`}>
            <ellipse className="pin-g" cy="1" rx="14" ry="5" />
            <path d="M0 0C-8-12-11-17-11-23a11 11 0 0 1 22 0c0 6-3 11-11 23z" />
            <circle cy="-23" r="4" />
          </g>
        ))}
      </svg>

      {/* 4 · content */}
      <div className="fw loc-in">
        {/* 3 · the machine (separate transparent layer, identical in every scene) */}
        <div className="loc-machine">
          <Image src="/locations/machine.png" alt="MRS.G helmet-cleaning machine: black upper body with display, red-lit chamber with a helmet, red lower panel reading KASK TEMİZLEME MAKİNESİ" width={602} height={1289} sizes="(max-width: 1279px) 40vw, 24vw" quality={90} priority />
        </div>
        <div className="loc-head">
          <span className="eye" data-i="e3" suppressHydrationWarning>Locations</span>
          <h2 className="d loc-h" data-i="l0" suppressHydrationWarning>Placed where helmets already are</h2>
          <p className="loc-p" data-i="l0p" suppressHydrationWarning>From fuel stops to city hubs, MRS.G machines are designed for high-traffic locations, so clean helmets are always within reach</p>
        </div>

        <div className="loc-bottom">
          <div className="loc-track" ref={track} role="group" aria-label="Locations" onKeyDown={onKey}>
            {LOCS.map((l, i) => (
              <Card key={l.n} l={l} i={i} on={i === sel} onSelect={select} setRef={setRef} />
            ))}
          </div>

          <div className="loc-prog" aria-hidden="true">
            <span>{LOCS[sel].n}</span>
            <i><b style={{ transform: `scaleX(${(sel + 1) / n})` }} /></i>
            <span>0{n}</span>
          </div>
          <p className="sr" aria-live="polite">{`${LOCS[sel].n} / 0${n}: ${LOCS[sel].title}`}</p>
        </div>
      </div>
    </section>
  );
}
