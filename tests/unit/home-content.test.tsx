import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import type { ArticleSummary, ClassificationResponse } from "@/types/api";

vi.mock("next/server", () => ({
  connection: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/lib/api/client", () => ({
  getArticles: vi.fn(),
  getClassifications: vi.fn(),
}));

import { getArticles, getClassifications } from "@/lib/api/client";
import { HomeContent } from "@/components/home/home-content";

const comparison: ClassificationResponse = {
  id: "comparison",
  name: "Comparison",
  slug: "comparison",
  description: null,
  is_active: true,
  created_at: "2026-01-01",
  updated_at: "2026-01-01",
};
const articles: ArticleSummary[] = [
  "seo-guide",
  "everyday-choice",
  "laptop-comparison",
].map((slug, index) => ({
  id: slug,
  slug,
  title: slug.replaceAll("-", " "),
  excerpt: null,
  featured_image: null,
  featured_image_alt: null,
  author: null,
  article_type: comparison,
  categories: [],
  tags: [],
  is_featured: false,
  view_count: [6, 5, 19][index],
  published_at: "2026-10-01",
  created_at: "2026-10-01",
  updated_at: "2026-10-01",
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getArticles).mockImplementation(async (filters = {}) => {
    const data = filters.is_featured
      ? []
      : filters.sort === "-view_count"
        ? [...articles].sort((a, b) => b.view_count - a.view_count)
        : articles;
    return {
      data,
      meta: {
        page: 1,
        pages: data.length ? 1 : 0,
        page_size: 24,
        total: data.length,
      },
    };
  });
  vi.mocked(getClassifications).mockImplementation(async (collection) =>
    collection === "article-types" ? [comparison] : [],
  );
});

describe("homepage section visibility", () => {
  it("renders editor recommendations, popular stories, and guides with the current three-comparison catalog", async () => {
    render(await HomeContent());
    for (const name of [
      "Editor's Picks",
      "Popular articles",
      "Reviews & Guides",
    ]) {
      const section = screen.getByRole("region", { name });
      expect(section).toBeVisible();
      expect(section.querySelectorAll("[data-home-story]")).toHaveLength(3);
    }
    const editors = screen.getByRole("region", {
      name: "Editor's Picks",
    });
    expect(within(editors).getByText("Explore next")).toBeVisible();
    expect(
      within(editors).queryByText("Editor’s pick", { exact: true }),
    ).not.toBeInTheDocument();
    expect(within(editors).getByText(/next featured selections/)).toBeVisible();
    const popular = screen.getByRole("region", { name: "Popular articles" });
    expect(popular.querySelector("[data-home-story]")).toHaveAttribute(
      "data-home-story",
      "laptop-comparison",
    );
    expect(getArticles).toHaveBeenCalledWith({
      article_type: "comparison",
      page_size: 6,
    });
  });

  it("keeps all three sections visible with honest empty states when the catalog is empty", async () => {
    vi.mocked(getArticles).mockResolvedValue({
      data: [],
      meta: { page: 1, pages: 0, total: 0, page_size: 24 },
    });
    render(await HomeContent());
    for (const name of [
      "Editor's Picks",
      "Popular articles",
      "Reviews & Guides",
    ]) {
      const section = screen.getByRole("region", { name });
      expect(section).toBeVisible();
      expect(section.querySelectorAll("[data-home-story]")).toHaveLength(0);
      expect(
        within(section).getByRole("link", {
          name: "Explore published articles",
        }),
      ).toBeVisible();
    }
  });

  it("uses embedded comparison types when the classification directory is unavailable", async () => {
    vi.mocked(getClassifications).mockRejectedValue(
      new Error("Directory unavailable"),
    );
    render(await HomeContent());
    expect(
      screen
        .getByRole("region", { name: "Reviews & Guides" })
        .querySelectorAll("[data-home-story]"),
    ).toHaveLength(3);
  });
});
