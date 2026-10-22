import { describe, it, expect } from "vitest";
import { prepareArticle } from "@/lib/utils/article-html";
import { safeJsonLd } from "@/lib/seo/metadata";
describe("article HTML", () => {
  it("adds stable unique heading anchors and an accessible table wrapper", () => {
    const result = prepareArticle(
      "<h1>Start here</h1><h2>A &amp; B</h2><h3>A &amp; B</h3><table><tr><th>Thing</th></tr></table>",
    );
    expect(result.headings).toEqual([
      { id: "start-here", text: "Start here", level: 2 },
      { id: "a-b", text: "A & B", level: 2 },
      { id: "a-b-2", text: "A & B", level: 3 },
    ]);
    expect(result.html).toContain('class="table-scroll"');
    expect(result.html).toContain('aria-label="Article table"');
    expect(result.html).not.toContain("<h1");
  });
  it("preserves code and sponsored links, hardens blank targets, and rejects executable URLs", () => {
    const result = prepareArticle(
      '<a href="https://shop.example" rel="sponsored nofollow" target="_blank">Shop</a><a href="javascript:bad()">Bad</a><pre><code class="language-js">const x = 1;</code></pre><script>bad()</script><img src="/media/a.jpg" onerror="bad()">',
      "https://api.example",
    );
    expect(result.sponsored).toBe(true);
    expect(result.html).toContain("noopener");
    expect(result.html).toContain("language-js");
    expect(result.html).not.toContain("javascript:");
    expect(result.html).not.toContain("onerror");
    expect(result.html).not.toContain("bad()");
    expect(result.html).toContain('src="https://api.example/media/a.jpg"');
  });
  it("estimates body reading time and handles an empty body", () => {
    expect(prepareArticle(`<p>${"word ".repeat(441)}</p>`).readingMinutes).toBe(
      3,
    );
    expect(prepareArticle("").readingMinutes).toBe(1);
  });
  it("escapes script termination in backend JSON-LD", () => {
    expect(
      safeJsonLd({ headline: "</script><script>alert(1)</script>" }),
    ).not.toContain("<");
    expect(JSON.parse(safeJsonLd({ headline: "a < b" })).headline).toBe(
      "a < b",
    );
  });
});
