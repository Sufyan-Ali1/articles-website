import { NextResponse, type NextRequest } from "next/server";
import { backendHeaders } from "@/lib/api/backend-auth";
import { configuredApiUrl } from "@/lib/security/urls";
import { readBoundedJson } from "@/lib/security/read-json";
import { MetaSchema, ClassificationResponseSchema } from "@/lib/api/schemas";
import { parseFilters, type SearchParams } from "@/lib/utils/filters";

function missing(request: NextRequest) {
  // Rewrite to an unmatched route to reuse the normal recovery UI. The status
  // is decided before PPR/Suspense can commit a 200 response.
  const response = NextResponse.rewrite(
    new URL("/__missing-content", request.url),
    { status: 404 },
  );
  response.headers.set("X-Robots-Tag", "noindex");
  response.headers.set("Cache-Control", "no-store");
  return response;
}

async function inspect(path: string) {
  const origin = configuredApiUrl(process.env.API_BASE_URL);
  if (!origin) return null;
  return fetch(`${origin}/api/v1/${path}`, {
    headers: backendHeaders(),
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(15000),
  });
}

export async function proxy(request: NextRequest) {
  if (!["GET", "HEAD"].includes(request.method)) return NextResponse.next();
  const match = /^\/(articles|category)\/([^/]+)$/.exec(
    request.nextUrl.pathname,
  );
  const article = match?.[1] === "articles";
  const category = match?.[1] === "category" ? match[2] : undefined;
  try {
    if (match) {
      const slug = match[2];
      if (
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
        slug.length > (article ? 350 : 180)
      )
        return missing(request);
      const response = await inspect(
        `${article ? "articles" : "categories"}/${encodeURIComponent(slug)}`,
      );
      if (response?.status === 404 || response?.status === 410) {
        await response.body?.cancel();
        return missing(request);
      }
      if (response?.ok && category) {
        const body = (await readBoundedJson(response, 256 * 1024)) as {
          data?: unknown;
        };
        const item = ClassificationResponseSchema.safeParse(body.data);
        if (item.success && !item.data.is_active) return missing(request);
      } else {
        // Article existence needs only the status, not another full body read.
        await response?.body?.cancel();
      }
    }
    if (!article) {
      const params: SearchParams = {};
      for (const key of request.nextUrl.searchParams.keys()) {
        const values = request.nextUrl.searchParams.getAll(key);
        params[key] = values.length === 1 ? values[0] : values;
      }
      const filters = {
        ...parseFilters(params),
        ...(category ? { category } : {}),
      };
      if ((filters.page || 1) > 1) {
        // Fetch one summary to obtain the total, rather than a full archive.
        const query = new URLSearchParams(
          Object.entries({ ...filters, page: 1, page_size: 1 })
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)]),
        );
        const response = await inspect(`articles?${query}`);
        if (response?.ok) {
          const body = (await readBoundedJson(response, 256 * 1024)) as {
            meta?: unknown;
          };
          const meta = MetaSchema.safeParse(body.meta);
          if (
            meta.success &&
            filters.page! > Math.max(1, Math.ceil(meta.data.total / 12))
          )
            return missing(request);
        } else {
          await response?.body?.cancel();
        }
      }
    }
  } catch {
    // A timeout/configuration/upstream failure does not prove content is missing.
    // Let the route's normal error/recovery handling resolve it.
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/articles", "/articles/:slug", "/category/:slug"],
};
