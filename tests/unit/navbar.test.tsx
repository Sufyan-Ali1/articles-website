import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const route = vi.hoisted(() => ({ path: "/", query: "" }));
vi.mock("next/navigation", () => ({
  usePathname: () => route.path,
  useSearchParams: () => new URLSearchParams(route.query),
}));
import {
  DesktopNavigation,
  NavLink,
} from "@/components/layout/desktop-navigation";

beforeEach(() => {
  route.path = "/";
  route.query = "";
});
describe("shared navigation", () => {
  it("marks the matching category and article format active", () => {
    route.path = "/category/technology";
    const { rerender } = render(
      <NavLink href="/category/technology">Technology</NavLink>,
    );
    expect(screen.getByRole("link", { name: "Technology" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    route.path = "/articles";
    route.query = "article_type=review";
    rerender(<NavLink href="/articles?article_type=review">Reviews</NavLink>);
    expect(screen.getByRole("link", { name: "Reviews" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    route.query = "article_type=buying-guide";
    rerender(<NavLink href="/articles?article_type=review">Reviews</NavLink>);
    expect(screen.getByRole("link", { name: "Reviews" })).not.toHaveAttribute(
      "aria-current",
    );
  });
  it("shows the four main destinations and closes the categories dropdown with Escape", async () => {
    route.path = "/category/technology";
    render(
      <DesktopNavigation>
        <NavLink href="/category/technology">Technology</NavLink>
        <NavLink href="/categories">Explore all categories</NavLink>
      </DesktopNavigation>,
    );
    expect(screen.getByRole("link", { name: "Home" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Articles" })).toBeVisible();
    expect(screen.getByRole("link", { name: "About" })).toBeVisible();
    const categories = screen.getByRole("button", {
      name: "Categories",
    });
    expect(categories).toHaveClass("nav-active");
    await userEvent.click(categories);
    expect(screen.getByRole("link", { name: "Technology" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await userEvent.keyboard("{Escape}");
    expect(
      screen.queryByRole("link", { name: "Technology" }),
    ).not.toBeInTheDocument();
    expect(categories).toHaveFocus();
  });
});
