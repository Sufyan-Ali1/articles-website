import { describe, expect, it } from "vitest";
import type { ArticleSummary } from "@/types/api";
import {
  matchesSearchTopics,
  parseSearchTopics,
  selectedSearchTopics,
} from "@/lib/utils/search-topics";
import { filterUrl, parseFilters } from "@/lib/utils/filters";

const article = {
  categories: [
    { name: "Technology", slug: "technology", is_active: true },
    { name: "Travel", slug: "travel", is_active: false },
  ],
  article_type: {
    name: "Buying guides",
    slug: "buying-guide",
    is_active: true,
  },
} as ArticleSummary;

describe("search topics", () => {
  it("normalizes repeated and comma-separated selections and rejects unknown topics", () => {
    expect(
      parseSearchTopics(["travel,technology", "travel", "../admin"]),
    ).toEqual(["technology", "travel"]);
    expect(parseSearchTopics("unknown")).toBeUndefined();
    expect(parseSearchTopics("travel,all")).toEqual(["all"]);
  });
  it("matches any selected topic, handles buying-guide formats, and excludes inactive classifications", () => {
    expect(matchesSearchTopics(article, ["automotive", "technology"])).toBe(
      true,
    );
    expect(matchesSearchTopics(article, ["buying-guides"])).toBe(true);
    expect(matchesSearchTopics(article, ["travel"])).toBe(false);
    expect(matchesSearchTopics(article, ["all"])).toBe(true);
  });
  it("preserves topic selections alongside queries, sorting, pagination and layout", () => {
    const filters = parseFilters({
      topics: ["travel", "technology"],
      search: "laptop",
      sort: "title",
      page: "2",
    });
    const url = new URL(
      filterUrl("/search", filters, undefined, "list"),
      "https://example.test",
    );
    expect(url.searchParams.get("topics")).toBe("technology,travel");
    expect(url.searchParams.get("search")).toBe("laptop");
    expect(url.searchParams.get("page")).toBe("2");
    expect(url.searchParams.get("sort")).toBe("title");
    expect(url.searchParams.get("view")).toBe("list");
    expect(
      selectedSearchTopics({
        category: "technology",
        article_type: "buying-guide",
      }),
    ).toEqual(["technology", "buying-guides"]);
  });
});
