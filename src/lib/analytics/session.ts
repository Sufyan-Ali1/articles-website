import "server-only";
import { createHmac, timingSafeEqual, randomUUID } from "node:crypto";
import { z } from "zod";
import type { NextRequest, NextResponse } from "next/server";

export const COOKIE = "ae_traffic";
export const SESSION_SECONDS = 30 * 60;
const sessionSchema = z.object({
  id: z.string().uuid(),
  linkId: z.string().uuid().nullable(),
  referrer: z.string().max(253).nullable(),
  expires: z.number().int(),
});
export type TrafficSession = z.infer<typeof sessionSchema>;

export function analyticsSecret(): string | null {
  const secret = process.env.ANALYTICS_INGEST_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}
function signature(payload: string, secret: string) {
  return createHmac("sha256", secret)
    .update(`ae-traffic-v1:${payload}`)
    .digest("base64url");
}
export function encodeSession(session: TrafficSession, secret: string): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${signature(payload, secret)}`;
}
export function decodeSession(
  value: string | undefined,
  secret: string,
): TrafficSession | null {
  if (!value || value.length > 2048) return null;
  try {
    const parts = value.split(".");
    if (parts.length !== 2) return null;
    const expected = Buffer.from(signature(parts[0], secret));
    const actual = Buffer.from(parts[1]);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual))
      return null;
    const session = sessionSchema.parse(
      JSON.parse(Buffer.from(parts[0], "base64url").toString()),
    );
    return session.expires > Date.now() &&
      session.expires <= Date.now() + SESSION_SECONDS * 1000 + 5000
      ? session
      : null;
  } catch {
    return null;
  }
}
export function externalReferrer(value: string, origin: string): string | null {
  try {
    const url = new URL(value);
    if (
      !["https:", "http:"].includes(url.protocol) ||
      url.origin === new URL(origin).origin ||
      url.hostname.length > 253
    )
      return null;
    return url.hostname.toLowerCase().replace(/\.$/, "");
  } catch {
    return null;
  }
}
export function newSession(
  linkId: string | null,
  referrer: string | null,
): TrafficSession {
  return {
    id: randomUUID(),
    linkId,
    referrer,
    expires: Date.now() + SESSION_SECONDS * 1000,
  };
}
export function setSession(
  response: NextResponse,
  session: TrafficSession,
  secret: string,
  secure: boolean,
) {
  response.cookies.set(
    COOKIE,
    encodeSession(
      { ...session, expires: Date.now() + SESSION_SECONDS * 1000 },
      secret,
    ),
    {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_SECONDS,
    },
  );
}
export function optedOut(headers: Headers) {
  return headers.get("dnt") === "1" || headers.get("sec-gpc") === "1";
}

export function requestOrigin(request: NextRequest): string {
  const url = new URL(request.url);
  // Next.js can normalize loopback hostnames; the incoming Host preserves the
  // browser-visible host. Only use this for same-origin comparison, never redirects.
  url.host = request.headers.get("host") || url.host;
  return url.origin;
}
