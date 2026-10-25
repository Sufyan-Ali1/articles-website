import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { filterUrl, parseFilters } from "@/lib/utils/filters";
import { prepareArticle } from "@/lib/utils/article-html";
import { CategoryDirectory } from "@/components/categories/category-directory";
import type { CategoryResponse } from "@/types/api";
const categories: CategoryResponse[] = [
  {
    id: "a",
    name: "Technology",
    slug: "technology",
    description: null,
    is_active: true,
    parent_id: null,
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
  },
  {
    id: "b",
    name: "Everyday tech",
    slug: "everyday-tech",
    description: "Practical guides",
    is_active: true,
    parent_id: "a",
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
  },
];
describe("discovery and reading refinements", () => {
  it("preserves a frontend-only view across pagination without adding it to API filters", () => {
    expect(filterUrl("/articles", { category: "technology" }, 2, "list")).toBe(
      "/articles?category=technology&view=list&page=2",
    );
    expect(parseFilters({ view: "list" })).not.toHaveProperty("view");
  });
  it("searches nested categories and restores the root directory", async () => {
    render(<CategoryDirectory categories={categories} previews={{}} />);
    const input = screen.getByRole("searchbox", { name: "Search categories" });
    await userEvent.type(input, "everyday");
    expect(
      screen.getByRole("heading", { name: "Everyday tech" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: "Technology" }),
    ).not.toBeInTheDocument();
    await userEvent.clear(input);
    expect(screen.getByRole("heading", { name: "Technology" })).toBeVisible();
  });
  it("shows real totals and searches categories without redundant filter controls", async () => {
    const user = userEvent.setup();
    const automotive = {
      ...categories[0],
      id: "c",
      name: "Automotive",
      slug: "automotive",
    };
    const inactive = {
      ...categories[0],
      id: "d",
      name: "Archived topic",
      slug: "archived",
      is_active: false,
    };
    render(
      <CategoryDirectory
        categories={[...categories, automotive, inactive]}
        previews={{}}
        counts={{ a: 6, c: 0 }}
      />,
    );
    expect(screen.getByText("6 articles")).toBeVisible();
    expect(screen.getByText("0 articles")).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: "Archived topic" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("group", { name: "Filter categories" }),
    ).not.toBeInTheDocument();
    const search = screen.getByRole("searchbox", { name: "Search categories" });
    await user.type(search, "automotive");
    expect(screen.getByRole("heading", { name: "Automotive" })).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: "Technology" }),
    ).not.toBeInTheDocument();
    await user.clear(search);
    await user.type(search, "no-matching-category");
    expect(
      screen.getByRole("heading", { name: "No categories match your search." }),
    ).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: "Show all categories" }),
    );
    expect(search).toHaveValue("");
    expect(screen.getByRole("heading", { name: "Automotive" })).toBeVisible();
  });
  it("wraps code in an accessible copy toolbar without altering the code", () => {
    const result = prepareArticle(
      '<pre><code class="language-js">const value = &quot;&lt;hello&gt;&quot;;</code></pre>',
    );
    const document = new DOMParser().parseFromString(result.html, "text/html");
    expect(document.querySelector("code")?.textContent).toBe(
      'const value = "<hello>";',
    );
    expect(
      document.querySelector("[data-copy-code]")?.hasAttribute("disabled"),
    ).toBe(true);
  });
});
