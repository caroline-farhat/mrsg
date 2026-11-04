/* The three reference customers, in display order (left to right on desktop, top to bottom on mobile): Espressolab, Petrol Ofisi, OPET. Logos and videos are real, supplied files served from /public.
   Only add an entry when both of its files exist. Videos are never loaded until the visitor opens the modal. */
export type ReferenceItem = {
  id: "petrol-ofisi" | "opet" | "espressolab";
  name: string;
  subtitle: string;
  logo: { src: string; width: number; height: number; tone: "white" | "blue" };
  video: string;
};

export const REFERENCES: readonly ReferenceItem[] = [
  { id: "espressolab", name: "Espressolab", subtitle: "ESPRESSOLAB A.Ş.", logo: { src: "/references/logos/espressolab.png", width: 554, height: 554, tone: "white" }, video: "/videos/espressolab.mp4" },
  { id: "petrol-ofisi", name: "Petrol Ofisi", subtitle: "Petrol Ofisi A.Ş.", logo: { src: "/references/logos/petrol-ofisi.png", width: 554, height: 554, tone: "white" }, video: "/videos/petrol-ofisi.mp4" },
  { id: "opet", name: "OPET", subtitle: "OPET Petrolcülük A.Ş.", logo: { src: "/references/logos/opet.png", width: 362, height: 262, tone: "blue" }, video: "/videos/opet.mp4" },
];
