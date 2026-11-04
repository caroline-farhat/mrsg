/* Static checks for the References section (no browser): files exist, are real, and the code points at them. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = (p) => readFileSync(new URL(p, root), "utf8");
const bytes = (p) => readFileSync(new URL(p, root));
const FILES = {
  "public/references/logos/petrol-ofisi.png": "png", "public/references/logos/opet.png": "png", "public/references/logos/espressolab.png": "png",
  "public/videos/petrol-ofisi.mp4": "mp4", "public/videos/opet.mp4": "mp4", "public/videos/espressolab.mp4": "mp4",
};

test("all six media files exist, are non-empty and have a valid signature", () => {
  for (const [p, kind] of Object.entries(FILES)) {
    assert.ok(statSync(new URL(p, root)).size > 1000, `${p} is empty or tiny`);
    const b = bytes(p);
    if (kind === "png") assert.deepEqual([...b.subarray(0, 8)], [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], `${p} is not a real PNG`);
    else assert.equal(b.subarray(4, 8).toString("latin1"), "ftyp", `${p} is not an MP4`);
  }
});

test("exactly three references, each pointing at its own logo and video", () => {
  const src = read("constants/references.ts");
  const ids = [...src.matchAll(/^\s*\{ id: "([a-z-]+)"/gm)].map((m) => m[1]);
  assert.deepEqual(ids, ["espressolab", "petrol-ofisi", "opet"]);  // display order: Espressolab, Petrol Ofisi, OPET
  for (const id of ids) {
    assert.ok(src.includes(`/references/logos/${id}.png`));
    assert.ok(src.includes(`/videos/${id}.mp4`));
  }
  assert.ok(!/inno|instagram\.com|embed/i.test(src), "no INNO:14 / Instagram embeds");
});

test("References sits immediately before Partnerships and no <video> is rendered by the section itself", () => {
  const page = read("app/page.tsx");
  assert.ok(page.indexOf("<ReferencesSection />") > page.indexOf("<NetworkSection />"));
  assert.ok(page.indexOf("<ReferencesSection />") < page.indexOf("<PartnershipsSection />"));
  assert.ok(!/<video[\s>]/.test(read("components/sections/ReferencesSection.tsx").replace(/\/\*[\s\S]*?\*\//g, "")));
});

test("translations exist for en, tr and ar", () => {
  const src = read("i18n/references.ts");
  for (const s of ["OUR REFERENCES", "REFERANSLARIMIZ", "مراجعنا", "Videoyu İzle", "شاهد الفيديو",
    "Unable to load the video. Please try again\"", "Video yüklenemedi. Lütfen tekrar deneyin\"", "تعذّر تحميل الفيديو. يُرجى المحاولة مرة أخرى\""]) assert.ok(src.includes(s), s);
});

test("navbar has a References link right before Partnerships, translated in en/tr/ar", () => {
  const nav = read("components/layout/nav-markup.ts");
  assert.ok(nav.indexOf('href="#references"') > nav.indexOf('href="#net"'));
  assert.ok(nav.indexOf('href="#references"') < nav.indexOf('href="#part"'));
  const sb = read("lib/site-behavior.ts");
  for (const label of ["References", "Referanslarımız", "مراجعنا"]) assert.ok(sb.includes(`m11:"${label}"`));
});
