import { NextResponse } from "next/server";
import { isRateLimited } from "@/lib/server/in-memory-rate-limit";

/*
  POST /api/newsletter/subscribe
  Starts a Brevo double opt-in: Brevo emails a confirmation link, and the contact joins the list only after it is clicked.
  Server-only secrets: BREVO_API_KEY, BREVO_LIST_ID, BREVO_DOI_TEMPLATE_ID, BREVO_DOI_REDIRECT_URL (see .env.example).
  Responses never contain Brevo details. A "confirm" status is returned only when Brevo accepted the request.
*/
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY = 2048; // bytes
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const HEADERS = { "Cache-Control": "no-store" };

const reply = (status: string, http: number) => NextResponse.json({ status }, { status: http, headers: HEADERS });

export async function POST(req: Request) {
  // same-origin only
  const origin = req.headers.get("origin");
  if (origin) {
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    try { if (!host || new URL(origin).host !== host) return reply("error", 403); } catch { return reply("error", 403); }
  }
  if (!(req.headers.get("content-type") ?? "").toLowerCase().includes("application/json")) return reply("invalid", 415);
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY) return reply("invalid", 413);

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
  if (isRateLimited(`ip:${ip}`, 6, 10 * 60_000)) return reply("rate", 429);

  const raw = await req.text();
  if (raw.length > MAX_BODY) return reply("invalid", 413);
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return reply("invalid", 400); }
  if (!body || typeof body !== "object") return reply("invalid", 400);
  const { email: rawEmail, consent, website } = body as { email?: unknown; consent?: unknown; website?: unknown };

  if (typeof website === "string" && website.trim() !== "") return reply("invalid", 400); // honeypot
  if (consent !== true) return reply("invalid", 400);
  if (typeof rawEmail !== "string") return reply("invalid", 400);
  const email = rawEmail.normalize("NFKC").trim().toLowerCase();
  if (!email || email.length > 254 || !EMAIL_RE.test(email) || email.includes("..")) return reply("invalid", 400);
  if (isRateLimited(`em:${email}`, 3, 60 * 60_000)) return reply("rate", 429);

  const apiKey = process.env.BREVO_API_KEY;
  const listId = Number(process.env.BREVO_LIST_ID);
  const templateId = Number(process.env.BREVO_DOI_TEMPLATE_ID);
  const redirectionUrl = process.env.BREVO_DOI_REDIRECT_URL;
  if (!apiKey || !Number.isInteger(listId) || listId <= 0 || !Number.isInteger(templateId) || templateId <= 0 || !redirectionUrl) {
    console.error("[newsletter] Brevo is not configured: set BREVO_API_KEY, BREVO_LIST_ID, BREVO_DOI_TEMPLATE_ID and BREVO_DOI_REDIRECT_URL.");
    return reply("error", 503);
  }

  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 8000);
  try {
    const res = await fetch("https://api.brevo.com/v3/contacts/doubleOptinConfirmation", {
      method: "POST",
      headers: { "api-key": apiKey, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ email, includeListIds: [listId], templateId, redirectionUrl }),
      signal: ctl.signal,
      cache: "no-store",
    });
    if (res.status === 201 || res.status === 204 || res.status === 200) return reply("confirm", 200);

    const data = (await res.json().catch(() => ({}))) as { code?: string; message?: string };
    if (res.status === 400 && /already\s*(exist|in)|duplicate/i.test(`${data.message ?? ""} ${data.code ?? ""}`)) return reply("exists", 200);
    if (res.status === 429) return reply("rate", 429);
    // log only non-sensitive diagnostics
    console.error(`[newsletter] Brevo rejected the request: HTTP ${res.status} ${data.code ?? ""} ${data.message ?? ""}`.trim());
    return reply("error", 502);
  } catch (e) {
    console.error("[newsletter] Brevo request failed:", e instanceof Error ? e.name : "error");
    return reply("error", 502);
  } finally {
    clearTimeout(timer);
  }
}
