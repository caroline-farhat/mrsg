"use client";
import Image from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";
import { useLang } from "@/hooks/use-language";
import type { Language } from "@/types/language";

/* Copy for this section only. Language follows <html lang>, which the site's existing EN/TR/AR switch sets. */
const COPY: Record<Language, { eye: string; idx: string; lines: [string, string, string, string]; p: string; b: [string, string, string]; alt: string }> = {
  en: {
    eye: "Brand story",
    idx: "01 / THE IDEA",
    lines: ["A shared", "helmet should", "feel new", "every ride"],
    p: "MRS.G puts a fast, sealed helmet-cleaning machine where riders already stop. Open the door, place the helmet, close it. A few moments later it is fresh, safe and ready to wear",
    b: ["Cleaner helmets", "Quick & convenient", "Where riders stop"],
    alt: "A black full-face helmet inside the red-lit cleaning chamber with a light mist",
  },
  tr: {
    eye: "Marka hikâyesi",
    idx:"01 / FIKIR",
    lines: ["Ortak kullanılan", "kask her sürüşte", "yeni gibi", "olmalı"],
    p: "MRS.G, hızlı ve kapalı kask temizleme makinesini sürücülerin zaten durduğu yerlere koyar. Kapıyı açın, kaskı yerleştirin, kapatın. Kısa süre sonra kask temiz ve kullanıma hazır",
    b: ["Daha temiz kasklar", "Hızlı ve pratik", "Sürücülerin durduğu yerde"],
    alt: "Kırmızı ışıklı temizleme haznesinde hafif buharla çevrili siyah tam yüz kask",
  },
  ar: {
    eye: "قصة العلامة",
    idx: "01 / الفكرة",
    lines: ["يجب أن تبدو", "الخوذة المشتركة وكأنها", "جديدة", "في كل رحلة"],
    p: "توفّر MRS.G جهازًا سريعًا ومغلقًا لتنظيف الخوذات في الأماكن التي اعتاد السائقون التوقف فيها. افتح باب الجهاز، وضع الخوذة بداخله، ثم أغلقه. وبعد لحظات، تصبح الخوذة نظيفة وآمنة وجاهزة للارتداء",
    b: ["خوذات أنظف", "سريع ومريح", "في الأماكن التي يتوقف فيها الراكبون"],
    alt: "خوذة سوداء كاملة الوجه داخل حجرة التنظيف المضاءة بالأحمر مع ضباب خفيف",
  },
};

const ICONS = [
  <svg key="s" viewBox="0 0 48 48" aria-hidden="true"><path d="M24 5 8.5 10.5v11.2c0 9.6 6.2 17.2 15.5 21.3 9.3-4.1 15.5-11.7 15.5-21.3V10.5L24 5z" /><path d="M24 12.5 15 15.8v6.3c0 5.7 3.5 10.4 9 13.2 5.5-2.8 9-7.5 9-13.2v-6.3l-9-3.3z" opacity=".55" /></svg>,
  <svg key="c" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="17.5" /><path d="M24 12.5V24l7.5 4.5" /><path d="M21 3.5h6" /></svg>,
  <svg key="l" viewBox="0 0 48 48" aria-hidden="true"><path d="M24 43s13-12.2 13-23.2C37 12.7 31.4 7 24 7S11 12.7 11 19.8C11 30.8 24 43 24 43z" /><circle cx="24" cy="20" r="5" /></svg>,
];

export default function BrandStorySection() {
  const lang = useLang();
  const ref = useRef<HTMLElement>(null);

  /* reveal once when entering the viewport; mist only animates while visible */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) {
          el.toggleAttribute("data-vis", e.isIntersecting);
          if (e.isIntersecting) el.classList.add("bs-in");
        }
      },
      { threshold: 0.18 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const t = COPY[lang];

  return (
    <section id="story" ref={ref} className="bs" aria-labelledby="bs-h">
      <div className="bs-vis" aria-hidden={false}>
        <Image className="bs-img" src="/story/helmet-chamber.webp" alt={t.alt} fill quality={90} sizes="(max-width: 1024px) 100vw, 56vw" />
        <div className="bs-mist" aria-hidden="true"><i /><i /><i /></div>
        <div className="bs-glow" aria-hidden="true" />
      </div>

      <div className="fw bs-in-wrap">
        <div className="bs-eye bs-r" style={{ "--d": "0ms" } as CSSProperties}>
          <span className="bs-eye-a">{t.eye}</span>
        </div>

        <h2 id="bs-h" className="bs-h">
          {lang === "ar" ? (
            <span className="bs-r bs-ar-flow" style={{ "--d": "120ms" } as CSSProperties}>
              {t.lines[0]} {t.lines[1]} <span className="bs-hl">{t.lines[2]}</span> {t.lines[3]}
            </span>
          ) : t.lines.map((ln, i) => (
            <span key={i} className={`bs-line bs-r${i === 2 ? " bs-hl" : ""}`} style={{ "--d": `${120 + i * 110}ms` } as CSSProperties}>
              {ln}{" "}
            </span>
          ))}
        </h2>

        <p className="bs-p bs-r" style={{ "--d": "620ms" } as CSSProperties}>{t.p}</p>

        <ul className="bs-benefits bs-r" style={{ "--d": "760ms" } as CSSProperties}>
          {t.b.map((label, i) => (
            <li key={i}>
              <span className="bs-ic">{ICONS[i]}</span>
              <span className="bs-bl">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
