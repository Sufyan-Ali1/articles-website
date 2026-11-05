import type { ArticleSummary, AuthorResponse } from "@/types/api";

export const editorialTeam = {
  name: "Ask & Explore Editorial Team",
  role: "Editorial Team at Ask & Explore",
  path: "/authors/editorial-team",
  logo: "/images/brand/ae-mark.svg",
  description:
    "The editorial identity for team-attributed guides and explainers at Ask & Explore, covering technology, automotive, buying guides, lifestyle, digital safety, and travel.",
};

export function isEditorialTeam(author: AuthorResponse | null) {
  return author?.name.trim() === editorialTeam.name;
}

export function latestTeamArticles(articles: ArticleSummary[]) {
  return articles
    .filter((article) => isEditorialTeam(article.author))
    .sort(
      (a, b) =>
        (Date.parse(b.published_at || "") || 0) -
        (Date.parse(a.published_at || "") || 0),
    )
    .slice(0, 6);
}
