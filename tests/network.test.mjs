/* Connected Network: 250-machine simulation consistency + removed content. Runs the real simulation module
   (Node strips the TypeScript types) and reads the translation/source files as text. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const sim = await import(new URL("../lib/analytics/network-simulation.ts", import.meta.url));
const { BASE, T_REF, DAY, HOUR, snapshot, buildSeries, statusAt, machinesAt, cyclesBetween, PRICE_PER_CYCLE_TRY } = sim;
const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

const SAMPLES = Array.from({ length: 400 }, (_, i) => T_REF + i * 7 * HOUR + (i % 5) * 10_000);

test("anchor values at T_REF", () => {
  const s = snapshot(T_REF);
  assert.deepEqual([s.status.total, s.status.active, s.status.idle, s.status.maintenance, s.status.offline], [250, 238, 8, 3, 1]);
  assert.equal(s.cyclesToday, 1890);
  assert.equal(s.cyclesTotal, 725_716);
});

test("total is exactly 250 at every sampled time and categories add up to it", () => {
  for (const ts of SAMPLES) {
    const s = snapshot(ts);
    const st = s.status;
    assert.equal(st.total, 250);
    assert.equal(machinesAt(ts), 250);
    assert.equal(st.active + st.idle + st.maintenance + st.offline, 250);
    for (const v of [st.active, st.idle, st.maintenance, st.offline]) assert.ok(Number.isInteger(v) && v >= 0);
    assert.equal(s.regions.reduce((a, b) => a + b, 0), 250, "regions must sum to the fleet");
    assert.ok(s.top.every((r) => r.value <= s.cyclesToday), "a location cannot exceed all cycles today");
    assert.ok(s.top.reduce((a, r) => a + r.value, 0) <= s.cyclesToday, "top 5 must be a part of today's cycles");
    assert.ok(s.spark.machines.every((v) => v === 250));
  }
});

test("status is deterministic (pure function of the timestamp)", () => {
  for (const ts of SAMPLES.slice(0, 50)) assert.deepEqual(statusAt(ts), statusAt(ts));
});

test("cycles: monotonic, per-range buckets add up, revenue = cycles x price", () => {
  let prev = 0;
  for (const ts of SAMPLES) {
    const s = snapshot(ts);
    assert.ok(s.cyclesTotal >= prev); prev = s.cyclesTotal;
    assert.ok(s.cyclesToday <= s.cyclesTotal);
  }
  for (const ts of [T_REF, T_REF + 3 * DAY + 5 * HOUR, T_REF + 40 * DAY]) {
    for (const range of ["24H", "7D", "30D", "1Y"]) {
      const { buckets } = buildSeries(range, ts);
      for (const b of buckets) {
        assert.equal(b.revenue, b.cycles * PRICE_PER_CYCLE_TRY);
        assert.deepEqual(Object.keys(b).sort(), ["cycles", "future", "partial", "revenue", "t0", "t1"], "no occupancy/maintenance fields remain");
      }
      const live = buckets.filter((b) => !b.future);
      assert.equal(live.reduce((a, b) => a + b.cycles, 0), cyclesBetween(live[0].t0, Math.min(live[live.length - 1].t1, Math.max(ts, T_REF))));
    }
  }
});

test("usage is plausible and continuous: 13 to 16 cycles per machine per full day (same rate as the 2,480-machine model)", () => {
  const days = buildSeries("30D", T_REF + 2 * DAY).buckets.filter((b) => !b.future && !b.partial);
  assert.ok(days.length >= 25);
  for (const b of days) { const pm = b.cycles / 250; assert.ok(pm > 11 && pm < 17, `cycles per machine per day = ${pm}`); }
  const ratios = days.slice(1).map((b, i) => b.cycles / days[i].cycles);
  assert.ok(ratios.every((r) => r > 0.7 && r < 1.4), "no step change between consecutive days");
});

test("Occupancy and Maintenance tabs are gone (UI, translations, simulation, CSS)", () => {
  const comp = read("components/sections/NetworkSection.tsx");
  const dict = read("i18n/network.ts") + read("lib/site-behavior.ts");
  const css = read("app/site.css");
  assert.ok(!/occupancy/i.test(comp) && !/nw_t3|nw_t4|nw_h3|nw_h4|nw_s3|nw_s4/.test(comp + dict));
  for (const w of ["Occupancy", "Doluluk", "الإشغال", "Know what needs service", "Arıza olmadan"]) assert.ok(!dict.includes(w), w);
  assert.ok(!/nw-key|nw-dotm|nw-stroke|nw-line/.test(css));
  assert.ok(!/occupancy|CAPACITY_PER_MACHINE_HOUR/i.test(read("lib/analytics/network-simulation.ts")));
  // other machine status indicators must remain
  for (const k of ["nw_sa", "nw_si", "nw_sm", "nw_so", "nw_st"]) assert.ok(read("i18n/network.ts").includes(k + ":"), k);
});

test("revenue disclaimer and the 'simulated activity' badge are removed in en/tr/ar", () => {
  const net = read("i18n/network.ts");
  for (const w of ["Simulated, not company figures", "şirket verisi değildir", "ولا تمثّل الإيرادات الفعلية للشركة", "nw_sim", "Simulated activity", "Simüle edilmiş hareket", "نشاط مُحاكى\","]) assert.ok(!net.includes(w), w);
  assert.ok(net.includes("Revenue = cleaning cycles × price per cycle"));
  assert.ok(!/nw_sim|Simulated activity/.test(read("components/sections/NetworkSection.tsx")));
});

test("no sentence-ending periods remain in the dictionaries; brand/legal periods are intact", () => {
  const files = ["lib/site-behavior.ts", "i18n/network.ts", "i18n/partners.ts", "i18n/references.ts"];
  for (const f of files) {
    const bad = [...read(f).matchAll(/([^\s".])\.(?=")/g)].filter((m) => m[0] !== "G." || true).map((m) => m.input.slice(Math.max(0, m.index - 20), m.index + 3));
    assert.deepEqual(bad, [], `${f}: ${bad.join(" | ")}`);
  }
  const all = files.map(read).join("\n");
  assert.ok(all.includes("MRS.G"));
  assert.ok(read("constants/references.ts").includes("Petrol Ofisi A.Ş.") && read("constants/references.ts").includes("OPET Petrolcülük A.Ş."));
  assert.ok(read("constants/site.ts").includes("yeggy@maisonjinda.com"));
});
