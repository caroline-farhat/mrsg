# Language stability fix (Oct 2026)

## Symptom
On some phones the whole site switched to Turkish or Arabic after tapping a Locations card.

## Root cause (found by code inspection; not reproduced in a real browser)
In the <=1100px layout the closed menu panel (`.panel`) is `opacity:0; visibility:hidden`, but the mobile
rule `.lang{ visibility:visible }` overrode inheritance. The three language buttons (Türkçe / English / العربية)
therefore stayed invisible yet tappable, stacked over the page inside the sticky nav (`z-index:100`),
roughly 400px below the top of the viewport. A tap on whatever sits in that band (e.g. a Locations card)
hit a language button instead. The band position depends on screen height and scroll position, which is why
it was intermittent, mobile/tablet only, and left/right thirds produced Turkish/Arabic.

## Fix (app/site.css)
- `.lang` in the mobile block: `visibility:visible` -> `visibility:inherit`.
- `.panel` closed: `pointer-events:none`; `nav.open .panel`: `pointer-events:auto`.
This also removes the hidden buttons from keyboard/screen-reader focus while the menu is closed.

## Persistence (previously missing)
The language lived only in `<html lang>` and `initSite()` always ended with `setLanguage("en")`, so a reload reset it.
- `lib/site-behavior.ts`: explicit language clicks store `mrsg-lang`; init restores it (default `en`).
- `app/layout.tsx`: the existing pre-paint script also applies the stored `lang`/`dir`.

## Test
`npm test` runs `tests/nav-hit-testing.test.mjs` (Node built-in runner, no new dependencies). It fails on the
original CSS and passes on the fixed CSS. It is a static CSS check, not a browser test.
