import { createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";
const slug = z
  .string()
  .min(1)
  .max(350)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const uuid = z.string().uuid();
export const revalidationSchema = z
  .object({
    event: z.enum([
      "article.update",
      "article.publish",
      "article.unpublish",
      "article.delete",
      "classification.create",
      "classification.update",
      "classification.delete",
      "user.update",
    ]),
    entity_id: uuid,
    article_id: uuid.nullable(),
    slugs: z.array(slug).max(8),
    tags: z.array(z.string().min(1).max(256)).max(32),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (
      value.event.startsWith("article.")
        ? value.article_id !== value.entity_id
        : value.article_id !== null
    )
      ctx.addIssue({ code: "custom", message: "Invalid article identity" });
    const allowed = new Set([
      "articles",
      "categories",
      "tags",
      "article-types",
      ...(value.article_id ? [`article:${value.article_id}`] : []),
      ...value.slugs.map(articleSlugTag),
    ]);
    if (value.tags.some((tag) => !allowed.has(tag)))
      ctx.addIssue({ code: "custom", message: "Unsupported cache tag" });
  });
export function articleSlugTag(slug: string) {
  return slug.length <= 248
    ? `article:${slug}`
    : `article-slug-sha256:${createHash("sha256").update(slug).digest("hex")}`;
}
export function validBearer(header: string | null, secret: string | undefined) {
  if (
    !secret ||
    secret.length < 32 ||
    !header?.startsWith("Bearer ") ||
    header.length > 1024
  )
    return false;
  const hash = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(hash(header.slice(7)), hash(secret));
}
