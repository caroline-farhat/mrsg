import type { Metadata, Viewport } from "next";
import { Alexandria, Outfit } from "next/font/google";
import "./globals.css";
import "./site.css";

const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal"],
  display: "swap",
  variable: "--font-outfit",
});

const alexandria = Alexandria({
  subsets: ["arabic", "latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal"],
  display: "swap",
  variable: "--font-alexandria",
});

export const metadata: Metadata = {
  title: "MRS.G — Helmet care, everywhere you ride",
  description: "MRS.G helmet cleaning machines for petrol stations, rentals, fleets, malls and delivery hubs.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#000000" };

const themeInit = `(function(){try{var d=document.documentElement;var t=localStorage.getItem("mrsg-theme");d.dataset.theme=t==="light"?"light":"dark";var l=localStorage.getItem("mrsg-lang");if(l==="en"||l==="tr"||l==="ar"){d.lang=l;d.dir=l==="ar"?"rtl":"ltr"}}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" data-theme="dark" className={`${outfit.variable} ${alexandria.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
