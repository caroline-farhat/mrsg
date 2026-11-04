"use client";
import { useEffect, useState } from "react";
import { PT } from "@/i18n/partners";
import { RT } from "@/i18n/references";
import { isLanguage, type Language } from "@/types/language";

/** Current site language, read from <html lang> (set by the site's existing language switch). */
export function useLang(): Language {
  const [l, setL] = useState<Language>("en");
  useEffect(() => {
    const read = () => { const v = document.documentElement.lang; setL(isLanguage(v) ? v : "en"); };
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    return () => mo.disconnect();
  }, []);
  return l;
}
export const makeT = (lang: Language) => (k: string): string => PT[lang][k] ?? RT[lang][k] ?? PT.en[k] ?? RT.en[k] ?? k;

