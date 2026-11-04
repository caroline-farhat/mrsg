"use client";
import { useEffect } from "react";
import { initSite } from "@/lib/site-behavior";

/** Attaches the language switch, tabs, panels and reveals to the server-rendered markup. */
export default function SiteBehavior() {
  useEffect(() => initSite(), []);
  return null;
}
