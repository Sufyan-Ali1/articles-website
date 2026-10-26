import { backendHeaders } from "@/lib/api/backend-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { configuredApiUrl } from "@/lib/security/urls";
import { readBoundedJson } from "@/lib/security/read-json";
import {
  COOKIE,
  analyticsSecret,
  decodeSession,
  externalReferrer,
  newSession,
  optedOut,
  requestOrigin,
  setSession,
} from "@/lib/analytics/session";

const payload = z
  .object({
    event_id: z.string().uuid(),
    path: z
      .string()
      .min(1)
      .max(2048)
      .regex(/^\/(?!\/)/),
    referrer: z.string().max(2048).default(""),
  })
  .strict();
const headers = { "Cache-Control": "private, no-store" };

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (
    origin !== requestOrigin(request) ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    return NextResponse.json({ error: "Forbidden" }, { status: 403, headers });
  if (optedOut(request.headers)) {
    const response = new NextResponse(null, { status: 204, headers });
    response.cookies.delete(COOKIE);
    return response;
  }
  const secret = analyticsSecret();
  const api = configuredApiUrl(process.env.API_BASE_URL);
  if (!secret || !api) return new NextResponse(null, { status: 204, headers });
  if (
    request.headers.get("content-type")?.split(";", 1)[0] !== "application/json"
  )
    return new NextResponse(null, { status: 415, headers });
  let data: z.infer<typeof payload>;
  try {
    // Reuse the streaming bound to reject oversized/chunked requests as well.
    data = payload.parse(
      await readBoundedJson(
        new Response(request.body, { headers: request.headers }),
        4096,
      ),
    );
  } catch {
    return new NextResponse(null, { status: 400, headers });
  }
  const session =
    decodeSession(request.cookies.get(COOKIE)?.value, secret) ||
    newSession(null, externalReferrer(data.referrer, origin!));
  const article = /^\/articles\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/.exec(data.path);
  if (article) {
    try {
      const upstream = await fetch(`${api}/api/v1/analytics/article-views`, {
        method: "POST",
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(5000),
        headers: {
          ...backendHeaders(),
          "Content-Type": "application/json",
          "X-Analytics-Key": secret,
        },
        body: JSON.stringify({
          event_id: data.event_id,
          session_id: session.id,
          article_slug: article[1],
          tracking_link_id: session.linkId,
          referrer_domain: session.referrer,
        }),
      });
      if (!upstream.ok && upstream.status !== 404)
        return new NextResponse(null, { status: 503, headers });
    } catch {
      return new NextResponse(null, { status: 503, headers });
    }
  }
  const response = new NextResponse(null, { status: 204, headers });
  setSession(response, session, secret, request.nextUrl.protocol === "https:");
  return response;
}
