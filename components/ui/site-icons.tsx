import type { ReactNode } from "react";
const S = (c: ReactNode) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{c}</svg>
);
export const Icons = {
  heart: S(<path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z" />),
  pin: S(<><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.4" /></>),
  chart: S(<path d="M5 20v-6M10.5 20V9M16 20v-9M21 20H3" />),
  gear: S(<><circle cx="12" cy="12" r="3" /><path d="M12 3v2.4M12 18.6V21M3 12h2.4M18.6 12H21M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7" /><circle cx="12" cy="12" r="6.6" /></>),
  grid: S(<><rect x="4" y="4" width="6.5" height="6.5" rx="1.2" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2" /></>),
  people: S(<><circle cx="8.5" cy="8" r="3" /><circle cx="16.5" cy="8" r="3" /><path d="M2.8 19c.4-3 2.7-5 5.7-5s5.3 2 5.7 5M13 14.4c.9-.3 1.6-.4 2.2-.4 2.7 0 4.6 1.8 5 5" /></>),
  headset: S(<><path d="M4.5 14v-2a7.5 7.5 0 0 1 15 0v2" /><rect x="3.5" y="13" width="4" height="6" rx="1.6" /><rect x="16.5" y="13" width="4" height="6" rx="1.6" /><path d="M18.5 19c0 1.4-1.6 2-4 2" /></>),
  plane: S(<path d="M21 3 3 10.5l7 2.5 2.5 7zM10 13l11-10" />),
  mail: S(<><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="m4 7.5 8 6 8-6" /></>),
  phone: S(<path d="M5 4.5h3.6l1.7 4.3-2.3 1.5a11 11 0 0 0 5.7 5.7l1.5-2.3 4.3 1.7V19a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 3 6.7 2 2 0 0 1 5 4.5z" />),
  play: <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M7 4.8v14.4L19 12z" /></svg>,
  arrow: S(<path d="M4 12h15M13 6l6 6-6 6" />),
  chev: S(<path d="m6 9 6 6 6-6" />),
  globe: S(<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.6 2.5 3.9 5.5 3.9 9S14.600 18.500 12 21c-2.600-2.500-3.900-5.500-3.900-9S9.400 5.500 12 3z" /></>),
  instagram: S(<><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r=".6" fill="currentColor" /></>),
  tiktok: <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor"><path d="M16.6 3c.3 2.3 1.7 3.8 3.9 4v3a7.200 7.200 0 0 1-3.800-1.200v6.100a5.800 5.800 0 1 1-5.800-5.800c.3 0 .6 0 .9.100v3.200a2.700 2.700 0 1 0 1.900 2.600V3z" /></svg>,
};
