"use client";
import type { MouseEvent } from "react";
import Image from "next/image";
import { PartnerMap } from "@/components/ui/PartnerMap";
import { Icons } from "@/components/ui/site-icons";
import { CONTACT } from "@/constants/site";
import { useInViewOnce } from "@/hooks/use-in-view";
import { makeT, useLang } from "@/hooks/use-language";

/* International Partnerships. Static labels come from the site dictionary (i18n/partners.ts).
   The machine is the real MRS.G photo, shown untouched: public/partners/machine.png */
const BENEFITS = [
  { k: "pt_b1", icon: Icons.heart }, { k: "pt_b2", icon: Icons.pin }, { k: "pt_b3", icon: Icons.chart }, { k: "pt_b4", icon: Icons.gear },
];

/* "Watch how it works" -> the interactive 3D machine at the top of the page (#hero3d, components/sections/Hero3D.tsx).
   The navbar is sticky and in normal flow, so the target is offset by its real height and never hides under it. */
function scrollToShowroom(e: MouseEvent<HTMLAnchorElement>) {
  const el = document.getElementById("hero3d");
  if (!el) return; /* fall back to the plain #hero3d anchor */
  e.preventDefault();
  const nav = document.getElementById("nav");
  const navH = nav ? nav.getBoundingClientRect().height : 0;
  const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - navH);
  const calm = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top, behavior: calm ? "auto" : "smooth" });
}

export default function PartnershipsSection() {
  const lang = useLang();
  const t = makeT(lang);
  const [ref, inView] = useInViewOnce<HTMLElement>();
  const lines = lang === "ar" ? [t("pt_h").replace("\n", " ")] : t("pt_h").split("\n");
  const last = lines.length - 1;
  const endsDot = lines[last].endsWith(".");

  return (
    <section id="part" className="pt" ref={ref} data-in={inView}>
      <div className="fw pt-wrap">
        <div className="pt-copy">
          <span className="pt-label"><i aria-hidden="true" />{t("pt_label")}</span>
          <h2 className="d pt-h">
            {lines.map((ln, i) => (
              <span key={i} className="pt-line">
                {i === last && endsDot ? <>{ln.slice(0, -1)}<span className="pt-dot">.</span></> : ln}
              </span>
            ))}
          </h2>
          <p className="pt-p">{t("pt_p")}</p>
          <div className="pt-ctas">
            <a className="pt-btn pt-primary" href={CONTACT.partnershipHref}>{t("pt_cta")}{Icons.arrow}</a>
            <a className="pt-btn pt-ghost" href="#hero3d" onClick={scrollToShowroom}><span className="pt-play">{Icons.play}</span>{t("pt_watch")}</a>
          </div>
          <ul className="pt-ben">
            {BENEFITS.map((b) => (
              <li key={b.k}><span className="pt-bi">{b.icon}</span><span className="pt-bt">{t(b.k)}</span></li>
            ))}
          </ul>
        </div>

        <div className="pt-vis">
          <div className="pt-light" aria-hidden="true" />
          <PartnerMap />
          <div className="pt-mbox">
            <Image className="pt-machine" src="/partners/machine.png" alt={t("pt_alt")} width={602} height={1289} sizes="(max-width: 1000px) 60vw, 360px" priority={false} />
          </div>
        </div>
      </div>
    </section>
  );
}
