import { isIP } from "node:net";
import { NextRequest, NextResponse } from "next/server";
import { backendHeaders } from "@/lib/api/backend-auth";
import { configuredApiUrl } from "@/lib/security/urls";
import { readBoundedJson } from "@/lib/security/read-json";
import { requestOrigin } from "@/lib/analytics/session";
const allowed = new Set([
  "article-requests",
  "contact-messages",
  "subscriptions",
]);
const headers = { "Cache-Control": "private, no-store" };
const failure = (status: number, message: string) =>
  NextResponse.json({ error: { message } }, { status, headers });

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  if (path.length !== 1 || !allowed.has(path[0]) || request.nextUrl.search)
    return failure(404, "Endpoint not found");
  if (
    request.headers.get("origin") !== requestOrigin(request) ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    return failure(403, "Forbidden");
  if (
    request.headers.get("content-type")?.split(";", 1)[0] !== "application/json"
  )
    return failure(415, "Use JSON");
  let body: unknown;
  try {
    body = await readBoundedJson(
      new Response(request.body, { headers: request.headers }),
      65536,
    );
  } catch {
    return failure(400, "Invalid or oversized request");
  }
  if (!body || typeof body !== "object" || Array.isArray(body))
    return failure(422, "Invalid request");
  const api = configuredApiUrl(process.env.API_BASE_URL);
  if (!api) return failure(503, "Submission service is unavailable");
  try {
    const upstreamHeaders = {
      ...backendHeaders(),
      "Content-Type": "application/json",
    };
    // Only trust platform-owned IP headers on that platform. Never forward a
    // browser-provided X-Visitor-IP, X-API-Key, Authorization, or Cookie.
    const candidate =
      process.env.VERCEL === "1"
        ? request.headers.get("x-vercel-forwarded-for")
        : process.env.NETLIFY === "true"
          ? request.headers.get("x-nf-client-connection-ip")
          : null;
    if (candidate && isIP(candidate.trim()))
      Object.assign(upstreamHeaders, { "X-Visitor-IP": candidate.trim() });
    const response = await fetch(`${api}/api/v1/${path[0]}`, {
      method: "POST",
      headers: upstreamHeaders,
      body: JSON.stringify(body),
      credentials: "omit",
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(15000),
    });
    if (response.status === 429) {
      const result = failure(429, "Please try again later");
      const retry = response.headers.get("retry-after");
      result.headers.set(
        "Retry-After",
        retry && /^\d{1,6}$/.test(retry) ? retry : "60",
      );
      return result;
    }
    if (response.status === 422) {
      const payload = (await readBoundedJson(response, 65536)) as {
        error?: { details?: { location?: unknown; type?: unknown }[] };
      };
      const details = Array.isArray(payload?.error?.details)
        ? payload.error.details.slice(0, 30).map((issue) => ({
            location: Array.isArray(issue.location)
              ? issue.location
                  .filter(
                    (part) =>
                      typeof part === "string" || typeof part === "number",
                  )
                  .slice(0, 8)
              : [],
            type:
              typeof issue.type === "string"
                ? issue.type.slice(0, 100)
                : "value_error",
          }))
        : [];
      return NextResponse.json(
        { error: { message: "Please check your details", details } },
        { status: 422, headers },
      );
    }
    if (response.status !== 202)
      return failure(503, "Submission service is unavailable");
    const payload = (await readBoundedJson(response, 65536)) as {
      data?: { message?: unknown };
    };
    if (typeof payload?.data?.message !== "string")
      return failure(503, "Submission could not be confirmed");
    // Use fixed messages so an upstream diagnostic can never echo a secret.
    return NextResponse.json(
      {
        data: {
          message:
            path[0] === "subscriptions"
              ? "Thank you for subscribing."
              : path[0] === "contact-messages"
                ? "Thank you for getting in touch."
                : "Thank you for your suggestion.",
        },
      },
      { status: 202, headers },
    );
  } catch {
    return failure(503, "Submission service is unavailable");
  }
}
