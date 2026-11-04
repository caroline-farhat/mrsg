# References section (Oct 31 2026)

- Position: `<ReferencesSection />` in `app/page.tsx`, directly after Connected Network and **immediately before Partnerships**. Anchor `#references` (Partnerships stays `#part`). The navbar was not changed.
- Cards (exactly three): Petrol Ofisi, OPET, Espressolab — data in `constants/references.ts`.
- Logos: `public/references/logos/{petrol-ofisi,opet,espressolab}.png` (the supplied PNGs, byte-for-byte; shown with `object-fit: contain`, `unoptimized` so colors/pixels are untouched).
- Videos: `public/videos/{petrol-ofisi,opet,espressolab}.mp4` (supplied files, renamed; remuxed with `-c copy -movflags +faststart`, i.e. no re-encoding, so playback can start before the full download). All 720x1280 H.264; Espressolab has no audio track in the supplied file.
- Modal: `components/ui/ReferenceVideoModal.tsx` (portal, native `<video controls playsInline preload="metadata">`, no autoplay).
  - Only one `<video>` exists, only while the modal is open, so nothing is fetched on page load.
  - Close = X button, Esc, backdrop click. Closing pauses, rewinds, removes `src` and calls `load()` to abort the download.
  - Scroll lock on `<html>` with scrollbar compensation; exact scroll position restored; focus trapped and returned to the Watch Video button.
  - Load failure shows the translated message inside the modal (`rf_error`).
- Translations: `i18n/references.ts` (EN/TR/AR), read via `makeT` in `hooks/use-language.ts`. The section only *reads* `<html lang>`; it never sets language.
- Styles: appended at the end of `app/site.css` (`.rf`, `.rf-*`), reusing the existing `--pf-*` tokens and the `.pt-btn` look; light/dark follow `:root[data-theme]`.
- Test: `npm test` includes `tests/references.test.mjs` (static: files exist/valid, wiring, order, translations).
