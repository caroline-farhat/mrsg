/* Embedding bridge. Loaded after js/controls.js; the original scene code is not modified.
   Plain mouse-wheel / trackpad scrolling is handed to the parent page so the hero never traps scrolling.
   Zoom keeps working with Ctrl/Cmd + wheel (also trackpad pinch) and with two-finger pinch on touch. */
window.addEventListener('wheel', function (e) {
    if (!e.ctrlKey && !e.metaKey) {
        e.stopImmediatePropagation(); /* skip the original zoom handler; no preventDefault, so scroll chains to the page */
    }
}, { capture: true, passive: true });
