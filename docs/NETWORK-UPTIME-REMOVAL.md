# Network Uptime card removed

Removed from Connected Network (EN/TR/AR): the card (`Kpi i={4}`), `SparkArea`, `ICON.pulse`, `stable`, translation keys
`nw_k5` and `nw_var`, `Status.uptime`, `spark.uptime`, `.nw-spa`, and the uptime assertion in `tests/network.test.mjs`.
Kept (still used elsewhere): `fmt.pct1` (status donut percentages), `nw_stable` (Total Machines card), `.nw-ok`.
KPI grid is now 4 columns (desktop) / 2x2 (<=1180px) / 1 column (<=560px) so no gap is left. Fleet total is unchanged at 250.
