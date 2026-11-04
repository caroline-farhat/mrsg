/* Connected Network: deterministic, UTC-based simulation.

   No API, backend, database, WebSocket, localStorage or Math.random(). Every value is a pure function of a UTC
   timestamp, so all visitors see identical numbers at the same moment, a reload never resets anything, and the
   numbers keep progressing while the site is closed.

   Fleet: exactly 250 machines (BASE.machines is the single source of truth for the machine count; every status
   split, regional split and cycle figure derives from it). The fleet size is constant, so the total never drifts.
   Anchor: at T_REF the model returns exactly the initial values in BASE (250 machines, 238 active, 1,890 cycles
   today, 725,716 total cycles). Everything after T_REF, and the history before it, is simulated.
   None of it is live machine telemetry. */

export const SECOND = 1000;
export const HOUR = 3_600_000;
export const DAY = 86_400_000;
/** Dashboard refresh interval. */
export const STEP = 10 * SECOND;

/** Fixed UTC reference moment (2026-10-25 13:00:00 UTC). */
export const T_REF = Date.UTC(2026, 9, 25, 13, 0, 0);

/** Initial values at T_REF. machines = active + idle + maintenance + offline = 250.
    Usage per machine is unchanged from the previous 2,480-machine model, so cyclesToday (value at 13:00 UTC) scales by
    250/2,480: 18,750 -> 1,890. The lifetime total is NOT scaled by the same factor: the old 4,850,000 assumed a fleet that
    grew by ~6 machines a day, whereas the fleet is now a constant 250 since launch. 725,716 is what 215 days of the same
    per-machine usage add up to with 250 machines (calibration factor ~1.0), so daily usage stays continuous. */
export const BASE = { machines: 250, active: 238, idle: 8, maintenance: 3, offline: 1, cyclesToday: 1890, cyclesTotal: 725_716 } as const;

/** Configurable, illustrative price (TRY) used to derive simulated revenue from simulated cycles. */
export const PRICE_PER_CYCLE_TRY = 100;

const REF_DAY = Math.floor(T_REF / DAY);
const LAUNCH_DAY = REF_DAY - 215; // simulated network history starts here (before it: no machines, no cycles)

/** Deterministic hash -> [0, 1). */
export function rnd(a: number, b = 0): number {
  let x = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) | 0;
  x = Math.imul(x ^ (x >>> 13), 1274126177);
  x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}

/* ---------- fleet size ---------- */

/** Total machines at a UTC timestamp: exactly BASE.machines (250) once the simulated network exists. */
export function machinesAt(ts: number): number {
  return ts / DAY < LAUNCH_DAY ? 0 : BASE.machines;
}

/* ---------- cleaning cycles ---------- */

// Relative cleaning activity per UTC hour of an average day.
const H_RAW = [0.2, 0.14, 0.12, 0.12, 0.18, 0.3, 0.52, 0.78, 1.05, 1.25, 1.35, 1.42, 1.45, 1.4, 1.38, 1.3, 1.15, 0.95, 0.7, 0.5, 0.38, 0.3, 0.26, 0.22];
const K = BASE.cyclesToday / H_RAW.slice(0, 13).reduce((a, b) => a + b, 0); // cycles per unit weight: T_REF day hits 18,750 at 13:00 UTC

function dayFactorRaw(d: number): number {
  if (d < LAUNCH_DAY) return 0;
  const m = machinesAt(d * DAY + DAY / 2) / BASE.machines;
  const s = d < REF_DAY ? Math.min(1, (d - LAUNCH_DAY) / (REF_DAY - LAUNCH_DAY)) : 1;
  const adoption = d < REF_DAY ? 0.85 + 0.15 * s : 1; // usage per machine grows as the network matures
  const dow = (((d + 4) % 7) + 7) % 7; // 0 = Sunday
  const week = dow === 0 || dow === 6 ? 0.94 : 1;
  return m * adoption * week;
}

let CAL = 0; // scales history so that all cycles before T_REF's day add up to exactly 4,831,250
const hoursCache = new Map<number, number[]>();
function hoursRaw(d: number): number[] {
  const f = d === REF_DAY ? 1 : dayFactorRaw(d);
  return H_RAW.map((w, h) => w * K * f * (d === REF_DAY ? 1 : 0.88 + 0.24 * rnd(d, h)));
}
function calibrate() {
  if (CAL) return;
  let sum = 0;
  for (let d = LAUNCH_DAY; d < REF_DAY; d++) sum += hoursRaw(d).reduce((a, b) => a + b, 0);
  CAL = (BASE.cyclesTotal - BASE.cyclesToday) / sum;
}
/** Expected cycles for each UTC hour of day index `d`. */
export function hoursOfDay(d: number): number[] {
  calibrate();
  let h = hoursCache.get(d);
  if (!h) {
    const k = d < REF_DAY ? CAL : 1;
    h = hoursRaw(d).map((v) => v * k);
    if (hoursCache.size > 800) hoursCache.clear();
    hoursCache.set(d, h);
  }
  return h;
}
const dayTotal = (d: number) => hoursOfDay(d).reduce((a, b) => a + b, 0);

const cumStart: number[] = [0]; // cycles before day LAUNCH_DAY + i
function cumBeforeDay(d: number): number {
  if (d <= LAUNCH_DAY) return 0;
  const i = d - LAUNCH_DAY;
  while (cumStart.length <= i) {
    const k = cumStart.length - 1;
    cumStart.push(cumStart[k] + dayTotal(LAUNCH_DAY + k));
  }
  return cumStart[i];
}
/** Cumulative simulated cycles since the simulated network start (continuous, monotonic). */
export function cum(ts: number): number {
  const d = Math.floor(ts / DAY);
  if (d < LAUNCH_DAY) return 0;
  const x = (ts - d * DAY) / HOUR;
  const h = Math.min(23, Math.floor(x));
  const hrs = hoursOfDay(d);
  let part = 0;
  for (let i = 0; i < h; i++) part += hrs[i];
  part += hrs[h] * (x - h);
  return cumBeforeDay(d) + part;
}
const cumInt = (ts: number) => Math.round(cum(ts));
/** Whole cycles between two timestamps. Telescopes exactly, so buckets always add up to their totals. */
export const cyclesBetween = (a: number, b: number) => cumInt(b) - cumInt(a);
export const cyclesTotalAt = (ts: number) => cumInt(ts);
export const cyclesTodayAt = (ts: number) => cyclesBetween(Math.floor(ts / DAY) * DAY, ts);

/* ---------- machine status ---------- */

const wave = (ts: number, period: number, phase: number) => Math.sin((2 * Math.PI * ts) / (period * DAY) + phase) - Math.sin((2 * Math.PI * T_REF) / (period * DAY) + phase);
const diurnal = (ts: number) => Math.cos((2 * Math.PI * (((ts % DAY) + DAY) % DAY)) / DAY) - Math.cos((2 * Math.PI * (T_REF % DAY)) / DAY);

export type Status = { total: number; active: number; idle: number; maintenance: number; offline: number };

/** Status counts at ts. active + idle + maintenance + offline === total, always. */
export function statusAt(ts: number): Status {
  const total = machinesAt(ts);
  if (total <= 0) return { total: 0, active: 0, idle: 0, maintenance: 0, offline: 0 };
  const sc = total / BASE.machines;
  // Wave amplitudes are sized for a 250-machine fleet (a few machines up or down), not for thousands.
  let maintenance = Math.round(BASE.maintenance * sc + 1.5 * wave(ts, 5.1, 1.3) + 0.8 * wave(ts, 1.7, 0.4));
  let offline = Math.round(BASE.offline * sc + 0.8 * wave(ts, 2.3, 2.1));
  let idle = Math.round(BASE.idle * sc + 3 * diurnal(ts) + 1 * wave(ts, 3.3, 0.9));
  maintenance = Math.max(0, Math.min(maintenance, Math.floor(total * 0.2)));
  offline = Math.max(0, Math.min(offline, Math.floor(total * 0.1)));
  idle = Math.max(0, Math.min(idle, Math.floor(total * 0.3)));
  const active = total - idle - maintenance - offline;
  return { total, active, idle, maintenance, offline };
}

/* ---------- dashboard snapshot ---------- */

/** Largest-remainder split so the parts add up to exactly `total`. */
function split(total: number, weights: number[]): number[] {
  const sw = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((w) => (total * w) / sw);
  const out = raw.map(Math.floor);
  let rest = total - out.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => [r - Math.floor(r), i] as const).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  for (const [, i] of order) { if (rest <= 0) break; out[i]++; rest--; }
  return out;
}

// Illustrative distributions (not claims about real deployments).
const REGION_W = [90, 70, 50, 40]; // Turkiye, Europe, Middle East, Other (sums to 250 machines)
const TOP_REF_DAY = 18750; // the shares below were defined against an 18,750-cycle day; they stay shares of today's cycles
const TOP_SHARE = [2450, 2180, 1890, 1420, 1210].map((v) => v / TOP_REF_DAY); // Ankara, Istanbul, Izmir, Antalya, Bursa

export type Snapshot = {
  ts: number; status: Status;
  cyclesToday: number; cyclesTotal: number; cyclesLastHour: number;
  activeHourDelta: number;
  regions: number[]; top: { id: number; value: number }[];
  spark: { machines: number[]; active: number[]; today: number[]; total: number[] };
};

export function snapshot(rawTs: number): Snapshot {
  const ts = Math.max(rawTs, T_REF); // never show less than the initial values
  const status = statusAt(ts);
  const cyclesToday = cyclesTodayAt(ts);
  const range = (n: number, f: (k: number) => number) => Array.from({ length: n }, (_, i) => f(n - 1 - i));
  const top = TOP_SHARE.map((s, i) => {
    const wob = 0.035 * wave(ts, 1.9 + i * 0.7, i * 1.7);
    return { id: i, value: Math.round(s * (1 + wob) * cyclesToday) };
  }).sort((a, b) => b.value - a.value);
  return {
    ts, status, cyclesToday, cyclesTotal: cyclesTotalAt(ts),
    cyclesLastHour: cyclesBetween(ts - HOUR, ts),
    activeHourDelta: status.active - statusAt(ts - HOUR).active,
    regions: split(status.total, REGION_W),
    top,
    spark: {
      machines: range(12, (k) => machinesAt(ts - k * 12 * HOUR)),
      active: range(12, (k) => statusAt(ts - k * HOUR).active),
      today: range(12, (k) => cyclesBetween(ts - (k + 1) * HOUR, ts - k * HOUR)),
      total: range(12, (k) => cyclesBetween(ts - (k + 1) * DAY, ts - k * DAY)),
    },
  };
}

/* ---------- chart series ---------- */

export type Range = "24H" | "7D" | "30D" | "1Y";
export type Bucket = {
  t0: number; t1: number;
  cycles: number; revenue: number;
  future: boolean; partial: boolean;
};

function makeBucket(t0: number, t1: number, ts: number): Bucket {
  const future = ts <= t0;
  const end = Math.min(t1, ts);
  const cycles = future ? 0 : cyclesBetween(t0, end);
  return { t0, t1, cycles, revenue: cycles * PRICE_PER_CYCLE_TRY, future, partial: !future && ts < t1 };
}

/** Deterministic history for the selected range. 24H: today's UTC hours. 7D/30D: UTC days. 1Y: UTC months. */
export function buildSeries(range: Range, rawTs: number): { kind: "hour" | "day" | "month"; buckets: Bucket[] } {
  const ts = Math.max(rawTs, T_REF);
  const today = Math.floor(ts / DAY) * DAY;
  if (range === "24H") return { kind: "hour", buckets: Array.from({ length: 24 }, (_, h) => makeBucket(today + h * HOUR, today + (h + 1) * HOUR, ts)) };
  if (range === "7D" || range === "30D") {
    const n = range === "7D" ? 7 : 30;
    return { kind: "day", buckets: Array.from({ length: n }, (_, i) => makeBucket(today - (n - 1 - i) * DAY, today - (n - 2 - i) * DAY, ts)) };
  }
  const now = new Date(ts);
  const y = now.getUTCFullYear(), m = now.getUTCMonth();
  return { kind: "month", buckets: Array.from({ length: 12 }, (_, i) => makeBucket(Date.UTC(y, m - (11 - i), 1), Date.UTC(y, m - (10 - i), 1), ts)) };
}

/** UTC clock string, e.g. "14:32:18 UTC". */
export const utcClock = (ts: number) => new Date(ts).toISOString().slice(11, 19) + " UTC";
/** Quantise to the 10 s grid so devices within the same step show identical values. */
export const quantize = (now: number) => Math.floor(now / STEP) * STEP;
