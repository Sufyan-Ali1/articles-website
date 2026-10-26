import { describe, expect, it } from "vitest";
import { prepareArticle } from "@/lib/utils/article-html";
import {
  articleUrl,
  configuredApiUrl,
  exactImageHosts,
  safeHttpUrl,
} from "@/lib/security/urls";
import { securityHeaders } from "@/lib/security/headers";
import { readBoundedJson } from "@/lib/security/read-json";

describe("rich-text trust boundary", () => {
  it.each([
    '<base href="https://attacker.test/"><meta http-equiv="refresh" content="0;url=https://attacker.test"><link rel="stylesheet" href="https://attacker.test/style.css">',
    '<img src="https://images.test/photo.jpg" srcset="https://attacker.test/track 2x" onerror="alert(1)"><button formaction="https://attacker.test/">Send</button><input name="password">',
    '<svg><foreignObject><iframe srcdoc="<script>alert(1)</script>"></iframe></foreignObject></svg><math><mtext><img src=x onerror=alert(1)></mtext></math>',
    "<xmp><img src=x onerror=alert(1)></xmp><textarea><script>alert(1)</script></textarea><template><script>alert(1)</script></template>",
    '<a href="javascript&#0000058;alert(1)" onclick="alert(1)">click</a><img src="data:image/svg+xml,evil"><a href="/\\attacker.test">trick</a>',
  ])("discards active markup and unsafe attributes: %s", (payload) => {
    const output = prepareArticle(payload).html;
    const doc = document.implementation.createHTMLDocument();
    doc.body.innerHTML = output;
    expect(
      doc.querySelector(
        "base,meta,link,script,style,iframe,object,embed,svg,math,form,button,input,textarea,template",
      ),
    ).toBeNull();
    for (const node of doc.querySelectorAll("*")) {
      for (const attr of node.attributes) {
        expect(attr.name).not.toMatch(
          /^(on|style$|srcset$|srcdoc$|formaction$)/i,
        );
        if (["href", "src"].includes(attr.name))
          expect(attr.value).toMatch(/^(https?:\/\/|\/(?![\\/])|#)/);
      }
    }
  });

  it("preserves the publication’s safe rich-text features and creates non-clobbering headings", () => {
    const output = prepareArticle(
      '<h2 id="override">Article content</h2><h2>A</h2><h2>A-2</h2><h2>A</h2><p class="hidden" data-copy-code="1">Body</p><details><summary>More</summary>Useful detail</details><a href="https://shop.test/" rel="SPONSORED nofollow" target="_blank">Shop</a><pre><code class="language-js unsafe">const x = 1;</code></pre>',
    ).html;
    const doc = document.implementation.createHTMLDocument();
    doc.body.innerHTML = output;
    const ids = [...doc.querySelectorAll("h2")].map((node) => node.id);
    expect(ids).not.toContain("article-content");
    expect(new Set(ids).size).toBe(ids.length);
    expect(doc.querySelector("p")?.getAttributeNames()).toEqual([]);
    expect(doc.querySelector("code")?.className).toBe("language-js");
    expect(doc.querySelector("details summary")?.textContent).toBe("More");
    expect(doc.querySelector("a")?.rel).toContain("noopener");
    expect(doc.querySelector("a")?.rel).toContain("sponsored");
  });
});

describe("URLs and security configuration", () => {
  it.each([
    "javascript:alert(1)",
    "https://user:password@images.test/a",
    "https://images.test/a\n",
    "http:\\attacker.test",
    "https://images.test/a b",
    "data:image/png,evil",
  ])("rejects ambiguous or unsafe resource URLs: %s", (value) => {
    expect(safeHttpUrl(value)).toBeNull();
  });
  it("allows ordinary web URLs, local article paths and section anchors", () => {
    expect(safeHttpUrl("https://images.test/a.webp?q=75")).toBe(
      "https://images.test/a.webp?q=75",
    );
    expect(articleUrl("/media/a.webp", "https://api.test")).toBe(
      "https://api.test/media/a.webp",
    );
    expect(articleUrl("#section", undefined, true)).toBe("#section");
    expect(articleUrl("//attacker.test/a")).toBeNull();
  });
  it.each([
    "https://key:secret@api.test",
    "https://api.test?token=secret",
    "https://api.test/#secret",
    "https://api.test/api/v1",
    "http://public-api.test",
  ])("does not serialize unsafe API configuration: %s", (value) => {
    expect(configuredApiUrl(value)).toBe("");
  });
  it("allows HTTPS deployment prefixes and explicit loopback development endpoints", () => {
    expect(configuredApiUrl("https://api.test/backend/")).toBe(
      "https://api.test/backend",
    );
    expect(configuredApiUrl("http://127.0.0.1:4100")).toBe(
      "http://127.0.0.1:4100",
    );
    expect(exactImageHosts("Images.Test, images.test")).toEqual([
      "images.test",
    ]);
  });
  it.each([
    "*.test",
    "**",
    "images.test/path",
    "user:secret@images.test",
    "images.test:443",
  ])("rejects broad or malformed image allowlists: %s", (value) => {
    expect(() => exactImageHosts(value)).toThrow(/exact hostnames/);
  });
  it("enforces CSP, frame protection and production HSTS without enabling production eval", () => {
    const headers = Object.fromEntries(
      securityHeaders({
        production: true,
        apiUrl: "https://api.test",
        siteUrl: "https://site.test",
      }).map((h) => [h.key, h.value]),
    );
    const csp = headers["Content-Security-Policy"];
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("script-src-attr 'none'");
    expect(csp).toContain("connect-src 'self'");
    expect(csp).not.toContain("connect-src 'self' https://api.test");
    expect(csp).toContain("upgrade-insecure-requests");
    expect(csp).not.toContain("unsafe-eval");
    expect(headers["Strict-Transport-Security"]).toBe("max-age=31536000");
    const local = Object.fromEntries(
      securityHeaders({ production: false }).map((h) => [h.key, h.value]),
    );
    expect(local["Strict-Transport-Security"]).toBeUndefined();
  });
});

describe("bounded API responses", () => {
  it("reads valid JSON and rejects dishonest, absent, or oversized response lengths", async () => {
    expect(await readBoundedJson(new Response('{"data":[]}'), 20)).toEqual({
      data: [],
    });
    await expect(
      readBoundedJson(
        new Response("123456789", { headers: { "Content-Length": "1" } }),
        8,
      ),
    ).rejects.toThrow(/size/);
    await expect(
      readBoundedJson(
        new Response("{}", { headers: { "Content-Length": "100" } }),
        8,
      ),
    ).rejects.toThrow(/size/);
    await expect(readBoundedJson(new Response("123456789"), 8)).rejects.toThrow(
      /size/,
    );
  });
});
