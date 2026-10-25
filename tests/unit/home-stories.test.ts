import { describe, expect, it } from "vitest";
import { isGuideType, selectHomeStories } from "@/lib/utils/home-stories";
import type { ArticleSummary } from "@/types/api";

function story(index: number): ArticleSummary {
  return {
    id: String(index),
    slug: `story-${index}`,
    title: `Story ${index}`,
    excerpt: null,
    featured_image: null,
    featured_image_alt: null,
    author: null,
    article_type: null,
    categories: [],
    tags: [],
    is_featured: index < 4,
    view_count: 100 - index,
    published_at: "2026-10-20",
    created_at: "2026-10-20",
    updated_at: "2026-10-20",
  };
}
describe("homepage story selection", () => {
  it("keeps the hero and all story sections distinct, even with overlapping API collections", () => {
    const latest = Array.from({ length: 16 }, (_, index) => story(index));
    const selected = selectHomeStories({
      latest,
      featured: latest.slice(0, 4),
      guides: latest.slice(5, 12),
      popular: latest,
    });
    const all = [
      selected.hero!,
      ...selected.latest,
      ...selected.editors,
      ...selected.guides,
      ...selected.popular,
    ];
    expect(new Set(all.map((article) => article.slug)).size).toBe(all.length);
    expect(selected.hero?.slug).toBe("story-0");
    expect(selected.editors.every((article) => article.is_featured)).toBe(true);
    expect(selected.latest).toHaveLength(3);
    expect(selected.popular).toHaveLength(3);
  });
  it("reuses published stories in small catalogs and labels unfeatured editorial recommendations", () => {
    const latest = [story(1), story(2)];
    const selected = selectHomeStories({
      latest,
      featured: [],
      guides: [],
      popular: latest,
    });
    expect(selected.hero).toBe(latest[0]);
    expect(selected.latest).toEqual([latest[1], latest[0]]);
    expect(selected.editors).toHaveLength(2);
    expect(selected.editorsAreFeatured).toBe(false);
  });
  it("keeps all three sections populated with only three comparison articles and no featured articles", () => {
    const latest = [story(1), story(2), story(3)].map((article) => ({
      ...article,
      is_featured: false,
    }));
    const popular = [latest[2], latest[0], latest[1]];
    const selected = selectHomeStories({
      latest,
      featured: [],
      guides: latest,
      popular,
    });
    expect(selected.editors).toHaveLength(3);
    expect(selected.guides).toHaveLength(3);
    expect(selected.popular).toEqual(popular);
    expect(selected.editorsAreFeatured).toBe(false);
    for (const section of [
      selected.latest,
      selected.editors,
      selected.guides,
      selected.popular,
    ]) {
      expect(new Set(section.map((article) => article.slug)).size).toBe(
        section.length,
      );
    }
  });
  it("can reuse the only featured article in editor picks without losing it to the hero", () => {
    const featured = [story(1)];
    const selected = selectHomeStories({
      latest: featured,
      featured,
      guides: featured,
      popular: featured,
    });
    expect(selected.hero).toBe(featured[0]);
    expect(selected.editors).toEqual(featured);
    expect(selected.editorsAreFeatured).toBe(true);
  });
  it("includes comparison and how-to formats in reviews and guides", () => {
    expect(isGuideType({ name: "Comparison", slug: "comparison" })).toBe(true);
    expect(isGuideType({ name: "How to", slug: "how-to" })).toBe(true);
    expect(isGuideType({ name: "News", slug: "news" })).toBe(false);
  });
  it("handles empty collections and excludes unread stories from the popular section", () => {
    const selected = selectHomeStories({
      latest: [],
      featured: [],
      guides: [],
      popular: [{ ...story(1), view_count: 0 }],
    });
    expect(selected.hero).toBeUndefined();
    expect(selected.latest).toEqual([]);
    expect(selected.editors).toEqual([]);
    expect(selected.guides).toEqual([]);
    expect(selected.popular).toEqual([]);
  });
});
