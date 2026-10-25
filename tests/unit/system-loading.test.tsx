import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Loading from "@/app/loading";

describe("global loading state", () => {
  it("announces loading while keeping decorative placeholders out of navigation", () => {
    render(<Loading />);
    expect(
      screen.getByRole("status", { name: "Loading page" }),
    ).toHaveAttribute("aria-busy", "true");
    expect(
      screen.getByText("Loading your next discovery. Please wait."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });
});
