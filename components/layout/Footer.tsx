"use client";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Icons } from "@/components/ui/site-icons";
import { CONTACT, SOCIAL, FOOTER_NAV, HIDE_UNPUBLISHED, PRIVACY_POLICY_HREF, mapsSearch, type NavItem } from "@/constants/site";
import { makeT, useLang } from "@/hooks/use-language";

/* Footer: branding + social + newsletter (Brevo double opt-in via /api/newsletter/subscribe),
   Explore / Company / Support / Contact, legal bar and language selector. */

const EXPLORE = [["ft_e1", "#top"], ["ft_e2", "#service"], ["ft_e3", "#loc"], ["ft_e4", "#net"], ["ft_e5", "#part"], ["ft_e6", "#contact"]] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
type Phase = "idle" | "loading" | "ok" | "dup" | "error" | "rate";

function Col({ id, icon, title, children }: { id: string; icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="ft-col" aria-labelledby={`fth-${id}`}>
      <h3>
        <span className="ft-ch" id={`fth-${id}`}>
          <span className="ft-ci">{icon}</span><span className="ft-ct">{title}</span>
        </span>
      </h3>
      <div className="ft-panel"><div className="ft-pi">{children}</div></div>
    </section>
  );
}

function NavList({ items, t }: { items: NavItem[]; t: (k: string) => string }) {
  const shown = HIDE_UNPUBLISHED ? items.filter((i) => i.href) : items;
  return (
    <ul className="ft-list">
      {shown.map((i) => (
        <li key={i.key}>{i.href ? <a href={i.href}>{t(i.key)}</a> : <span className="ft-na">{t(i.key)}</span>}</li>
      ))}
    </ul>
  );
}

function Newsletter({ t }: { t: (k: string) => string }) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [msg, setMsg] = useState<{ k: string; kind: "err" | "ok" | "info" } | null>(null);
  const [field, setField] = useState<"email" | "consent" | null>(null);
  const honey = useRef<HTMLInputElement>(null);
  const busy = useRef(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy.current) return; // duplicate-request protection
    const v = email.trim();
    if (!v) { setField("email"); return setMsg({ k: "nl_empty", kind: "err" }); }
    if (v.length > 254 || !EMAIL_RE.test(v)) { setField("email"); return setMsg({ k: "nl_invalid", kind: "err" }); }
    if (!consent) { setField("consent"); return setMsg({ k: "nl_nocons", kind: "err" }); }
    setField(null);
    busy.current = true;
    setPhase("loading");
    setMsg({ k: "nl_load", kind: "info" });
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: v, consent: true, website: honey.current?.value ?? "", lang: document.documentElement.lang }),
      });
      const data: { status?: string } = await res.json().catch(() => ({}));
      if (res.ok && data.status === "confirm") { setPhase("ok"); setMsg({ k: "nl_ok", kind: "ok" }); setEmail(""); setConsent(false); }
      else if (res.ok && data.status === "exists") { setPhase("dup"); setMsg({ k: "nl_dup", kind: "info" }); }
      else if (res.status === 429) { setPhase("rate"); setMsg({ k: "nl_rate", kind: "err" }); }
      else if (res.status === 400 && data.status === "invalid") { setPhase("error"); setField("email"); setMsg({ k: "nl_invalid", kind: "err" }); }
      else { setPhase("error"); setMsg({ k: "nl_err", kind: "err" }); }
    } catch {
      setPhase("error"); setMsg({ k: "nl_err", kind: "err" });
    } finally {
      busy.current = false;
    }
  }

  return (
    <div className="ft-news">
      <h3 className="ft-nh">{t("nl_h")}</h3>
      <p className="ft-nd">{t("nl_d")}</p>
      <form className="ft-form" onSubmit={onSubmit} noValidate>
        <div className="ft-row">
          <label className="ft-in" data-bad={field === "email"}>
            <span className="sr">{t("nl_label")}</span>
            <span className="ft-mi">{Icons.mail}</span>
            <input type="email" name="email" inputMode="email" autoComplete="email" maxLength={254} placeholder={t("nl_ph")} value={email}
              onChange={(e) => { setEmail(e.target.value); if (field === "email") setField(null); }} aria-invalid={field === "email"} aria-describedby="nl-msg" disabled={phase === "loading"} />
          </label>
          <button className="ft-sub" type="submit" disabled={phase === "loading"} aria-busy={phase === "loading"}>
            {phase === "loading" ? <span className="ft-spin" aria-hidden="true" /> : null}<span>{t("nl_btn")}</span>
          </button>
        </div>
        {/* honeypot: real visitors never see or fill this */}
        <input ref={honey} className="ft-hp" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" defaultValue="" />
        <label className="ft-cons" data-bad={field === "consent"}>
          <input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); if (field === "consent") setField(null); }} aria-invalid={field === "consent"} aria-describedby="nl-msg" />
          <span>{t("nl_consent")}{PRIVACY_POLICY_HREF ? <> <a href={PRIVACY_POLICY_HREF}>{t("nl_privacy")}</a></> : null}</span>
        </label>
        <p id="nl-msg" className="ft-msg" data-kind={msg?.kind ?? "none"} role={msg?.kind === "err" ? "alert" : "status"} aria-live="polite">{msg ? t(msg.k) : ""}</p>
      </form>
    </div>
  );
}

function LangSelect({ t, lang }: { t: (k: string) => string; lang: "en" | "tr" | "ar" }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: Event) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", away); document.removeEventListener("keydown", esc); };
  }, [open]);
  // Uses the site's existing language switch (the navbar buttons), so there is only one language system.
  const pick = (l: string) => { document.querySelector<HTMLButtonElement>(`.lang button[data-l="${l}"]`)?.click(); setOpen(false); };
  const opts: [string, string][] = [["tr", "Türkçe"], ["en", "English"], ["ar", "العربية"]];
  return (
    <div className="ft-lang" ref={box}>
      <button type="button" aria-haspopup="listbox" aria-expanded={open} aria-label={t("ft_lang")} onClick={() => setOpen((o) => !o)}>
        <span className="ft-gl">{Icons.globe}</span><span>{lang.toUpperCase()}</span><span className="ft-lc">{Icons.chev}</span>
      </button>
      {open && (
        <ul role="listbox" aria-label={t("ft_lang")}>
          {opts.map(([k, name]) => (
            <li key={k} role="option" aria-selected={lang === k}><button type="button" onClick={() => pick(k)} lang={k}>{name}</button></li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Footer() {
  const lang = useLang();
  const t = makeT(lang);
  const ext = { target: "_blank", rel: "noopener noreferrer" } as const;
  const legal = HIDE_UNPUBLISHED ? FOOTER_NAV.legal.filter((i) => i.href) : FOOTER_NAV.legal;

  return (
    <footer id="contact" className="ft">
      <div className="fw">
        <div className="ft-grid">
          <div className="ft-brand">
            <a className="brand ft-logo" href="#top" aria-label="MRS.G Helmet Cleaning Systems"><span className="bw">MRS.<b>G</b></span><small>{t("ft_tag")}</small></a>
            <p className="ft-desc">{t("ft_desc")}</p>
            <div className="ft-soc" role="group" aria-label={t("ft_social")}>
              <a href={SOCIAL.instagram} {...ext} aria-label={t("ft_ig")}>{Icons.instagram}</a>
              <a href={SOCIAL.tiktok} {...ext} aria-label={t("ft_tt")}>{Icons.tiktok}</a>
            </div>
            <Newsletter t={t} />
          </div>

          <Col id="explore" icon={Icons.grid} title={t("ft_explore")}>
            <ul className="ft-list">{EXPLORE.map(([k, h]) => <li key={k}><a href={h}>{t(k)}</a></li>)}</ul>
          </Col>
          <Col id="company" icon={Icons.people} title={t("ft_company")}>
            <NavList items={FOOTER_NAV.company} t={t} />
          </Col>
          <Col id="support" icon={Icons.headset} title={t("ft_support")}>
            <NavList items={FOOTER_NAV.support} t={t} />
          </Col>
          <Col id="contactcol" icon={Icons.plane} title={t("ft_contact")}>
            <ul className="ft-ctl">
              <li><span className="ft-ci">{Icons.pin}</span>
                <a href={mapsSearch(CONTACT.office.lines)} {...ext}><strong>{t("ft_office")}</strong><address>{CONTACT.office.lines.map((l, i) => <span key={i}>{l}<br /></span>)}</address><span className="sr">{t("ft_newtab")}</span></a></li>
              <li><span className="ft-ci">{Icons.pin}</span>
                <a href={mapsSearch(CONTACT.factory.lines)} {...ext}><strong>{t("ft_factory")}</strong><address>{CONTACT.factory.lines.map((l, i) => <span key={i}>{l}<br /></span>)}</address><span className="sr">{t("ft_newtab")}</span></a></li>
              <li><span className="ft-ci">{Icons.phone}</span><a href={CONTACT.phoneHref} dir="ltr" aria-label={`${t("ft_phone")}: ${CONTACT.phone}`}>{CONTACT.phone}</a></li>
              <li><span className="ft-ci">{Icons.mail}</span><a href={CONTACT.emailHref} dir="ltr" aria-label={`${t("ft_email")}: ${CONTACT.email}`}>{CONTACT.email}</a></li>
            </ul>
          </Col>
        </div>

        <div className="ft-bar">
          <span className="ft-rights">{t("ft_rights")}</span>
          <div className="ft-bar-r">
            <ul className="ft-legal" aria-label={t("ft_legal")}>
              {legal.map((i) => <li key={i.key}>{i.href ? <a href={i.href}>{t(i.key)}</a> : <span className="ft-na">{t(i.key)}</span>}</li>)}
            </ul>
            <LangSelect t={t} lang={lang} />
          </div>
        </div>
      </div>
    </footer>
  );
}
