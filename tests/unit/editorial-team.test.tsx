import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ArticleResponse } from "@/types/api";
vi.mock("@/lib/config", () => ({ site: { url: "https://askandexplore.com" } }));
import {
  editorialTeam,
  isEditorialTeam,
  latestTeamArticles,
} from "@/lib/content/editorial-team";
import {
  editorialArticleSchema,
  editorialOrganization,
  editorialProfileSchema,
} from "@/lib/seo/editorial-team";
import { AuthorName } from "@/components/authors/author-name";

const article = (n = 1): ArticleResponse =>
  ({
    id: String(n),
    slug: `story-${n}`,
    title: `Story ${n}`,
    author: { id: "team", name: editorialTeam.name },
    published_at: `2026-10-${String(n).padStart(2, "0")}T09:00:00Z`,
    updated_at: "2026-10-30T09:00:00Z",
    schema: null,
  }) as ArticleResponse;

describe("editorial team identity", () => {
  it("matches only explicit team attribution and links it", () => {
    expect(isEditorialTeam(null)).toBe(false);
    expect(isEditorialTeam({ id: "other", name: "An Editor" })).toBe(false);
    render(
      <AuthorName author={{ id: "team", name: ` ${editorialTeam.name} ` }} />,
    );
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      editorialTeam.path,
    );
  });
  it("filters the whole collection before selecting six newest records", () => {
    const items = Array.from({ length: 9 }, (_, i) => article(i + 1));
    items.push({ ...article(20), author: null });
    expect(latestTeamArticles(items).map((a) => a.id)).toEqual([
      "9",
      "8",
      "7",
      "6",
      "5",
      "4",
    ]);
    expect(items[0].id).toBe("1");
    expect(latestTeamArticles([])).toEqual([]);
  });
  it("uses one organization for the profile and fallback article", () => {
    expect(editorialProfileSchema()).toBeNull();
    expect(editorialArticleSchema(article())).toMatchObject({
      "@type": "BlogPosting",
      author: editorialOrganization(),
    });
  });
  it("normalizes top-level and graph authors without mutating backend data", () => {
    const source = {
      "@type": "Article",
      headline: "Story 1",
      url: "https://old.example",
      author: { name: "Old" },
    };
    expect(
      editorialArticleSchema({ ...article(), schema: source }),
    ).toMatchObject({ author: editorialOrganization() });
    const schema = {
      "@graph": [
        source,
        { "@type": "Organization", name: "Publisher" },
        {
          "@type": "Article",
          url: "https://other.example",
          author: { name: "Other" },
        },
      ],
    };
    const result = editorialArticleSchema({
      ...article(),
      schema,
    }) as typeof schema;
    expect(result["@graph"][0]).toMatchObject({
      author: editorialOrganization(),
    });
    expect(result["@graph"].slice(1)).toEqual(schema["@graph"].slice(1));
    expect(source.author.name).toBe("Old");
    expect(editorialArticleSchema({ ...article(), author: null, schema })).toBe(
      schema,
    );
  });
});
