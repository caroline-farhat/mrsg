# Service + Locations animation fixes

Targeted fixes. No redesign, no copy/translation/asset changes. Files touched: `app/site.css`,
`components/sections/LocationsSection.tsx` (nothing else).

## 1. Service timer frozen on desktop

**Cause.** `app/site.css` ends its reveal block with a global
`@media (prefers-reduced-motion: reduce){ *{animation:none!important;transition:none!important} }`.
Desktop OSes expose that preference (Windows: *Settings > Accessibility > Visual effects > Animation effects* off,
remote desktop sessions, some power-saver modes); phones almost never do. With it on, the clock sweep had no animation
at all (`getAnimations()` returned `[]`) and stayed on its first frame (hand at 12 o'clock) - exactly the "works on mobile,
not on desktop" symptom. Nothing in the Service code is breakpoint-specific.

**Fix.**
- The sweep is kept under reduced motion, but slower (30 s per turn instead of 14 s) and only while item 02 is active:
  `.svc-vis figure.on .clock .sw{animation:spin 30s linear infinite!important}`. Zoom, mist drift and pin pulses stay off.
  *To make the clock fully static again for reduced-motion users, delete that one rule (marked in `site.css`).*
- Sweep, mist and pin-pulse animations are `paused` unless their panel is `.on` (they used to run invisibly in the
  background). Sweep resumes from where it paused, so there is no jump and exactly one animation exists.

## 2. Arabic clock on top of the machine

**Cause.** `.clock{inset-inline-start:0}` is a *logical* property: it means "left" in LTR and "right" in RTL. The product
photo is never mirrored, so its empty strip is on the physical left of the machine in every language; in Arabic the clock
was pinned to the right edge of the panel, on top of the machine.

**Fix.** In RTL the clock is pinned to the physical left (`inset-inline-start:auto;left:0`).
On desktop (>=1025px) the panel is a size container (`container-type:size`) and the clock is fitted to the empty strip:
the machine's left edge is 39.5% of the photo and the photo is `object-fit:cover`, right-aligned, 946x788, so
`free = 100cqw - .605 * max(100cqw, 120.05cqh)`; `diameter = clamp(100px, free - 36px, 60%)`, centred in the strip.
Works at any desktop width, not just one resolution. Stacked layout (<=1024px) uses the same placement/size as EN/TR.
English and Turkish are untouched.

## 3. Locations cards on mobile

Causes found, with measured effect (4x CPU throttle, touch, 390px; see the report for numbers):
- `aspect-ratio` 1.28 -> 1.55 on `.lc-img` cannot be transitioned: the image box snapped taller in one frame
  while the card width was still animating. Now an animated `height` with identical proportions
  (`--lc-off` / `--lc-on` custom properties hold the card widths, one source for flex-basis, image height and text width).
- `background` swapped between a translucent colour and a gradient (not interpolable, flipped halfway). Now a
  `::before` layer whose opacity fades. `padding-inline` (14 -> 18px) used to snap; now it transitions.
- Description text had to re-wrap while the card widened; it now has the final width (clipped by the card) so it does not reflow.
- `:hover` sticks after a tap on touch screens (tapped card lifted/zoomed). Hover effects are inside `@media(hover:hover)`.
- Scroll-follow loop: fought `scroll-snap` (browser re-snaps on the first layout change), could not be interrupted by the
  user, and - in RTL - clamped `scrollLeft` to `[0,max]` although RTL scrollLeft is `<= 0`, so tapping a card in Arabic
  scrolled it off screen. Now it works from on-screen geometry (same in LTR/RTL), pauses scroll-snap synchronously in the tap
  handler and restores it when done, stops on touchstart/wheel, cancels cleanly on rapid taps, and jumps directly under reduced motion.
- Card images (15-21 KB each) are `loading="eager"` so they do not pop in when swiped into view.
- `touch-action:manipulation` and a transparent tap highlight: no double-tap delay/flash. Single `onClick` only (no touch+click duplication).

Desktop (>=1280px) layout is unchanged (settled pixels identical before/after).

---

## Addendum: Arabic clock + pins now share the EN/TR geometry (supersedes section 2)

**Clock.** The Arabic override that shrank the clock (36%, container-query fit) and pinned it to the strip beside the machine was
wrong and has been removed. In Arabic the whole panel (`.svc-vis`, 54%) sits on the physical left, but the photo inside it is
never mirrored, so the machine is at the panel's right edge exactly as in EN/TR. The English clock is `inset-inline-start:0`
(= physical left of the panel), 60% wide, so the single shared rule is now `.clock{left:0;width:60%}` for every language
(78% when stacked). Same diameter, same overlap with the machine, same sweep.

**Pins.** `.pin` is a flex row (dot, then label). Under `dir=rtl` a flex row runs right-to-left, so the label jumped to the left of
the dot and the pin's `left:%` anchor moved to the label's far edge, shifting the dot off the dotted path. `[dir=rtl] .pin{direction:ltr}`
restores the EN/TR geometry (dot on the path, label on its right); `[dir=rtl] .pin span{direction:rtl;text-align:right}` keeps the
Arabic text itself RTL. No transforms, no duplicated animation.

Only `app/site.css` (and this note) changed.
