# Connected Network: 250 machines + content clean-up (Oct 31 2026)

## Machine count
- Single source of truth: `BASE.machines = 250` in `lib/analytics/network-simulation.ts`. `machinesAt()` returns 250 (constant fleet, no growth).
- T_REF anchor (13:00 UTC, 2026-10-25): 250 = 238 active + 8 idle + 3 maintenance + 1 offline; 1,890 cycles today; 725,716 cycles in total.
- Status split: `active = total - idle - maintenance - offline`, so the four categories always add up to 250. Wave amplitudes were re-sized for a 250-machine fleet (a few machines up or down).
- Regions: weights 90 / 70 / 50 / 40 (largest-remainder split, always 250). Top locations stay shares of today's cycles (the reference day is still 18,750 for the shares only).
- Cycles: per-machine usage is unchanged from the 2,480-machine model, so cyclesToday was scaled 250/2,480. The lifetime total was *not* scaled by that factor: the old 4,850,000 assumed a fleet growing ~6 machines per day; with a constant fleet the same per-machine usage adds up to 725,716, which keeps daily usage continuous (about 13-15 cycles per machine per day) instead of creating a step at the anchor date.
- Revenue = cycles x 100 TRY (unchanged formula, still simulated).
- "Total Machines" card: the weekly +N delta was removed because a fixed fleet is always +0; it now shows the existing "Stable" indicator.

## Removed
- Occupancy and Maintenance tabs of the analytics panel (UI, chart modes, stat rows, key, CSS, `nw_t3/t4/h3/h4/s3/s4/oc/pk/av/mh/mi/of/avl` and legacy `u3/u4/u3t/u4t`).
- Kept: Machine status donut (Active/Idle/Maintenance/Offline), regions, top locations, uptime.
- Revenue disclaimer sentence (EN/TR/AR) from `nw_s2`.
- "Simulated activity" badge (`nw_sim`, EN/TR/AR) and the now-unused `nw_wk`.

## Sentence-ending periods
Final periods of visible strings were removed in en/tr/ar (dictionaries, hard-coded fallbacks, the two 3D caption lines). Periods between sentences, in MRS.G, A.Ş., e-mail/domain, numbers and code were left alone.

## Tests
`npm test` (Node built-in runner, no browser): simulation consistency over 400 timestamps, series/revenue checks, removed content, no terminal periods in the dictionaries.
