/** Languages supported by every translated MRS.G interface. */
export type Language = "en" | "tr" | "ar";

export function isLanguage(value: string): value is Language {
  return value === "en" || value === "tr" || value === "ar";
}
