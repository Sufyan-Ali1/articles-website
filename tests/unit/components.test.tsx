import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Pagination } from "@/components/articles/pagination";
import { Filters } from "@/components/search/filters";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { metadata } from "@/lib/seo/metadata";
import userEvent from "@testing-library/user-event";
describe("navigation and SEO", () => {
  it("preserves category filters in accessible pagination", () => {
    render(
      <Pagination
        path="/articles"
        filters={{ category: "technology" }}
        meta={{ page: 2, page_size: 12, total: 30, pages: 3 }}
      />,
    );
    expect(screen.getByRole("link", { name: "Page 2" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: /next/i })).toHaveAttribute(
      "href",
      "/articles?category=technology&page=3",
    );
  });
  it("omits pagination when unnecessary", () => {
    const { container } = render(
      <Pagination
        path="/articles"
        filters={{}}
        meta={{ page: 1, page_size: 12, total: 0, pages: 0 }}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
  it("uses a GET form without carrying forward a stale page number", () => {
    render(
      <Filters
        filters={{ page: 5, sort: "-view_count" }}
        categories={[]}
        types={[]}
      />,
    );
    expect(screen.getByRole("search")).toHaveAttribute("action", "/articles");
    expect(screen.getByLabelText("Sort articles")).toHaveValue("-view_count");
    expect(document.querySelector('input[name="page"]')).toBeNull();
  });
  it("opens and closes accessible mobile navigation", async () => {
    render(
      <MobileMenu categories={[{ name: "Technology", slug: "technology" }]} />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Open navigation" }),
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Technology" })).toHaveAttribute(
      "href",
      "/category/technology",
    );
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("builds canonical, article, and social metadata", () => {
    const result = metadata("A title", "A description", "/articles/a-title", {
      article: true,
      published: "2026-10-01T00:00:00Z",
      image: "https://images.test/a.jpg",
    });
    expect(result.alternates?.canonical).toBe(
      "http://localhost:3000/articles/a-title",
    );
    expect(result.openGraph).toMatchObject({
      type: "article",
      publishedTime: "2026-10-01T00:00:00Z",
    });
    expect(result.twitter).toMatchObject({ card: "summary_large_image" });
  });
});
