// Regression test for the "whole site randomly switches language" bug.
// Root cause: in the <=1100px layout the closed menu panel is opacity:0 + visibility:hidden,
// but `.lang { visibility: visible }` overrode that inheritance, leaving the Türkçe / English / العربية
// buttons invisible yet tappable on top of the page (nav is sticky, z-index 100).
// Run with: npm test  (uses Node's built-in test runner, no extra dependencies)
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../app/site.css", import.meta.url), "utf8");

// The first mobile-nav block: "@media(max-width:1180px){ ... }" that contains the .panel rule.
const start = css.indexOf("@media(max-width:1180px){\n :root{--navbar-height:60px}");
assert.ok(start >= 0, "mobile navigation media block not found");
const end = css.indexOf("/* SECTIONS */", start);
const block = css.slice(start, end);

const rule = (selector) => {
  const m = block.match(new RegExp(`(?:^|\\s|\\})${selector.replace(/[.]/g, "\\.")}\\{([^}]*)\\}`));
  return m ? m[1] : null;
};

test("closed mobile menu: language buttons must not be forced visible", () => {
  const lang = rule(".lang");
  assert.ok(lang, ".lang rule missing in the mobile block");
  assert.doesNotMatch(lang, /visibility:\s*visible/, ".lang must inherit the panel's visibility, otherwise it stays tappable while the menu is closed");
});

test("closed mobile menu: panel must not receive pointer events", () => {
  const panel = rule(".panel");
  assert.ok(panel, ".panel rule missing in the mobile block");
  assert.match(panel, /pointer-events:\s*none/, "closed panel must ignore taps");
  assert.match(block, /nav\.open \.panel\{[^}]*pointer-events:\s*auto/, "open panel must accept taps");
});
