import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import type { ArticleResponse } from "@/types/api";
vi.mock("@/lib/config", () => ({
  site: { name: "Ask & Explore", url: "https://askandexplore.com" },
  imageHosts: [],
}));
import { selectRelatedArticles } from "@/lib/utils/related-articles";
import { optimizedImage } from "@/components/articles/article-card";
import { ArticleImage } from "@/components/articles/article-image";

const topic = (id: string) => ({
  id,
  name: id,
  slug: id,
  description: null,
  is_active: true,
  created_at: "2026-10-01",
  updated_at: "2026-10-02",
  parent_id: null,
});
const article: ArticleResponse = {
  id: "article-1",
  slug: "electric-car-costs",
  title: "Electric car ownership costs",
  excerpt: "Compare ownership costs.",
  featured_image: "https://res.cloudinary.com/k4ncios2/image/upload/v1/car.png",
  featured_image_alt: "An electric car",
  author: { id: "author-1", name: "Visible Author" },
  categories: [topic("automotive")],
  tags: [topic("electric-cars")],
  article_type: null,
  is_featured: false,
  view_count: 0,
  published_at: "2026-10-01T09:00:00Z",
  created_at: "2026-10-01T09:00:00Z",
  updated_at: "2026-10-02T09:00:00Z",
  content_html: "<p>Article content.</p>",
  meta_title: null,
  meta_description: null,
  schema: {
    "@graph": [
      {
        "@type": "BlogPosting",
        author: { name: "WRONG_AUTHOR" },
        url: "https://yourdomain.com",
      },
    ],
  },
};

describe("SEO output boundaries", () => {
  it("rejects unrelated recent articles and prefers shared specific tags", () => {
    const related = {
      ...article,
      id: "2",
      slug: "charging-guide",
      title: "Charging at home",
    };
    const unrelated = {
      ...article,
      id: "3",
      slug: "flight-guide",
      title: "Finding cheap flights",
      tags: [],
      categories: [topic("travel")],
    };
    const broadCategoryOnly = {
      ...article,
      id: "4",
      slug: "dashboard-guide",
      title: "Dashboard warning signals",
      tags: [],
    };
    expect(
      selectRelatedArticles(article, [
        article,
        unrelated,
        broadCategoryOnly,
        related,
        related,
      ]),
    ).toEqual([related]);
    expect(selectRelatedArticles(article, [unrelated])).toEqual([]);
  });

  it("generates responsive optimized URLs for publication images without allowing other accounts", () => {
    expect(optimizedImage(article.featured_image)).toBe(true);
    expect(
      optimizedImage(
        "https://res.cloudinary.com/other-account/image/upload/file.png",
      ),
    ).toBe(false);
    expect(
      optimizedImage(
        "https://res.cloudinary.com.attacker.test/k4ncios2/image/upload/file.png",
      ),
    ).toBe(false);
    const { container } = render(
      <ArticleImage
        src={article.featured_image}
        alt="Electric car"
        optimized={optimizedImage(article.featured_image)}
        sizes="720px"
      />,
    );
    expect(container.querySelector("img")).toHaveAttribute(
      "srcset",
      expect.stringContaining("/_next/image?url="),
    );
    expect(container.querySelector("img")).toHaveAttribute("sizes", "720px");
  });
});
