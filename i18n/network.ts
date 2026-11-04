/* Connected Network: interface labels (EN / TR / AR).
   These keys are merged into the site's dictionary in lib/site-behavior.ts, so static labels use the usual
   `data-i` attribute; the React component reads the same dictionary for text that changes at runtime. */
import type { Language } from "@/types/language";

export type Lang = Language;
export type NetDict = Record<string, string>;

export const NET: Record<Lang, NetDict> = {
  en: {
    nw_sub: "A growing network of MRS.G machines working around the world to keep riders safe and helmets fresh",
    nw_k1: "Total Machines", nw_k2: "Active Machines", nw_k3: "Cleaning Cycles Today", nw_k4: "Total Cleaning Cycles",
    nw_hr: "since last hour", nw_td: "today", nw_stable: "Stable",
    nw_t1: "Usage", nw_t2: "Revenue",
    nw_h1: "See when each machine is used", nw_h2: "Estimated revenue from cleaning cycles",
    nw_s1: "Explore cleaning activity across MRS.G locations",
    nw_s2: "Revenue = cleaning cycles × price per cycle",
    nw_r1: "24H", nw_r2: "7D", nw_r3: "30D", nw_r4: "1Y", nw_range: "Time range", nw_tabs: "Network analytics",
    nw_upd: "Last updated",
    nw_cl: "cleanings", nw_up: "Upcoming", nw_now: "In progress",
    nw_rt: "Revenue in period", nw_pc: "Price per cycle", nw_avg: "Average per period",
    nw_reg: "Machine activity by region", nw_tr: "Türkiye", nw_eu: "Europe", nw_me: "Middle East", nw_ot: "Other",
    nw_st: "Machine status", nw_sa: "Active", nw_si: "Idle", nw_sm: "Maintenance", nw_so: "Offline", nw_tot: "Total",
    nw_top: "Top locations today", nw_c1: "Ankara", nw_c2: "Istanbul", nw_c3: "Izmir", nw_c4: "Antalya", nw_c5: "Bursa",
    nw_ill: "Illustrative",
    nw_note: "Simulated and illustrative activity. Not live machine telemetry",
    nw_mach: "machines",
  },
  tr: {
    nw_sub: "Dünyanın dört bir yanında çalışan, sürücüleri güvende ve kaskları ferah tutan büyüyen bir MRS.G makine ağı",
    nw_k1: "Toplam Makine", nw_k2: "Aktif Makine", nw_k3: "Bugünkü Temizlik Döngüsü", nw_k4: "Toplam Temizlik Döngüsü",
    nw_hr: "son saatten beri", nw_td: "bugün", nw_stable: "Kararlı",
    nw_t1: "Kullanım", nw_t2: "Gelir",
    nw_h1: "Her makinenin ne zaman kullanıldığını görün", nw_h2: "Temizlik döngülerinden tahmini gelir",
    nw_s1: "MRS.G lokasyonlarındaki temizlik hareketini keşfedin",
    nw_s2: "Gelir = temizlik döngüsü × döngü başı fiyat",
    nw_r1: "24S", nw_r2: "7G", nw_r3: "30G", nw_r4: "1Y", nw_range: "Zaman aralığı", nw_tabs: "Ağ analizleri",
    nw_upd: "Son güncelleme",
    nw_cl: "temizlik", nw_up: "Yaklaşan", nw_now: "Devam ediyor",
    nw_rt: "Dönem geliri", nw_pc: "Döngü başı fiyat", nw_avg: "Dönem ortalaması",
    nw_reg: "Bölgeye göre makine hareketi", nw_tr: "Türkiye", nw_eu: "Avrupa", nw_me: "Orta Doğu", nw_ot: "Diğer",
    nw_st: "Makine durumu", nw_sa: "Aktif", nw_si: "Boşta", nw_sm: "Bakımda", nw_so: "Çevrim dışı", nw_tot: "Toplam",
    nw_top: "Bugünün öne çıkan lokasyonları", nw_c1: "Ankara", nw_c2: "İstanbul", nw_c3: "İzmir", nw_c4: "Antalya", nw_c5: "Bursa",
    nw_ill: "Örnek",
    nw_note: "Simüle edilmiş ve örnek veriler. Canlı makine telemetrisi değildir",
    nw_mach: "makine",
  },
  ar: {
    nw_sub: "شبكة متنامية من أجهزة MRS.G تعمل حول العالم لتبقي السائقين بأمان والخوذات منتعشة",
    nw_k1: "إجمالي الأجهزة", nw_k2: "الأجهزة النشطة", nw_k3: "دورات التنظيف اليوم", nw_k4: "إجمالي دورات التنظيف",
    nw_hr: "خلال الساعة الماضية", nw_td: "اليوم", nw_stable: "مستقر",
    nw_t1: "الاستخدام", nw_t2: "الإيرادات",
    nw_h1: "تعرّف على أوقات استخدام الأجهزة", nw_h2: "الإيرادات التقديرية من دورات التنظيف",
    nw_s1: "استكشف نشاط عمليات التنظيف في مواقع MRS.G",
    nw_s2: "الإيرادات = عدد دورات التنظيف × سعر الدورة",
    nw_r1: "24س", nw_r2: "7ي", nw_r3: "30ي", nw_r4: "1س", nw_range: "النطاق الزمني", nw_tabs: "تحليلات الشبكة",
    nw_upd: "آخر تحديث",
    nw_cl: "عملية تنظيف", nw_up: "قادم", nw_now: "قيد التنفيذ",
    nw_rt: "إيرادات الفترة", nw_pc: "سعر دورة التنظيف", nw_avg: "المتوسط لكل فترة",
    nw_reg: "نشاط الأجهزة حسب المنطقة", nw_tr: "تركيا", nw_eu: "أوروبا", nw_me: "الشرق الأوسط", nw_ot: "أخرى",
    nw_st: "حالة الأجهزة", nw_sa: "نشطة", nw_si: "خاملة", nw_sm: "قيد الصيانة", nw_so: "غير متصلة", nw_tot: "الإجمالي",
    nw_top: "المواقع الأعلى نشاطًا اليوم", nw_c1: "أنقرة", nw_c2: "إسطنبول", nw_c3: "إزمير", nw_c4: "أنطاليا", nw_c5: "بورصة",
    nw_ill: "توضيحي",
    nw_note: "نشاط محاكى وتوضيحي. ليست بيانات حية من الأجهزة",
    nw_mach: "جهاز",
  },
};
