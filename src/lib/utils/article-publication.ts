// The public API exposes publication time, not draft/admin status fields.
export function isPublishedArticle(article: { published_at: string | null }) {
  const date = Date.parse(article.published_at || "");
  return Number.isFinite(date) && date <= Date.now();
}
