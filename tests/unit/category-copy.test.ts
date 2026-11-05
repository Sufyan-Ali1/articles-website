import { describe, expect, it } from "vitest";
import { classificationCopy } from "@/lib/content/site-copy";
import { categoryPresentation } from "@/components/categories/category-presentation";

describe("category descriptions", () => {
  const digitalSafety = { name: "Digital Safety", slug: "digital-safety" };

  it("preserves a non-empty backend description", () => {
    expect(
      classificationCopy(
        {
          ...digitalSafety,
          description: "Backend-owned category description.",
        },
        "category",
      ).description,
    ).toBe("Backend-owned category description.");
  });

  it.each([null, "", "   "])(
    "uses digital safety copy when the backend description is %j",
    (description) => {
      const copy = classificationCopy(
        { ...digitalSafety, description },
        "category",
      );
      expect(copy.description).toContain("account security");
      expect(copy.description).not.toContain("device comparisons");
      expect(categoryPresentation(digitalSafety).description).toContain(
        "phishing scams",
      );
    },
  );

  it("retains technology copy for technology categories", () => {
    const technology = {
      name: "Technology",
      slug: "technology",
      description: null,
    };
    expect(classificationCopy(technology, "category").description).toContain(
      "device comparisons",
    );
    expect(categoryPresentation(technology).description).toContain(
      "Laptop and device comparisons",
    );
  });
});
