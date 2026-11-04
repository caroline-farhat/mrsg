/* References section + video modal labels (EN / TR / AR).
   Read by components/sections/ReferencesSection.tsx through hooks/use-language.ts (makeT falls back to this dictionary). */
import type { Language } from "@/types/language";

export const RT: Record<Language, Record<string, string>> = {
  en: {
    rf_label: "REFERENCES",
    rf_h: "OUR REFERENCES",
    rf_p: "Discover MRS.G machines in action at different locations",
    rf_watch: "Watch Video",
    rf_close: "Close video",
    rf_logo: "logo",
    rf_error: "Unable to load the video. Please try again",
  },
  tr: {
    rf_label: "REFERANSLAR",
    rf_h: "REFERANSLARIMIZ",
    rf_p: "MRS.G makinelerimizi farklı lokasyonlarda iş başında keşfedin",
    rf_watch: "Videoyu İzle",
    rf_close: "Videoyu kapat",
    rf_logo: "logosu",
    rf_error: "Video yüklenemedi. Lütfen tekrar deneyin",
  },
  ar: {
    rf_label: "المراجع",
    rf_h: "مراجعنا",
    rf_p: "اكتشفوا ماكينات MRS.G أثناء عملها في مواقع مختلفة",
    rf_watch: "شاهد الفيديو",
    rf_close: "إغلاق الفيديو",
    rf_logo: "شعار",
    rf_error: "تعذّر تحميل الفيديو. يُرجى المحاولة مرة أخرى",
  },
};
