/* Real company data and link availability for the Partnerships section and the Footer.
   Only fill in `href` for destinations that actually exist and whose content is approved. */

export const CONTACT = {
  phone: "+90 540 306 34 34",
  phoneHref: "tel:+905403063434",
  email: "yeggy@maisonjinda.com",
  emailHref: "mailto:yeggy@maisonjinda.com",
  partnershipHref: "mailto:yeggy@maisonjinda.com?subject=MRS.G%20Partnership%20Inquiry",
  office: { lines: ["Turkuaz Bina", "100. Yıl Bulvarı No:55/E", "Daire:14/1", "OSTİM OSB, Yenimahalle", "06374 Ankara / Türkiye"] },
  factory: { lines: ["Saray, 228. Cadde No:4", "06980 Kahramankazan", "Ankara / Türkiye"] },
};
/** Opens a Google Maps search for the written address (no coordinates are invented). */
export const mapsSearch = (lines: string[]) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lines.join(", "))}`;

export const SOCIAL = {
  instagram: "https://www.instagram.com/maisonjinda?srtk=MXNzeXo5MGY1cjJybg==",
  tiktok: "https://www.tiktok.com/@maisonjinda?is_from_webapp=1&sender_device=pc",
};

/** "Watch how it works": set a real video URL to enable the button. null = shown inactive, nothing invented. */
export const PARTNER_VIDEO_URL: string | null = null;

export type NavItem = { key: string; href: string | null };
/* href: null = page does not exist yet, so the label is shown as plain text (no broken link).
   When a page is approved and published, put its path here and it becomes a link automatically. */
export const FOOTER_NAV: { company: NavItem[]; support: NavItem[]; legal: NavItem[] } = {
  company: [
    { key: "ft_c1", href: null }, { key: "ft_c2", href: null }, { key: "ft_c3", href: null }, { key: "ft_c4", href: null }, { key: "ft_c5", href: null },
  ],
  support: [
    { key: "ft_s1", href: null }, { key: "ft_s2", href: null }, { key: "ft_s3", href: null }, { key: "ft_s4", href: null }, { key: "ft_s5", href: null },
  ],
  legal: [{ key: "ft_priv", href: null }, { key: "ft_terms", href: null }, { key: "ft_cookie", href: null }],
};
/** true = hide entries that have no destination yet, instead of showing them as plain text. */
export const HIDE_UNPUBLISHED = false;
/** Privacy policy URL for the newsletter consent text. null = no link is shown. */
export const PRIVACY_POLICY_HREF: string | null = null;
