/* Behaviour of the marketing sections, carried over unchanged from the approved prototype.
   Uses `.onclick =` assignments, so running it twice (React strict mode) never duplicates handlers. */
import { NET } from "@/i18n/network";
import { PT } from "@/i18n/partners";
import { isLanguage, type Language } from "@/types/language";
export function initSite(){
const D: Record<Language, Record<string, string>> = {
en:{m1:"Home",m2:"The Service",m3:"Locations",m4:"Connected Network",m5:"Partnerships",m11:"References",m6:"Contact",m7:"Get in Touch",m8:"Helmet Cleaning Systems",m9:"Light mode",m10:"Dark mode",n1:"Brand",n2:"Service",n3:"Locations",n4:"Network",n5:"Partners",h1:"Clean helmets. Anywhere",h1p:"Drag to turn the machine. Scroll to see how it works",sc:"Scroll",e1:"Brand story",s1:"A shared helmet should feel new every ride",s1p:"MRS.G puts a fast, sealed helmet-cleaning machine where riders already stop. Open the door, place the helmet, close it. A few moments later it is fresh, safe and ready to wear",e2:"The service",v1:"Three reasons riders come back",t1:"Hygiene you can trust",t1p:"A sealed chamber cleans and refreshes the inside of the helmet, so the next rider starts clean",t2:"Quick enough to wait for",t2p:"A short cycle fits a fuel stop or a pickup. No appointment, no staff needed",t3:"Always where you ride",t3p:"Machines sit in stations, rental points and hubs, so clean helmets are never a detour",e3:"Locations",l0:"Placed where helmets already are",l0p:"From fuel stops to city hubs, MRS.G machines are designed for high-traffic locations, so clean helmets are always within reach",p1:"Petrol stations",p1p:"Clean helmets during your fuel stop",p2:"Motorcycle rentals",p2p:"Always a fresh helmet for your next ride",p3:"Shared fleets",p3p:"Hygiene at scale for every rider",p4:"Shopping malls",p4p:"Conveniently located in your daily stops",p5:"Delivery hubs",p5p:"Helmet hygiene for couriers between shifts",e4:"Connected network",c0:"Every machine, one view",ill:"Illustrative interface · not live data",u1:"Usage",u2:"Revenue",u1t:"See when each machine is used",u2t:"Track earnings per location",e5:"International partnerships",r1:"Bring MRS.G to your country",r1p:"We are looking for distributors and operators who want to build a clean-helmet network in their region",cta:"Contact our partnerships team",fo:"Helmet hygiene, built into the places riders go",f1:"Explore",f2:"Business",f3:"Legal"},
tr:{m1:"Ana Sayfa",m2:"Hizmet",m3:"Lokasyonlar",m4:"Bağlı Ağ",m5:"Ortaklıklar",m11:"Referanslarımız",m6:"İletişim",m7:"İletişime Geç",m8:"Kask Temizleme Sistemleri",m9:"Açık mod",m10:"Koyu mod",n1:"Marka",n2:"Hizmet",n3:"Lokasyonlar",n4:"Ağ",n5:"Ortaklar",h1:"Temiz kasklar. Her yerde",h1p:"Makineyi çevirmek için sürükleyin. Nasıl çalıştığını görmek için kaydırın",sc:"Kaydır",e1:"Marka hikâyesi",s1:"Ortak kullanılan kask her sürüşte yeni gibi olmalı",s1p:"MRS.G, hızlı ve kapalı kask temizleme makinesini sürücülerin zaten durduğu yerlere koyar. Kapıyı açın, kaskı yerleştirin, kapatın. Kısa süre sonra kask temiz ve kullanıma hazır",e2:"Hizmet",v1:"Sürücülerin geri dönme nedeni üç",t1:"Güvenebileceğiniz hijyen",t1p:"Kapalı hazne kaskın içini temizler ve tazeler; sonraki sürücü temiz başlar",t2:"Beklemeye değecek kadar hızlı",t2p:"Kısa döngü yakıt molasına sığar. Randevu ve personel gerekmez",t3:"Hep yolunuzun üzerinde",t3p:"Makineler istasyonlarda, kiralama noktalarında ve merkezlerde; temiz kask için yol sapmanız gerekmez",e3:"Lokasyonlar",l0:"Kasklerin zaten olduğu yerde",l0p:"Akaryakıt molalarından şehir merkezlerine kadar MRS.G makineleri yoğun trafikli noktalar için tasarlandı; temiz kasklar hep elinizin altında",p1:"Akaryakıt istasyonları",p1p:"Yakıt molanız sırasında kasklar temizlensin",p2:"Motosiklet kiralama",p2p:"Bir sonraki sürüşünüz için hep temiz bir kask",p3:"Paylaşımlı filolar",p3p:"Her sürücü için ölçeklenebilir hijyen",p4:"AVM'ler",p4p:"Günlük duraklarınızın üzerinde, kolay erişimde",p5:"Dağıtım merkezleri",p5p:"Vardiyalar arasında kuryeler için kask hijyeni",e4:"Bağlı ağ",c0:"Her makine, tek ekran",ill:"Örnek arayüz · canlı veri değildir",u1:"Kullanım",u2:"Gelir",u1t:"Her makinenin ne zaman kullanıldığını görün",u2t:"Lokasyon bazında kazancı izleyin",e5:"Uluslararası ortaklıklar",r1:"MRS.G'yi ülkenize getirin",r1p:"Bölgesinde temiz kask ağı kurmak isteyen distribütör ve operatörler arıyoruz",cta:"Ortaklık ekibimizle iletişime geçin",fo:"Kask hijyeni, sürücülerin gittiği yerlerde",f1:"Keşfet",f2:"İş",f3:"Yasal"},
ar:{m1:"الرئيسية",m2:"الخدمة",m3:"المواقع",m4:"الشبكة المتصلة",m5:"الشراكات",m11:"مراجعنا",m6:"اتصل بنا",m7:"تواصل معنا",m8:"أنظمة تنظيف الخوذات",m9:"الوضع الفاتح",m10:"الوضع الداكن",n1:"العلامة",n2:"الخدمة",n3:"المواقع",n4:"الشبكة",n5:"الشركاء",h1:"خوذات نظيفة. في كل مكان",h1p:"اسحب لتدوير الجهاز. مرّر لأسفل لترى كيف يعمل",sc:"مرّر",e1:"قصة العلامة",s1:"الخوذة المشتركة يجب أن تبدو جديدة في كل رحلة",s1p:"تضع MRS.G جهاز تنظيف خوذات سريعًا ومغلقًا حيث يتوقف السائقون أصلًا. افتح الباب، ضع الخوذة، أغلقه. بعد لحظات تصبح نظيفة وجاهزة",e2:"الخدمة",v1:"ثلاثة أسباب تجعل السائقين يعودون",t1:"نظافة تثق بها",t1p:"حجرة مغلقة تنظّف الخوذة من الداخل وتنعشها، ليبدأ السائق التالي رحلته بخوذة نظيفة",t2:"سرعة تستحق الانتظار",t2p:"دورة تنظيف قصيرة تناسب التوقف للتزوّد بالوقود، دون الحاجة إلى موعد مسبق أو مساعدة الموظفين",t3:"دائمًا في طريقك",t3p:"تتوفّر الأجهزة في محطات الوقود والمتاجر والمراكز، فلا تحتاج إلى تغيير مسارك",e3:"المواقع",l0:"حيث توجد الخوذات بالفعل",l0p:"من محطات الوقود إلى مراكز المدن، صُممت أجهزة MRS.G لتناسب المواقع التي تشهد حركة كثيفة، وتبقى الخوذات النظيفة في متناول يدك",p1:"محطات الوقود",p1p:"خوذات نظيفة أثناء توقفك للتزوّد بالوقود",p2:"تأجير الدراجات النارية",p2p:"خوذة منتعشة دائمًا لرحلتك القادمة",p3:"الأساطيل المشتركة",p3p:"نظافة بالمقياس الكبير لكل سائق",p4:"المراكز التجارية",p4p:"في مواقع مناسبة ضمن محطاتك اليومية",p5:"مراكز التوصيل",p5p:"نظافة الخوذات للسائقين بين الورديات",e4:"الشبكة المتصلة",c0:"كل جهاز في شاشة واحدة",ill:"واجهة توضيحية · ليست بيانات حية",u1:"الاستخدام",u2:"الإيرادات",u1t:"تعرّف على أوقات استخدام الأجهزة",u2t:"تابع الأرباح لكل موقع",e5:"الشراكات الدولية",r1:"انقل تجربة MRS.G إلى بلدك",r1p:"نبحث عن موزعين ومشغلين يريدون بناء شبكة خوذات نظيفة في منطقتهم",cta:"تواصل مع فريق الشراكات",fo:"نظافة الخوذات في الأماكن التي يقصدها السائقون",f1:"استكشف",f2:"الأعمال",f3:"قانوني"}};
// React-owned translations join the dictionary used by the server-rendered navigation.
for (const language of ["en", "tr", "ar"] as const) {
  Object.assign(D[language], NET[language], PT[language]);
}

const queryAll = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T[] =>
  Array.from(root.querySelectorAll<T>(selector));
const getElement = <T extends HTMLElement = HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing required site element: #${id}`);
  return element as T;
};

const LANGUAGE_STORAGE_KEY = "mrsg-lang";
function readStoredLanguage(): Language | null {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return stored && isLanguage(stored) ? stored : null;
  } catch { return null; /* Storage can be unavailable in private contexts. */ }
}
function storeLanguage(nextLanguage: Language) {
  try { localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage); } catch { /* ignore */ }
}

let language: Language = "en";
const currentLanguageLabel = getElement("lcur");
const languageButtons = queryAll<HTMLButtonElement>(".lang button");

function setLanguage(nextLanguage: Language) {
  language = nextLanguage;
  const dictionary = D[nextLanguage];
  document.documentElement.lang = nextLanguage;
  document.documentElement.dir = nextLanguage === "ar" ? "rtl" : "ltr";
  queryAll<HTMLElement>("[data-i]").forEach((element) => {
    const key = element.dataset.i;
    const translation = key ? dictionary[key] : undefined;
    if (translation != null) element.textContent = translation;
  });
  languageButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.l === nextLanguage)));
  currentLanguageLabel.textContent = nextLanguage.toUpperCase();
  updateThemeButton();
}

// Theme is dark by default and persisted. The layout's inline script applies it before first paint.
const THEME_STORAGE_KEY = "mrsg-theme";
type Theme = "light" | "dark";
const themeButton = getElement<HTMLButtonElement>("tt");
const themeLabel = getElement("tl");
const timedWindow = window as Window & { __mrsgTA?: ReturnType<typeof setTimeout> };

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function updateThemeButton() {
  const label = currentTheme() === "dark" ? D[language].m9 : D[language].m10;
  themeButton.setAttribute("aria-label", label);
  themeButton.setAttribute("title", label);
  themeLabel.textContent = label;
}

function setTheme(theme: Theme, animate: boolean) {
  const root = document.documentElement;
  if (animate) {
    root.classList.add("theme-anim");
    clearTimeout(timedWindow.__mrsgTA);
    timedWindow.__mrsgTA = setTimeout(() => root.classList.remove("theme-anim"), 450);
  }
  root.dataset.theme = theme;
  try { localStorage.setItem(THEME_STORAGE_KEY, theme); } catch { /* Storage can be unavailable in private contexts. */ }
  updateThemeButton();
}

themeButton.onclick = () => setTheme(currentTheme() === "dark" ? "light" : "dark", true);
const onStorage = (event: StorageEvent) => {
  if (event.key === THEME_STORAGE_KEY && (event.newValue === "light" || event.newValue === "dark")) {
    document.documentElement.dataset.theme = event.newValue;
    updateThemeButton();
  }
};
addEventListener("storage", onStorage);

// Navigation menu, language menu and active-link scroll spy.
const nav = getElement("nav");
const menuButton = getElement<HTMLButtonElement>("bg");
const languageDropdown = getElement("ldd");
const languageToggle = getElement<HTMLButtonElement>("lt");
function closeMenu() { nav.classList.remove("open"); menuButton.setAttribute("aria-expanded", "false"); }
function closeLanguageMenu() { languageDropdown.classList.remove("open"); languageToggle.setAttribute("aria-expanded", "false"); }

languageButtons.forEach((button) => {
  button.onclick = () => {
    const nextLanguage = button.dataset.l;
    if (nextLanguage === "en" || nextLanguage === "tr" || nextLanguage === "ar") {
      setLanguage(nextLanguage);
      storeLanguage(nextLanguage); // only an explicit selection is persisted
    }
    closeLanguageMenu();
  };
});
menuButton.onclick = () => menuButton.setAttribute("aria-expanded", String(nav.classList.toggle("open")));
languageToggle.onclick = () => languageToggle.setAttribute("aria-expanded", String(languageDropdown.classList.toggle("open")));
queryAll<HTMLAnchorElement>("#panel a").forEach((anchor) => { anchor.onclick = closeMenu; });

const onDocumentClick = (event: MouseEvent) => {
  const target = event.target;
  if (!(target instanceof Node)) return;
  if (!languageDropdown.contains(target)) closeLanguageMenu();
  if (!nav.contains(target)) closeMenu();
};
const onDocumentKeyDown = (event: KeyboardEvent) => {
  if (event.key === "Escape") { closeLanguageMenu(); closeMenu(); }
};
document.addEventListener("click", onDocumentClick);
document.addEventListener("keydown", onDocumentKeyDown);

const observedSections: Array<[HTMLAnchorElement, HTMLElement | null]> = queryAll<HTMLAnchorElement>("#links a").map((anchor) => {
  const href = anchor.getAttribute("href") ?? "#top";
  const section = href === "#top" ? document.getElementById("hero3d") : document.getElementById(href.slice(1));
  return [anchor, section];
});
let animationFrame = 0;
function updateActiveLink() {
  animationFrame = 0;
  let currentAnchor = observedSections[0][0];
  const activationLine = innerHeight * 0.4;
  const isAtEnd = innerHeight + scrollY >= document.documentElement.scrollHeight - 4;
  observedSections.forEach(([anchor, section]) => {
    if (section && section.getBoundingClientRect().top <= activationLine) currentAnchor = anchor;
  });
  if (isAtEnd) currentAnchor = observedSections[observedSections.length - 1][0];
  observedSections.forEach(([anchor]) => {
    if (anchor === currentAnchor) anchor.setAttribute("aria-current", "true");
    else anchor.removeAttribute("aria-current");
  });
}
const onScroll = () => {
  if (!animationFrame) animationFrame = requestAnimationFrame(updateActiveLink);
};
addEventListener("scroll", onScroll, { passive: true });
addEventListener("resize", onScroll);
updateActiveLink();

const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (entry.isIntersecting) {
    entry.target.classList.add("in");
    revealObserver.unobserve(entry.target);
  }
}), { threshold: 0.2 });
queryAll<HTMLElement>(".rv").forEach((element) => revealObserver.observe(element));
setLanguage(readStoredLanguage() ?? "en"); // restore the visitor's choice; never overwrites it

return () => {
  revealObserver.disconnect();
  document.removeEventListener("click", onDocumentClick);
  document.removeEventListener("keydown", onDocumentKeyDown);
  removeEventListener("scroll", onScroll);
  removeEventListener("storage", onStorage);
  removeEventListener("resize", onScroll);
};

}
