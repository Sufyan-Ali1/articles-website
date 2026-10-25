import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ArticleImage } from "@/components/articles/article-image";

describe("article image recovery", () => {
  it("uses decorative local artwork when the article has no image", () => {
    const { container } = render(
      <ArticleImage src={null} alt="A useful guide" />,
    );
    const fallback = container.querySelector(".image-fallback img");
    expect(fallback).toHaveAttribute("alt", "");
    expect(fallback?.getAttribute("src")).toContain("article-fallback");
    expect(fallback).toHaveStyle({ objectFit: "contain" });
    expect(container.querySelector(".article-image")).toHaveStyle({
      aspectRatio: "16 / 9",
    });
  });

  it("recovers a broken image and can show a new article image afterward", () => {
    const { container, rerender } = render(
      <ArticleImage
        src="https://images.test/broken.jpg"
        alt="Original article"
      />,
    );
    fireEvent.error(screen.getByAltText("Original article"));
    expect(container.querySelector(".image-fallback img")).toBeInTheDocument();
    rerender(
      <ArticleImage
        src="https://images.test/replacement.jpg"
        alt="Replacement article"
      />,
    );
    expect(screen.getByAltText("Replacement article")).toHaveAttribute(
      "src",
      "https://images.test/replacement.jpg",
    );
    expect(container.querySelector(".image-fallback")).not.toBeInTheDocument();
  });
});
