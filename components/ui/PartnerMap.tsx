import { memo } from "react";
import { WORLD_COLS, WORLD_ROWS, WORLD_LAND } from "@/constants/world-map";
import { rnd } from "@/lib/analytics/network-simulation";

/* Decorative dotted world map with red connection lines. Purely visual: the red points are NOT company locations. */
const PITCH = 10;
const CELLS: [number, number][] = [];
WORLD_LAND.forEach((row, r) => { for (let c = 0; c < row.length; c++) if (row[c] === "1") CELLS.push([c, r]); });
const LAND = CELLS.map(([c, r]) => `M${c * PITCH + 5} ${r * PITCH + 5}h0`).join("");
const proj = (lon: number, lat: number): [number, number] => [((lon + 170) / 350) * WORLD_COLS * PITCH, ((84 - lat) / 142) * WORLD_ROWS * PITCH];
const HUB = proj(35, 39);
const TARGETS = [proj(-98, 40), proj(-60, -14), proj(2, 47), proj(18, -2), proj(78, 22), proj(113, 34), proj(104, 6), proj(135, -25), proj(-122, 38)];
const DOTS = Array.from({ length: 70 }, (_, i) => {
  const [c, r] = CELLS[Math.floor(rnd(i + 11, 9) * CELLS.length)];
  return { x: c * PITCH + 5, y: r * PITCH + 5, p: i % 5 === 0, d: (i * 0.41) % 3.6 };
});
const arc = ([x, y]: [number, number]) => {
  const mx = (HUB[0] + x) / 2, my = Math.min(HUB[1], y) - Math.hypot(x - HUB[0], y - HUB[1]) * 0.3;
  return `M${HUB[0]} ${HUB[1]}Q${mx} ${my} ${x} ${y}`;
};

export const PartnerMap = memo(function PartnerMap() {
  return (
    <svg className="pt-map" viewBox={`0 0 ${WORLD_COLS * PITCH} ${WORLD_ROWS * PITCH}`} aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">
      <defs><radialGradient id="pthub" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#e10b1f" stopOpacity=".5" /><stop offset="1" stopColor="#e10b1f" stopOpacity="0" /></radialGradient></defs>
      <path className="pt-land" d={LAND} />
      <g className="pt-arcs" fill="none">{TARGETS.map((t, i) => <path key={i} d={arc(t)} style={{ animationDelay: `${i * -1.1}s` }} />)}</g>
      <g className="pt-pts">{DOTS.map((p, i) => <circle key={i} className={p.p ? "p" : undefined} cx={p.x} cy={p.y} r="3" style={p.p ? { animationDelay: `${p.d}s` } : undefined} />)}</g>
      {TARGETS.map((t, i) => <circle key={"t" + i} className="pt-end" cx={t[0]} cy={t[1]} r="5.5" />)}
      <circle cx={HUB[0]} cy={HUB[1]} r="52" fill="url(#pthub)" />
      <circle className="pt-ring" cx={HUB[0]} cy={HUB[1]} r="12" />
      <circle className="pt-hub" cx={HUB[0]} cy={HUB[1]} r="7" />
    </svg>
  );
});
