import { revalidatePath, revalidateTag } from "next/cache";
import { revalidationSchema, validBearer } from "@/lib/api/revalidation";
const MAX_BODY = 16 * 1024;
export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  if (
    !process.env.NEXTJS_REVALIDATION_SECRET ||
    process.env.NEXTJS_REVALIDATION_SECRET.length < 32
  )
    return Response.json(
      { error: "Revalidation is not configured" },
      { status: 503, headers },
    );
  if (
    !validBearer(
      request.headers.get("authorization"),
      process.env.NEXTJS_REVALIDATION_SECRET,
    )
  )
    return Response.json({ error: "Unauthorized" }, { status: 401, headers });
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  )
    return Response.json({ error: "Expected JSON" }, { status: 415, headers });
  if (Number(request.headers.get("content-length")) > MAX_BODY)
    return Response.json(
      { error: "Payload too large" },
      { status: 413, headers },
    );
  const reader = request.body?.getReader();
  if (!reader)
    return Response.json(
      { error: "Missing payload" },
      { status: 400, headers },
    );
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY) {
        await reader.cancel();
        return Response.json(
          { error: "Payload too large" },
          { status: 413, headers },
        );
      }
      chunks.push(value);
    }
    const buffer = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      buffer.set(chunk, offset);
      offset += chunk.length;
    }
    const parsed = revalidationSchema.safeParse(
      JSON.parse(new TextDecoder().decode(buffer)),
    );
    if (!parsed.success)
      return Response.json(
        { error: "Invalid revalidation payload" },
        { status: 400, headers },
      );
    for (const tag of parsed.data.tags) revalidateTag(tag, { expire: 0 });
    // All backend events affect public classifications/listings; no category slugs are supplied.
    for (const tag of ["articles", "categories", "tags", "article-types"])
      revalidateTag(tag, { expire: 0 });
    revalidatePath("/");
    revalidatePath("/articles");
    revalidatePath("/search");
    revalidatePath("/categories");
    revalidatePath("/category/[slug]", "page");
    revalidatePath("/tag/[slug]", "page");
    revalidatePath("/sitemap.xml");
    for (const slug of parsed.data.slugs) revalidatePath(`/articles/${slug}`);
    if (!parsed.data.event.startsWith("article."))
      revalidatePath("/articles/[slug]", "page");
    return Response.json({ revalidated: true }, { headers });
  } catch (error) {
    if (error instanceof SyntaxError)
      return Response.json({ error: "Invalid JSON" }, { status: 400, headers });
    return Response.json(
      { error: "Revalidation failed" },
      { status: 500, headers },
    );
  }
}
