"use client";
import { memo, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { WORLD_COLS, WORLD_ROWS, WORLD_LAND } from "@/constants/world-map";
import { useInViewOnce } from "@/hooks/use-in-view";
import { useLang } from "@/hooks/use-language";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { NET, type Lang } from "@/i18n/network";
import { T_REF, STEP, PRICE_PER_CYCLE_TRY, snapshot, buildSeries, quantize, utcClock, rnd, type Range, type Bucket, type Snapshot } from "@/lib/analytics/network-simulation";

/*
  Connected Network section (replaces the old static markup).
  - All numbers come from lib/analytics/network-simulation.ts: a deterministic UTC simulation (no API, no Math.random, no storage).
  - Everything is labelled as simulated / illustrative; nothing here is live machine telemetry.
  - Static labels carry `data-i` (translated by the site's existing language switch);
    text that changes at runtime is looked up in the same dictionary through t().
*/

/* ---------------------------------------------------------------- hooks */

const LOC: Record<Lang, string> = { en: "en-US", tr: "tr-TR", ar: "ar-u-nu-latn" };

/** UTC simulation clock: snaps to a 10 s grid, never runs backwards by small clock jitter, never earlier than T_REF. */
function useSimClock(): { ts: number; ready: boolean } {
  const [s, setS] = useState({ ts: T_REF, ready: false });
  useEffect(() => {
    let timer = 0;
    let last = T_REF;
    const tick = () => {
      let q = quantize(Date.now());
      if (q < last && last - q < 60_000) q = last; // tolerate small clock corrections
      if (q < T_REF) q = T_REF;
      last = q;
      setS((p) => (p.ready && p.ts === q ? p : { ts: q, ready: true }));
      timer = window.setTimeout(tick, STEP - (Date.now() % STEP) + 25);
    };
    const vis = () => { if (document.visibilityState === "visible") { window.clearTimeout(timer); tick(); } };
    tick();
    document.addEventListener("visibilitychange", vis);
    return () => { window.clearTimeout(timer); document.removeEventListener("visibilitychange", vis); };
  }, []);
  return s;
}

/** Eased counter: first run counts up from 0 when the section enters the viewport, later runs glide to the new value. */
function useTween(target: number, active: boolean, reduced: boolean): number {
  const [v, setV] = useState(target);
  const cur = useRef(target);
  const started = useRef(false);
  useEffect(() => {
    if (!active) return;
    const from = started.current ? cur.current : 0;
    const dur = started.current ? 900 : 1600;
    started.current = true;
    if (reduced) { cur.current = target; setV(target); return; }
    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      cur.current = from + (target - from) * e;
      setV(cur.current);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, active, reduced]);
  return v;
}

function Num({ value, fmt, active, reduced }: { value: number; fmt: (n: number) => string; active: boolean; reduced: boolean }) {
  return <>{fmt(useTween(value, active, reduced))}</>;
}

/* ---------------------------------------------------------------- formatting */

function makeFmt(lang: Lang) {
  const l = LOC[lang];
  const cur = { style: "currency" as const, currency: "TRY", currencyDisplay: "narrowSymbol" as const };
  return {
    int: new Intl.NumberFormat(l, { maximumFractionDigits: 0 }),
    compact: new Intl.NumberFormat(l, { notation: "compact", maximumFractionDigits: 1 }),
    pct1: new Intl.NumberFormat(l, { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    pct0: new Intl.NumberFormat(l, { maximumFractionDigits: 0 }),
    try0: new Intl.NumberFormat(l, { ...cur, maximumFractionDigits: 0 }),
    tryC: new Intl.NumberFormat(l, { ...cur, notation: "compact", maximumFractionDigits: 1 }),
    day: new Intl.DateTimeFormat(l, { day: "numeric", month: "short", timeZone: "UTC" }),
    month: new Intl.DateTimeFormat(l, { month: "short", timeZone: "UTC" }),
    monthYear: new Intl.DateTimeFormat(l, { month: "long", year: "numeric", timeZone: "UTC" }),
  };
}
type Fmt = ReturnType<typeof makeFmt>;

function niceScale(max: number, steps = 4): { top: number; ticks: number[] } {
  if (!(max > 0)) return { top: steps, ticks: Array.from({ length: steps + 1 }, (_, i) => i) };
  const raw = max / steps;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / mag;
  const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag;
  const count = Math.max(2, Math.ceil(max / step - 1e-9));
  return { top: step * count, ticks: Array.from({ length: count + 1 }, (_, i) => step * i) };
}

/* ---------------------------------------------------------------- icons */

const I = (children: ReactNode) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);
const ICON = {
  machine: I(<><rect x="6" y="3" width="12" height="18" rx="2.2" /><rect x="9" y="6" width="6" height="5" rx="1" /><path d="M9 15h6M9 18h3.5" /></>),
  wifi: I(<><path d="M4.5 9.8a10.5 10.5 0 0 1 15 0M7.4 12.9a6.4 6.4 0 0 1 9.2 0M10.2 15.9a2.4 2.4 0 0 1 3.6 0" /><circle cx="12" cy="19" r=".6" fill="currentColor" /></>),
  cycle: I(<><path d="M20 12a8 8 0 1 1-2.6-5.9" /><path d="M20 4.5v4h-4" /><circle cx="12" cy="12" r="2.2" /></>),
  stack: I(<><ellipse cx="12" cy="6" rx="7" ry="3" /><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" /></>),
  usage: I(<path d="M5 20V11M10 20V4M15 20v-6.5M20 20V8" />),
  revenue: I(<><ellipse cx="12" cy="6.5" rx="6.5" ry="2.8" /><path d="M5.5 6.5v5c0 1.5 2.9 2.8 6.5 2.8s6.5-1.3 6.5-2.8v-5M5.5 11.5v5c0 1.5 2.9 2.8 6.5 2.8s6.5-1.3 6.5-2.8v-5" /></>),
};
const TAB_ICONS = [ICON.usage, ICON.revenue];

const Arrow = ({ up }: { up: boolean }) => (
  <svg viewBox="0 0 10 10" aria-hidden="true" className="nw-arr" data-up={up}><path d="M5 1.5 9 8H1z" /></svg>
);

/* ---------------------------------------------------------------- decorative world map (not real locations) */

const PITCH = 10;
const LAND_CELLS: [number, number][] = [];
WORLD_LAND.forEach((row, r) => { for (let c = 0; c < row.length; c++) if (row[c] === "1") LAND_CELLS.push([c, r]); });
const LAND_PATH = LAND_CELLS.map(([c, r]) => `M${c * PITCH + 5} ${r * PITCH + 5}h0`).join("");
const project = (lon: number, lat: number): [number, number] => [((lon + 170) / 350) * WORLD_COLS * PITCH, ((84 - lat) / 142) * WORLD_ROWS * PITCH];
const HUB = project(35, 39);
const ARC_TARGETS = [project(2, 48), project(78, 22), project(115, 35), project(20, 2), project(-85, 40), project(104, 5)];
const POINTS = Array.from({ length: 64 }, (_, i) => {
  const [c, r] = LAND_CELLS[Math.floor(rnd(i + 1, 5) * LAND_CELLS.length)];
  return { x: c * PITCH + 5, y: r * PITCH + 5, pulse: i % 4 === 0, d: (i * 0.37) % 3.4 };
});
const arcPath = ([x, y]: [number, number]) => {
  const mx = (HUB[0] + x) / 2, my = Math.min(HUB[1], y) - Math.hypot(x - HUB[0], y - HUB[1]) * 0.28;
  return `M${HUB[0]} ${HUB[1]}Q${mx} ${my} ${x} ${y}`;
};

const WorldMap = memo(function WorldMap() {
  return (
    <svg className="nw-map" viewBox={`0 0 ${WORLD_COLS * PITCH} ${WORLD_ROWS * PITCH}`} aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="nwhub" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#e10b1f" stopOpacity=".55" /><stop offset="1" stopColor="#e10b1f" stopOpacity="0" /></radialGradient>
      </defs>
      <path className="nw-land" d={LAND_PATH} />
      <g className="nw-arcs" fill="none">{ARC_TARGETS.map((t, i) => <path key={i} d={arcPath(t)} style={{ animationDelay: `${i * -1.3}s` }} />)}</g>
      <g className="nw-pts">{POINTS.map((p, i) => <circle key={i} className={p.pulse ? "p" : undefined} cx={p.x} cy={p.y} r="3.2" style={p.pulse ? { animationDelay: `${p.d}s` } : undefined} />)}</g>
      <circle cx={HUB[0]} cy={HUB[1]} r="46" fill="url(#nwhub)" />
      <circle className="nw-hub-ring" cx={HUB[0]} cy={HUB[1]} r="12" />
      <circle className="nw-hub" cx={HUB[0]} cy={HUB[1]} r="6.5" />
    </svg>
  );
});

/* ---------------------------------------------------------------- KPI cards */

function SparkBars({ values }: { values: number[] }) {
  const min = Math.min(...values), max = Math.max(...values), span = max - min || 1;
  const flat = max === min; // constant series (e.g. the fixed 250-machine fleet): draw mid-height bars instead of minimum-height stubs
  return (
    <span className="nw-sp" aria-hidden="true">
      {values.map((v, i) => <i key={i} style={{ height: flat ? "62%" : `${24 + (76 * (v - min)) / span}%`, "--o": (0.32 + (0.68 * i) / (values.length - 1)).toFixed(2), "--i": i } as CSSProperties} />)}
    </span>
  );
}

type KpiProps = { i: number; icon: ReactNode; k: string; title: string; value: ReactNode; sub: ReactNode; spark: ReactNode };
function Kpi({ i, icon, k, title, value, sub, spark }: KpiProps) {
  return (
    <article className="nw-kpi nw-rv" style={{ "--d": `${i * 80}ms` } as CSSProperties}>
      <div className="nw-kh"><span className="nw-ki">{icon}</span><h3 className="nw-kt" data-i={k} suppressHydrationWarning>{title}</h3></div>
      <div className="nw-kb"><b className="nw-kv">{value}</b>{spark}</div>
      <p className="nw-kd">{sub}</p>
    </article>
  );
}

/* ---------------------------------------------------------------- main chart */

type ChartProps = { tab: number; series: ReturnType<typeof buildSeries>; fmt: Fmt; t: (k: string) => string; reduced: boolean };

function bucketLabel(kind: "hour" | "day" | "month", b: Bucket, fmt: Fmt): string {
  if (kind === "hour") return `${String(new Date(b.t0).getUTCHours()).padStart(2, "0")}:00`;
  if (kind === "day") return fmt.day.format(b.t0);
  return fmt.month.format(b.t0);
}

function Chart({ tab, series, fmt, t }: ChartProps) {
  const { kind, buckets } = series;
  const n = buckets.length;
  const [hover, setHover] = useState<number | null>(null);
  const plot = useRef<HTMLDivElement>(null);

  let cur = n - 1;
  for (let i = n - 1; i >= 0; i--) if (!buckets[i].future) { cur = i; break; }
  const shown = hover ?? cur;

  // values and scale per tab
  const vals = buckets.map((b) => (tab === 0 ? b.cycles : b.revenue));
  const maxV = Math.max(...vals.filter((_, i) => !buckets[i].future), 0);
  const scale = niceScale(maxV * 1.08, 4);
  const axis = (v: number) => (tab === 1 ? (scale.top >= 100000 ? fmt.tryC.format(v) : fmt.try0.format(v)) : scale.top >= 100000 ? fmt.compact.format(v) : fmt.int.format(v));
  const pct = (v: number) => Math.max(0, Math.min(100, (v / scale.top) * 100));

  const b = buckets[shown];
  const lab = bucketLabel(kind, b, fmt);
  const long = kind === "month" ? fmt.monthYear.format(b.t0) : kind === "day" ? fmt.day.format(b.t0) : lab;
  let tip: ReactNode;
  if (b.future) tip = <><b>{lab}</b><span>{t("nw_up")}</span></>;
  else if (tab === 0) tip = <><b>{long}</b><span>{fmt.int.format(b.cycles)} {t("nw_cl")}</span></>;
  else tip = <><b>{long}</b><span>{fmt.try0.format(b.revenue)}</span></>;
  const tipText = b.future ? `${lab} ${t("nw_up")}` : `${long}: ${tab === 0 ? fmt.int.format(b.cycles) + " " + t("nw_cl") : fmt.try0.format(b.revenue)}`;

  const topPct = b.future ? 55 : 100 - pct(vals[shown]);
  const edge = shown < 2 ? "s" : shown > n - 3 ? "e" : "c";

  function onMove(e: PointerEvent<HTMLDivElement>) {
    const r = plot.current?.getBoundingClientRect();
    if (!r || !r.width) return;
    setHover(Math.max(0, Math.min(n - 1, Math.floor(((e.clientX - r.left) / r.width) * n))));
  }
  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const k = e.key;
    if (k !== "ArrowLeft" && k !== "ArrowRight" && k !== "Home" && k !== "End") return;
    e.preventDefault();
    const rtl = document.documentElement.dir === "rtl";
    const step = k === "ArrowRight" ? (rtl ? -1 : 1) : k === "ArrowLeft" ? (rtl ? 1 : -1) : 0;
    setHover(k === "Home" ? 0 : k === "End" ? n - 1 : Math.max(0, Math.min(n - 1, shown + step)));
  }

  const xEvery = kind === "hour" ? 2 : kind === "day" && n > 8 ? 3 : 1;

  return (
    <div className="nw-chart" dir="ltr">
      <div className="nw-y" aria-hidden="true">{scale.ticks.map((v) => <span key={v} style={{ bottom: `${pct(v)}%` }}>{axis(v)}</span>)}</div>
      <div
        className="nw-plot" ref={plot} tabIndex={0} role="group" aria-roledescription="chart" aria-label={t("nw_h" + (tab + 1))}
        onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={(e) => { if (e.pointerType === "mouse") setHover(null); }}
        onKeyDown={onKey} onBlur={() => setHover(null)}
      >
        <div className="nw-grid" aria-hidden="true">{scale.ticks.map((v) => <i key={v} style={{ bottom: `${pct(v)}%` }} />)}</div>
        <div className="nw-bars" aria-hidden="true">
          {buckets.map((bk, i) => (
            <div key={i} className="nw-col" data-on={i === shown} data-future={bk.future} data-partial={bk.partial} style={{ "--i": i } as CSSProperties}>
              <i style={{ height: bk.future ? "3px" : `${Math.max(pct(vals[i]), 1.2)}%` }} />
            </div>
          ))}
        </div>
        <div className="nw-tip" data-edge={edge} style={{ left: `${((shown + 0.5) / n) * 100}%`, top: `${Math.max(topPct, 22)}%` }} aria-hidden="true"><em /> <div>{tip}</div></div>
        <span className="sr" aria-live="polite">{tipText}</span>
      </div>
      <div className="nw-x" data-n={n} data-every={xEvery} aria-hidden="true">
        {buckets.map((bk, i) => <span key={i} data-show={i % xEvery === (kind === "hour" ? 0 : (n - 1) % xEvery)}>{bucketLabel(kind, bk, fmt)}</span>)}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- bottom panels */

const star = (cx: number, cy: number, R: number) => Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? R * 0.382 : R; return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`; }).join(" ");
const FLAGS: ReactNode[] = [
  <svg key="tr" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#e30a17" /><circle cx="10" cy="12" r="4.7" fill="#fff" /><circle cx="11.4" cy="12" r="3.8" fill="#e30a17" /><polygon points={star(15.3, 12, 2.3)} fill="#fff" /></svg>,
  <svg key="eu" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#0b3a9e" />{Array.from({ length: 12 }, (_, i) => <circle key={i} cx={12 + 6.4 * Math.cos((i * Math.PI) / 6)} cy={12 + 6.4 * Math.sin((i * Math.PI) / 6)} r="1.05" fill="#ffd400" />)}</svg>,
  <svg key="me" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#7ea4c9" /><path d="M2 12h20M12 2c3.4 3.2 3.4 16.8 0 20M12 2c-3.4 3.2-3.4 16.8 0 20" fill="none" stroke="#e8f1fa" strokeWidth="1.2" /><circle cx="12" cy="12" r="9.4" fill="none" stroke="#e8f1fa" strokeWidth="1.2" /></svg>,
  <svg key="ot" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="none" stroke="#9a9aa3" strokeWidth="1.4" /><path d="M2 12h20M12 2c3.4 3.2 3.4 16.8 0 20M12 2c-3.4 3.2-3.4 16.8 0 20M4.5 6.5h15M4.5 17.5h15" fill="none" stroke="#9a9aa3" strokeWidth="1.1" /></svg>,
];
const REGION_KEYS = [["nw_tr", "Türkiye"], ["nw_eu", "Europe"], ["nw_me", "Middle East"], ["nw_ot", "Other"]];
const STATUS_KEYS = [["nw_sa", "Active"], ["nw_si", "Idle"], ["nw_sm", "Maintenance"], ["nw_so", "Offline"]];
const CITY_KEYS = [["nw_c1", "Ankara"], ["nw_c2", "Istanbul"], ["nw_c3", "Izmir"], ["nw_c4", "Antalya"], ["nw_c5", "Bursa"]];

function Panel({ title, k, tag, children, cls }: { title: string; k: string; tag?: boolean; children: ReactNode; cls?: string }) {
  return (
    <section className={"nw-bp " + (cls ?? "")}>
      <header><h3 data-i={k} suppressHydrationWarning>{title}</h3>{tag && <small className="nw-ill" data-i="nw_ill" suppressHydrationWarning>Illustrative</small>}</header>
      {children}
    </section>
  );
}

/* ---------------------------------------------------------------- section */

export default function NetworkSection() {
  const lang = useLang();
  const reduced = useReducedMotion();
  const { ts, ready } = useSimClock();
  const [root, inView] = useInViewOnce<HTMLElement>();
  const [tab, setTab] = useState(0);
  const [range, setRange] = useState<Range>("24H");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const t = (k: string) => NET[lang][k] ?? NET.en[k] ?? k;
  const fmt = useMemo(() => makeFmt(lang), [lang]);
  const snap: Snapshot = useMemo(() => snapshot(ts), [ts]);
  const series = useMemo(() => buildSeries(range, ts), [range, ts]);
  const active = ready && inView;
  const st = snap.status;
  const pc = (n: number) => (st.total ? (n / st.total) * 100 : 0);
  const sign = (n: number) => (n < 0 ? "−" : "+");
  const intF = (n: number) => fmt.int.format(Math.round(n));

  function onTabKey(e: KeyboardEvent<HTMLDivElement>) {
    const rtl = document.documentElement.dir === "rtl";
    let n = tab;
    if (e.key === "ArrowDown" || e.key === (rtl ? "ArrowLeft" : "ArrowRight")) n = (tab + 1) % 2;
    else if (e.key === "ArrowUp" || e.key === (rtl ? "ArrowRight" : "ArrowLeft")) n = (tab + 1) % 2;
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = 1;
    else return;
    e.preventDefault();
    setTab(n);
    tabRefs.current[n]?.focus();
  }

  // stats row (Revenue tab only)
  const live = series.buckets.filter((b) => !b.future);
  let stats: [string, string][] = [];
  if (tab === 1) {
    const total = live.reduce((a, b) => a + b.revenue, 0);
    stats = [["nw_rt", fmt.try0.format(total)], ["nw_pc", fmt.try0.format(PRICE_PER_CYCLE_TRY)], ["nw_avg", fmt.try0.format(live.length ? total / live.length : 0)]];
  }

  // donut
  const parts = [st.active, st.idle, st.maintenance, st.offline];
  let acc = 0;
  const arcs = parts.map((p) => { const len = pc(p); const a = { len, start: acc }; acc += len; return a; });

  const maxRegion = Math.max(...snap.regions, 1);
  const maxTop = Math.max(...snap.top.map((x) => x.value), 1);

  return (
    <section id="net" className="nw" ref={root} data-ready={ready} data-in={inView}>
      <div className="fw">
        {/* header */}
        <div className="nw-head">
          <WorldMap />
          <div className="nw-ht">
            <span className="eye" data-i="e4" suppressHydrationWarning>Connected network</span>
            <h2 className="d nw-h" data-i="c0" suppressHydrationWarning>Every machine, one view</h2>
          </div>
          <p className="nw-sub" data-i="nw_sub" suppressHydrationWarning>A growing network of MRS.G machines working around the world to keep riders safe and helmets fresh</p>
        </div>

        {/* KPI cards */}
        <div className="nw-kpis">
          <Kpi i={0} icon={ICON.machine} k="nw_k1" title="Total Machines" spark={<SparkBars values={snap.spark.machines} />}
            value={<Num value={st.total} fmt={intF} active={active} reduced={reduced} />}
            sub={<><span className="nw-ok" data-ok="true" aria-hidden="true" /> <span>{t("nw_stable")}</span></>} />
          <Kpi i={1} icon={ICON.wifi} k="nw_k2" title="Active Machines" spark={<SparkBars values={snap.spark.active} />}
            value={<Num value={st.active} fmt={intF} active={active} reduced={reduced} />}
            sub={<><span className="nw-dl" data-up={snap.activeHourDelta >= 0}><Arrow up={snap.activeHourDelta >= 0} />{sign(snap.activeHourDelta)}{intF(Math.abs(snap.activeHourDelta))}</span> <span data-i="nw_hr" suppressHydrationWarning>since last hour</span></>} />
          <Kpi i={2} icon={ICON.cycle} k="nw_k3" title="Cleaning Cycles Today" spark={<SparkBars values={snap.spark.today} />}
            value={<Num value={snap.cyclesToday} fmt={intF} active={active} reduced={reduced} />}
            sub={<><span className="nw-dl" data-up="true"><Arrow up />+{intF(snap.cyclesLastHour)}</span> <span data-i="nw_hr" suppressHydrationWarning>since last hour</span></>} />
          <Kpi i={3} icon={ICON.stack} k="nw_k4" title="Total Cleaning Cycles" spark={<SparkBars values={snap.spark.total} />}
            value={<Num value={snap.cyclesTotal} fmt={intF} active={active} reduced={reduced} />}
            sub={<><span className="nw-dl" data-up="true"><Arrow up />+{intF(snap.cyclesToday)}</span> <span data-i="nw_td" suppressHydrationWarning>today</span></>} />
        </div>

        {/* analytics panel */}
        <div className="nw-panel nw-rv" style={{ "--d": "120ms" } as CSSProperties}>
          <div className="nw-top">
            <div className="nw-side" role="tablist" aria-orientation="vertical" aria-label={t("nw_tabs")} onKeyDown={onTabKey}>
              {[0, 1].map((i) => (
                <button key={i} ref={(el) => { tabRefs.current[i] = el; }} id={`nwt${i}`} role="tab" type="button" aria-selected={tab === i} aria-controls="nwp" tabIndex={tab === i ? 0 : -1} onClick={() => setTab(i)}>
                  {TAB_ICONS[i]}<span data-i={`nw_t${i + 1}`} suppressHydrationWarning>{["Usage", "Revenue"][i]}</span>
                </button>
              ))}
            </div>

            <div className="nw-main" id="nwp" role="tabpanel" aria-labelledby={`nwt${tab}`}>
              <div className="nw-mh">
                <div className="nw-mtx">
                  <h3 className="nw-mt" key={"h" + tab}>{t("nw_h" + (tab + 1))}</h3>
                  <p className="nw-ms" key={"s" + tab}>{t("nw_s" + (tab + 1))}</p>
                </div>
                <div className="nw-ctl">
                  <div className="nw-rng" role="group" aria-label={t("nw_range")}>
                    {(["24H", "7D", "30D", "1Y"] as Range[]).map((r, i) => (
                      <button key={r} type="button" aria-pressed={range === r} onClick={() => setRange(r)} data-i={`nw_r${i + 1}`} suppressHydrationWarning>{r}</button>
                    ))}
                  </div>
                  <div className="nw-live">
                    <small><span data-i="nw_upd" suppressHydrationWarning>Last updated</span> <time dir="ltr">{ready ? utcClock(ts) : "--:--:-- UTC"}</time></small>
                  </div>
                </div>
              </div>

              {stats.length > 0 && (
                <dl className="nw-stats" key={"st" + tab} data-n={stats.length}>
                  {stats.map(([k, v]) => <div key={k}><dt>{t(k)}</dt><dd>{v}</dd></div>)}
                </dl>
              )}

              <div className="nw-swap" key={`${tab}-${range}`}>
                <Chart tab={tab} series={series} fmt={fmt} t={t} reduced={reduced} />
              </div>
            </div>
          </div>

          <div className="nw-bottom">
            <Panel title="Machine activity by region" k="nw_reg" tag cls="nw-reg">
              <ul className="nw-rows">
                {REGION_KEYS.map(([k, en], i) => (
                  <li key={k}>
                    <span className="nw-flag">{FLAGS[i]}</span>
                    <span className="nw-nm" data-i={k} suppressHydrationWarning>{en}</span>
                    <span className="nw-bar"><i style={{ width: `${(snap.regions[i] / (maxRegion * 1.18)) * 100}%` }} /></span>
                    <b className="nw-num">{fmt.int.format(snap.regions[i])}</b>
                    <span className="nw-pct">{fmt.pct0.format(Math.round(pc(snap.regions[i])))}%</span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Machine status" k="nw_st" cls="nw-stat">
              <div className="nw-donutw">
                <div className="nw-donut" role="img" aria-label={`${t("nw_tot")}: ${fmt.int.format(st.total)}`}>
                  <svg viewBox="0 0 100 100" aria-hidden="true">
                    <circle className="nw-dtrack" cx="50" cy="50" r="40" fill="none" strokeWidth="13" />
                    {arcs.map((a, i) => {
                      const len = a.len > 1.2 ? a.len - 0.45 : a.len;
                      return <circle key={i} className={`nw-seg s${i}`} cx="50" cy="50" r="40" fill="none" strokeWidth="13" pathLength={100} transform="rotate(-90 50 50)" strokeDasharray={`${len} ${100 - len}`} strokeDashoffset={-a.start} />;
                    })}
                  </svg>
                  <div className="nw-dc"><b><Num value={st.total} fmt={intF} active={active} reduced={reduced} /></b><span data-i="nw_tot" suppressHydrationWarning>Total</span></div>
                </div>
                <ul className="nw-leg">
                  {STATUS_KEYS.map(([k, en], i) => (
                    <li key={k}>
                      <i className={`s${i}`} aria-hidden="true" />
                      <span className="nw-nm" data-i={k} suppressHydrationWarning>{en}</span>
                      <b className="nw-num">{fmt.int.format(parts[i])}</b>
                      <span className="nw-pct">{fmt.pct1.format(pc(parts[i]))}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Panel>

            <Panel title="Top locations today" k="nw_top" tag cls="nw-top5">
              <ol className="nw-rows nw-rank">
                {snap.top.map((r, idx) => (
                  <li key={r.id} style={{ "--r": idx } as CSSProperties}>
                    <span className="nw-rk">{idx + 1}</span>
                    <span className="nw-nm" data-i={CITY_KEYS[r.id][0]} suppressHydrationWarning>{CITY_KEYS[r.id][1]}</span>
                    <span className="nw-bar" data-r={idx}><i style={{ width: `${(r.value / (maxTop * 1.04)) * 100}%` }} /></span>
                    <b className="nw-num">{fmt.int.format(r.value)}</b>
                  </li>
                ))}
              </ol>
            </Panel>
          </div>
          <p className="nw-note" data-i="nw_note" suppressHydrationWarning>Simulated and illustrative activity. Not live machine telemetry</p>
        </div>
      </div>
    </section>
  );
}
