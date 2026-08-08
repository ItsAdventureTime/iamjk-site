import type { APIRoute } from "astro";
import { countryCodes } from "../../lib/countries";

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const MAX_BODY_BYTES = 16_384;
const MAX_MESSAGE_LENGTH = 5_000;
const MAX_NAME_LENGTH = 80;
const MAX_MOBILE_LENGTH = 32;
const MAX_EMAIL_LENGTH = 254;
const MIN_COMPLETION_MS = 1_200;
const RATE_WINDOW_MS = 15 * 60 * 1_000;
const RATE_LIMIT = 5;
const attempts = new Map<string, number[]>();
const validCountryCodes = new Set(countryCodes);

function secret(name: string): string {
  const value = process.env[name]?.trim();
  if (value) return value;
  throw new Error(`Missing runtime secret: ${name}`);
}

function textValue(value: FormDataEntryValue | null, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.normalize("NFKC").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, maxLength);
}

function validEmail(value: string): boolean {
  return value.length <= MAX_EMAIL_LENGTH && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function requestIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(ip) || []).filter((time) => now - time < RATE_WINDOW_MS);
  recent.push(now);
  attempts.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

async function verifyTurnstile(token: string, request: Request, secretKey: string): Promise<boolean> {
  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ secret: secretKey, response: token, remoteip: requestIp(request) }),
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) return false;
  const result = await response.json() as { success?: boolean; hostname?: string; action?: string };
  return result.success === true && (!result.hostname || ["iamjk.site", "www.iamjk.site"].includes(result.hostname)) && (!result.action || result.action === "turnstile-spin-v2");
}

export const POST: APIRoute = async ({ request }) => {
  const requestId = crypto.randomUUID();
  const origin = request.headers.get("origin");
  if (origin && !["https://iamjk.site", "https://www.iamjk.site"].includes(origin)) {
    return Response.json({ message: "Please submit the form normally." }, { status: 403 });
  }
  if (rateLimited(requestIp(request))) {
    return Response.json({ message: "Please wait a little before trying again." }, { status: 429, headers: { "retry-after": "900" } });
  }
  if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/x-www-form-urlencoded" && !request.headers.get("content-type")?.startsWith("multipart/form-data")) {
    return Response.json({ message: "Please submit the form normally." }, { status: 415 });
  }
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) return Response.json({ message: "Your message is too large." }, { status: 413 });

  try {
    const contentType = request.headers.get("content-type") || "";
    const rawBody = await request.arrayBuffer();
    if (rawBody.byteLength > MAX_BODY_BYTES) return Response.json({ message: "Your message is too large." }, { status: 413 });
    const form = await new Response(rawBody, { headers: { "content-type": contentType } }).formData();
    const startedAt = Number(textValue(form.get("startedAt"), 20));
    const name = textValue(form.get("name"), MAX_NAME_LENGTH);
    const country = textValue(form.get("country"), 2).toUpperCase();
    const email = textValue(form.get("email"), MAX_EMAIL_LENGTH).toLowerCase();
    const mobile = textValue(form.get("mobile"), MAX_MOBILE_LENGTH);
    const message = textValue(form.get("message"), MAX_MESSAGE_LENGTH);
    const website = textValue(form.get("website"), 100);
    const token = textValue(form.get("cf-turnstile-response"), 2_048);
    if (website || (startedAt > 0 && Date.now() - startedAt < MIN_COMPLETION_MS)) return Response.json({ message: "Please try again." }, { status: 400 });
    if (!name || !validCountryCodes.has(country) || !message || (email && !validEmail(email)) || !token) return Response.json({ message: "Please check the highlighted fields and try again." }, { status: 400 });
    if (!(await verifyTurnstile(token, request, secret("TURNSTILE_SECRET")))) return Response.json({ message: "We could not verify this submission. Please try again." }, { status: 403 });

    const apiKey = secret("RESEND_API_KEY");
    const from = secret("RESEND_FROM");
    const to = secret("RESEND_TO");
    if (!validEmail(from) || !validEmail(to)) {
      console.error("[contact] invalid Resend sender configuration", { requestId });
      return Response.json({ message: `I couldn’t send that just now. Reference ${requestId.slice(0, 8)}.` }, { status: 503 });
    }
    const replyTo = email || undefined;
    const emailBody = [`New message from iamjk.site`, ``, `Name: ${name}`, `Country: ${country}`, `Email: ${email || "Not provided"}`, `Mobile: ${mobile || "Not provided"}`, ``, message].join("\n");
    const resend = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json", "idempotency-key": requestId, "user-agent": "iamjk-site-contact/1.0" },
      body: JSON.stringify({ from, to: [to], reply_to: replyTo, subject: `New message from ${name}`, text: emailBody }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!resend.ok) {
      const details = await resend.json().catch(() => ({})) as { name?: string };
      console.error("[contact] Resend rejected message", { requestId, status: resend.status, errorType: details.name || "unknown" });
      return Response.json({ message: `I couldn’t send that just now. Reference ${requestId.slice(0, 8)}.` }, { status: 502 });
    }
    console.info("[contact] message accepted by Resend", { requestId });
    return Response.json({ message: "Thanks for writing. Your message has been sent privately." }, { status: 200 });
  } catch (error) {
    console.error("[contact] submission failed", { requestId, errorType: error instanceof Error ? error.name : "unknown" });
    return Response.json({ message: `I couldn’t send that just now. Reference ${requestId.slice(0, 8)}.` }, { status: 503 });
  }
};

export const GET: APIRoute = async () => new Response(null, { status: 405, headers: { Allow: "POST", "X-Robots-Tag": "noindex, nofollow, noarchive" } });
