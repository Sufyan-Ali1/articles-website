import { describe, it, expect } from "vitest";
import { parseFilters, filterUrl } from "@/lib/utils/filters";
describe("URL filters", () => {
  it("uses safe defaults and rejects unsupported sorts and non-slug categories", () => {
    const result = parseFilters({
      page: "-5",
      sort: "password",
      category: "../admin",
      search: "  electric cars  ",
    });
    expect(result).toMatchObject({
      page: 1,
      sort: "-published_at",
      category: undefined,
      search: "electric cars",
      page_size: 12,
    });
  });
  it("preserves supported filters through pagination", () => {
    expect(
      filterUrl(
        "/articles",
        { search: "electric car", category: "automotive", sort: "-view_count" },
        2,
      ),
    ).toBe(
      "/articles?search=electric+car&category=automotive&sort=-view_count&page=2",
    );
  });
  it("does not forward unknown query parameters or array values", () => {
    const result = parseFilters({
      search: ["a", "b"],
      status: "draft",
      page_size: "1000",
      page: "100000",
    });
    expect(result).toMatchObject({ page: 1, search: undefined, page_size: 12 });
    expect(result).not.toHaveProperty("status");
  });
});
