import type { Config } from "tailwindcss";
// preflight is off so Tailwind's reset never alters the approved section designs.
const config: Config = { content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"], corePlugins: { preflight: false }, theme: { extend: {} }, plugins: [] };
export default config;
