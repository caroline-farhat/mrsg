"use client";
import Image from "next/image";
import { useRef, useState, type KeyboardEvent } from "react";

const TICKS = Array.from({ length: 60 }, (_, i) => i);

const ITEMS = [
  { n: "01", t: "t1", s: "t1p", title: "Hygiene you can trust", desc: "A sealed chamber cleans and refreshes the inside of the helmet, so the next rider starts clean",
    img: "/service/hygiene.webp", imgDark: "/service/hygiene-dark.webp", alt: "MRS.G helmet-cleaning machine with a helmet in the red-lit chamber and a helmet in mist beside it" },
  { n: "02", t: "t2", s: "t2p", title: "Quick enough to wait for", desc: "A short cycle fits a fuel stop or a pickup. No appointment, no staff needed",
    img: "/service/time.webp", imgDark: "/service/time-dark.webp", alt: "MRS.G helmet-cleaning machine: black upper body with display, red lower panel" },
  { n: "03", t: "t3", s: "t3p", title: "Always where you ride", desc: "Machines sit in stations, rental points and hubs, so clean helmets are never a detour",
    img: "/service/places.webp", imgDark: "/service/places-dark.webp", alt: "MRS.G helmet-cleaning machine in a hall with a motorcycle in the background" },
] as const;

const ICONS = [
  <svg key="a" viewBox="0 0 64 64" aria-hidden="true"><g transform="translate(-4 5)"><path d="M14.5 46C11 46 9.3 43.6 9.6 41L10.3 31C10.9 18.5 19.5 10 31.5 10C43.5 10 52 18.5 52 31V42.5C52 45.2 50 47.5 47 47.5H22C19 47.5 17.5 46 14.5 46Z"/><path d="M10.3 25H31C35 25 38 27.5 38 31C38 34 36 36.5 32.5 36.5H10.1"/><circle cx="44.5" cy="31" r="2"/><path d="M14.5 42H21"/><path className="rf" d="M55 6.5Q55.9 11.1 60.5 12Q55.9 12.9 55 17.5Q54.1 12.9 49.5 12Q54.1 11.1 55 6.5Z"/><path className="rf" d="M60.5 18.2Q60.9 20.6 63.3 21Q60.9 21.4 60.5 23.8Q60.1 21.4 57.7 21Q60.1 20.6 60.5 18.2Z"/></g></svg>,
  <svg key="b" viewBox="0 0 64 64" aria-hidden="true"><circle cx="35" cy="37" r="18"/><path d="M31 11h8M35 11v8"/><path d="M35 37V27M35 37l7 5"/><path d="M49 22l4-4"/><path className="r" d="M3 30h13M1 38h12M6 46h11"/></svg>,
  <svg key="c" viewBox="0 0 64 64" aria-hidden="true"><path d="M32 6c-9 0-15 6.5-15 15 0 11 15 26 15 26s15-15 15-26c0-8.5-6-15-15-15z"/><circle cx="32" cy="21" r="6"/><ellipse className="r" cx="32" cy="55" rx="13" ry="4"/></svg>,
];

export default function ServiceSection() {
  const [sel, setSel] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const n = ITEMS.length;
    let next = -1;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (sel + 1) % n;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (sel + n - 1) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    if (next < 0) return;
    e.preventDefault();
    setSel(next);
    refs.current[next]?.focus();
  }

  return (
    <section id="service">
      <div className="fw svc-in">
        <span className="eye" data-i="e2" suppressHydrationWarning>The service</span>
        <h2 className="d svc-h" data-i="v1" suppressHydrationWarning>Three reasons riders come back</h2>

        <div className="svc-vis">
          {ITEMS.map((it, i) => (
            <figure key={it.img} id={`svc-panel-${i}`} role="tabpanel" aria-labelledby={`svc-tab-${i}`} aria-hidden={i !== sel} className={i === sel ? "on" : ""}>
              <Image className="img-l" src={it.img} alt={it.alt} fill sizes="(max-width: 1000px) 100vw, 56vw" quality={85} />
              <Image className="img-d" src={it.imgDark} alt={it.alt} fill sizes="(max-width: 1000px) 100vw, 56vw" quality={85} />
              {i === 0 && <div className="mist" aria-hidden="true"><i /><i /></div>}
              {i === 1 && (
                <div className="clock" aria-hidden="true">
                  <svg viewBox="0 0 400 400">
                    <circle className="rg" cx="200" cy="200" r="196" />
                    {TICKS.map((k) => (
                      <line key={k} className={k % 5 === 0 ? "tk m" : "tk"} x1="200" y1={k % 5 === 0 ? 8 : 14} x2="200" y2="24" transform={`rotate(${k * 6} 200 200)`} />
                    ))}
                    <g className="sw"><path d="M200 200 L200 12 A188 188 0 0 1 333 67 Z" /><line x1="200" y1="200" x2="200" y2="12" /></g>
                    <circle cx="200" cy="200" r="5" fill="#e10b1f" />
                  </svg>
                </div>
              )}
              {i === 2 && (
                <div className="pins" aria-hidden="true">
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M7 68 C 12 58, 16 52, 19 47 S 10 32, 11 25" /></svg>
                  <div className="pin" style={{ left: "7%", top: "68%" }}><b /><span data-i="p1" suppressHydrationWarning>Petrol stations</span></div>
                  <div className="pin" style={{ left: "19%", top: "47%" }}><b /><span data-i="p2" suppressHydrationWarning>Motorcycle rentals</span></div>
                  <div className="pin" style={{ left: "11%", top: "25%" }}><b /><span data-i="p5" suppressHydrationWarning>Delivery hubs</span></div>
                </div>
              )}
            </figure>
          ))}
        </div>

        <div className="svc-list" role="tablist" aria-label="The service" onKeyDown={onKey}>
          {ITEMS.map((it, i) => (
            <button
              key={it.n}
              ref={(el) => { refs.current[i] = el; }}
              id={`svc-tab-${i}`}
              className="tab"
              role="tab"
              type="button"
              aria-selected={i === sel}
              aria-controls={`svc-panel-${i}`}
              tabIndex={i === sel ? 0 : -1}
              onClick={() => setSel(i)}
            >
              <span className="n">{it.n}</span>
              <span className="ic">{ICONS[i]}</span>
              <span className="vd" />
              <span className="tx">
                <span className="t" data-i={it.t} suppressHydrationWarning>{it.title}</span>
                <span className="s" data-i={it.s} suppressHydrationWarning>{it.desc}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
