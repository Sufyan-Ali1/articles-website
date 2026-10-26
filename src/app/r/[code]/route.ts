import { backendHeaders } from "@/lib/api/backend-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { configuredApiUrl } from "@/lib/security/urls";
import { readBoundedJson } from "@/lib/security/read-json";
import {
  analyticsSecret,
  externalReferrer,
  newSession,
  optedOut,
  requestOrigin,
  setSession,
} from "@/lib/analytics/session";

const destination = z.object({
  data: z.object({
    id: z.string().uuid(),
    article_slug: z
      .string()
      .min(1)
      .max(350)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  }),
});
const headers = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> },
) {
  const { code } = await context.params;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(code) || code.length > 80)
    return new NextResponse("Link not found", { status: 404, headers });
  const api = configuredApiUrl(process.env.API_BASE_URL);
  if (!api)
    return new NextResponse("Service unavailable", { status: 503, headers });
  try {
    const upstream = await fetch(
      `${api}/api/v1/tracking-links/${encodeURIComponent(code)}`,
      {
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(5000),
        headers: backendHeaders(),
      },
    );
    if (!upstream.ok)
      return new NextResponse(
        upstream.status === 404 ? "Link not found" : "Service unavailable",
        { status: upstream.status === 404 ? 404 : 503, headers },
      );
    const { data } = destination.parse(await readBoundedJson(upstream, 8192));
    // Construct a local path only: the backend can never redirect to an external host.
    const response = new NextResponse(null, {
      status: 302,
      headers: { Location: `/articles/${data.article_slug}` },
    });
    for (const [key, value] of Object.entries(headers))
      response.headers.set(key, value);
    const secret = analyticsSecret();
    if (secret && !optedOut(request.headers))
      setSession(
        response,
        newSession(
          data.id,
          externalReferrer(
            request.headers.get("referer") || "",
            requestOrigin(request),
          ),
        ),
        secret,
        request.nextUrl.protocol === "https:",
      );
    return response;
  } catch {
    return new NextResponse("Service unavailable", { status: 503, headers });
  }
}

// Link previews and HEAD checks don't create attribution sessions or count visits.
export async function HEAD(
  request: NextRequest,
  context: { params: Promise<{ code: string }> },
) {
  const response = await GET(request, context);
  response.headers.delete("set-cookie");
  return new NextResponse(null, {
    status: response.status,
    headers: response.headers,
  });
}
