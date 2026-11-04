"use client";
import { useCallback, useState } from "react";
import Image from "next/image";
import ReferenceVideoModal from "@/components/ui/ReferenceVideoModal";
import { Icons } from "@/components/ui/site-icons";
import { REFERENCES, type ReferenceItem } from "@/constants/references";
import { useInViewOnce } from "@/hooks/use-in-view";
import { makeT, useLang } from "@/hooks/use-language";

/* References: exactly three cards (Espressolab, Petrol Ofisi, OPET, in the order of constants/references.ts), each opening its own local MP4 in a modal.
   Text comes from i18n/references.ts through the site's existing language mechanism (<html lang>); this component
   only reads the language and never changes it. No <video> is rendered until a card is opened. */
export default function ReferencesSection() {
  const lang = useLang();
  const t = makeT(lang);
  const [ref, inView] = useInViewOnce<HTMLElement>();
  const [active, setActive] = useState<ReferenceItem | null>(null);
  const handleClosed = useCallback(() => setActive(null), []);

  return (
    <section id="references" className="rf" ref={ref} data-in={inView} aria-labelledby="rf-heading">
      <div className="fw">
        <header className="rf-head">
          <span className="pt-label"><i aria-hidden="true" />{t("rf_label")}</span>
          <h2 id="rf-heading" className="d rf-h">{t("rf_h")}</h2>
          <p className="rf-p">{t("rf_p")}</p>
        </header>
        <ul className="rf-grid">
          {REFERENCES.map((r) => (
            <li key={r.id} className="rf-card">
              <div className="rf-logo" data-tone={r.logo.tone}>
                <Image src={r.logo.src} alt={`${r.name} ${t("rf_logo")}`} width={r.logo.width} height={r.logo.height} sizes="(max-width: 700px) 80vw, 360px" unoptimized />
              </div>
              <div className="rf-meta">
                <h3 className="rf-name">{r.name}</h3>
                <p className="rf-sub">{r.subtitle}</p>
              </div>
              <button type="button" className="pt-btn pt-ghost rf-btn" aria-haspopup="dialog" aria-label={`${t("rf_watch")}: ${r.name}`} onClick={() => setActive(r)}>
                <span className="pt-play">{Icons.play}</span>{t("rf_watch")}
              </button>
            </li>
          ))}
        </ul>
      </div>
      {active && (
        <ReferenceVideoModal key={active.id} title={active.name} src={active.video} closeLabel={t("rf_close")} errorText={t("rf_error")} onClosed={handleClosed} />
      )}
    </section>
  );
}
