// Isolated test infrastructure. Never imported by the application.
import { createServer } from "node:http";
const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const dates = {
  created_at: "2026-10-01T09:00:00Z",
  updated_at: "2026-10-02T09:00:00Z",
};
const classification = (n, name, slug) => ({
  id: id(n),
  name,
  slug,
  description: `Explore ${name.toLowerCase()}, one good question at a time.`,
  is_active: true,
  ...dates,
});
const technology = {
  ...classification(101, "Technology", "technology"),
  parent_id: null,
};
const automotive = {
  ...classification(102, "Automotive", "automotive"),
  parent_id: null,
};
const everyday = {
  ...classification(103, "Everyday tech", "everyday-tech"),
  parent_id: technology.id,
};
const inactive = {
  ...classification(104, "Archived topic", "archived-topic"),
  is_active: false,
  parent_id: null,
};
const tag = classification(201, "Practical choices", "practical-choices");
const types = [
  classification(301, "Tutorials", "tutorial"),
  classification(302, "Reviews", "review"),
  classification(303, "Buying guides", "buying-guide"),
  classification(304, "Comparisons", "comparison"),
];
const topics = [
  [
    "The electric car question: what really matters before you switch",
    "electric-car-question",
    automotive,
    "A clearer look at range, charging, and the everyday realities behind the big decision.",
  ],
  [
    "A calmer, smarter approach to your digital workspace",
    "digital-workspace",
    technology,
    "Small changes that help your tools work together, without adding another layer of distraction.",
  ],
  [
    "The laptop buying guide for people who just want things to work",
    "laptop-buying-guide",
    technology,
    "Cut through the specifications and find the features that will actually make a difference.",
  ],
  [
    "What your car’s dashboard is trying to tell you",
    "dashboard-signals",
    automotive,
    "Understanding the signals, symbols, and small details that help you take better care of your car.",
  ],
  [
    "How to make your first home network more reliable",
    "home-network",
    everyday,
    "A practical starting point for stronger connections in the places you use them most.",
  ],
  [
    "The useful differences between a hybrid and an electric car",
    "hybrid-or-electric",
    automotive,
    "Look past the labels and compare how each option fits into everyday life.",
  ],
  [
    "A thoughtful review of the tools on your desk",
    "desk-tools-review",
    technology,
    "A closer look at what makes a daily tool useful, comfortable, and worth keeping.",
  ],
  [
    "Understanding software updates without the jargon",
    "software-updates",
    everyday,
    "What changes, why updates matter, and how to approach them with confidence.",
  ],
  [
    "A better way to compare your next pair of headphones",
    "headphones-comparison",
    technology,
    "The questions to ask before getting lost in features and specifications.",
  ],
  [
    "A simple guide to planning your next road trip",
    "road-trip-planning",
    automotive,
    "The decisions that make the journey a little easier, from preparation to the final stop.",
  ],
  [
    "Getting started with the shortcuts you’ll actually use",
    "useful-shortcuts",
    everyday,
    "Make everyday tasks a little simpler with a few well-chosen habits.",
  ],
  [
    "What to check before buying a used car",
    "used-car-checklist",
    automotive,
    "Practical questions to help you look beyond the first impression.",
  ],
  [
    "The beginner’s guide to a more organized photo library",
    "organized-photos",
    technology,
    "Find the pictures that matter and build a system you can keep using.",
  ],
  [
    "When it makes sense to replace an everyday device",
    "replace-or-repair",
    technology,
    "A few useful considerations before you decide whether it’s time for something new.",
  ],
  [
    "A closer look at the technology inside modern cars",
    "technology-in-cars",
    automotive,
    "Understanding the features that are changing the way we drive.",
  ],
];
const articles = topics.map(([title, slug, category, excerpt], i) => ({
  id: id(i + 1),
  title,
  slug,
  excerpt,
  featured_image: `http://127.0.0.1:4100/media/${i % 5}.svg`,
  featured_image_alt: `Editorial illustration for ${title}`,
  author: { id: id(401), name: "Test Editor" },
  article_type: types[i % types.length],
  categories: [category],
  tags: [tag],
  is_featured: i < 4,
  view_count: 100 - i * 3,
  published_at: `2026-10-${String(20 - i).padStart(2, "0")}T09:00:00Z`,
  ...dates,
}));
let hidden = new Set();
let outage = false;
let detailReads = 0;
const colors = [
  ["#d4dfcf", "#355242", "#8ea993"],
  ["#e2d9ca", "#3f5056", "#c5a97c"],
  ["#d0dce3", "#384c68", "#9cafbb"],
  ["#e4dbd1", "#4b4541", "#b9ada1"],
  ["#d5dacd", "#3a514a", "#a3b49c"],
];
function illustration(index) {
  const [bg, dark, accent] = colors[index % colors.length];
  const isCar = index % 3 === 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1200 675"><rect width="1200" height="760" fill="${bg}"/><circle cx="1050" cy="80" r="340" fill="${accent}" opacity=".35"/><path d="M0 610L1200 470V760H0" fill="${accent}" opacity=".5"/>${isCar ? `<ellipse cx="630" cy="580" rx="390" ry="36" fill="${dark}" opacity=".15"/><path d="M240 496l80-90 120-35h260l150 90 100 25v74H220z" fill="${dark}"/><path d="M390 414l78-27h205l100 63H355z" fill="${bg}" opacity=".8"/><circle cx="380" cy="550" r="52" fill="#292b2c"/><circle cx="803" cy="550" r="52" fill="#292b2c"/><circle cx="380" cy="550" r="26" fill="${accent}"/><circle cx="803" cy="550" r="26" fill="${accent}"/><path d="M235 492h82M865 492h70" stroke="#e6e9d0" stroke-width="12"/>` : `<rect x="285" y="160" width="590" height="365" rx="15" fill="${dark}" transform="rotate(-5 580 350)"/><rect x="307" y="183" width="546" height="317" rx="4" fill="${accent}" transform="rotate(-5 580 350)"/><path d="M230 570l660-58 120 75-780 65z" fill="${dark}"/><rect x="360" y="257" width="200" height="12" rx="6" fill="${bg}" opacity=".6"/><rect x="360" y="292" width="320" height="10" rx="5" fill="${bg}" opacity=".5"/><rect x="360" y="326" width="280" height="10" rx="5" fill="${bg}" opacity=".4"/><circle cx="770" cy="310" r="60" fill="${bg}" opacity=".25"/>`}<path d="M70 70h55m-27-27v55" stroke="${dark}" stroke-width="2" opacity=".5"/></svg>`;
}
createServer(async (req, res) => {
  const url = new URL(req.url, "http://127.0.0.1:4100");
  res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:3100");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Expose-Headers", "Retry-After");
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }
  const json = (status, data) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  };
  const error = (status) =>
    json(status, {
      error: {
        code: status === 404 ? "not_found" : "unavailable",
        message: "Request failed",
        request_id: "test-request",
      },
    });
  let raw = "";
  for await (const chunk of req) raw += chunk;
  const body = raw ? JSON.parse(raw) : {};
  if (url.pathname === "/__control") {
    if (body.hide) hidden.add(body.hide);
    if (body.show) hidden.delete(body.show);
    if (typeof body.outage === "boolean") outage = body.outage;
    if (body.reset) {
      hidden = new Set();
      outage = false;
      detailReads = 0;
    }
    return json(200, { detailReads });
  }
  if (url.pathname === "/health") return json(200, { data: { status: "ok" } });
  if (url.pathname.startsWith("/media/")) {
    res.writeHead(200, {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public,max-age=3600",
    });
    return res.end(
      illustration(Number(url.pathname.split("/").at(-1).split(".")[0])),
    );
  }
  if (outage || url.searchParams.get("search") === "simulate-outage")
    return error(503);
  if (url.pathname === "/api/v1/article-requests" && req.method === "POST") {
    if (body.topic === "rate-limit-test") {
      res.setHeader("Retry-After", "60");
      return error(429);
    }
    if (body.topic === "server-invalid")
      return json(422, {
        error: {
          code: "validation_error",
          message: "Invalid request",
          request_id: "test",
          details: [{ location: ["body", "topic"], type: "value_error" }],
        },
      });
    if (!body.topic?.trim() || body.topic.length > 300) return error(422);
    return json(202, { data: { message: "Thank you for your suggestion." } });
  }
  if (url.pathname === "/api/v1/articles") {
    let list = articles.filter((a) => !hidden.has(a.slug));
    const q = url.searchParams;
    if (q.has("search"))
      list = list.filter((a) =>
        a.title.toLowerCase().includes(q.get("search").toLowerCase()),
      );
    if (q.has("category"))
      list = list.filter((a) =>
        a.categories.some((c) => c.slug === q.get("category")),
      );
    if (q.has("tag"))
      list = list.filter((a) => a.tags.some((t) => t.slug === q.get("tag")));
    if (q.has("article_type"))
      list = list.filter((a) => a.article_type.slug === q.get("article_type"));
    if (q.has("is_featured"))
      list = list.filter(
        (a) => a.is_featured === (q.get("is_featured") === "true"),
      );
    const sort = q.get("sort") || "-published_at";
    const field = sort.replace(/^-/, "");
    list.sort(
      (a, b) =>
        (typeof a[field] === "number"
          ? a[field] - b[field]
          : String(a[field]).localeCompare(String(b[field]))) *
        (sort.startsWith("-") ? -1 : 1),
    );
    const page = Number(q.get("page") || 1),
      size = Number(q.get("page_size") || 20);
    return json(200, {
      data: list.slice((page - 1) * size, page * size),
      meta: {
        page,
        page_size: size,
        total: list.length,
        pages: Math.ceil(list.length / size),
      },
    });
  }
  if (url.pathname.startsWith("/api/v1/articles/")) {
    const slug = url.pathname.split("/").at(-1);
    const readerFixture = [
      "long-reader",
      "plain-reader",
      "image-reader",
      "security-reader",
    ].includes(slug);
    const a = readerFixture
      ? { ...articles[0], slug, featured_image: null }
      : articles.find((item) => item.slug === slug && !hidden.has(slug));
    if (!a) return error(404);
    detailReads++;
    return json(200, {
      data: {
        ...a,
        content_html:
          slug === "security-reader"
            ? '<h2>Safe article heading</h2><p>Safe article content remains readable.</p><base href="https://attacker.invalid/"><meta http-equiv="refresh" content="0;url=https://attacker.invalid/redirect"><script>alert("stored-xss")</script><img src="data:image/svg+xml,unsafe" onerror="alert(1)" srcset="https://attacker.invalid/image 2x"><svg onload="alert(1)"></svg><iframe srcdoc="<script>alert(1)</script>"></iframe><p id="main-content" style="position:fixed" data-copy-code="1">Visible text</p>'
            : slug === "image-reader"
              ? '<h2>Full images</h2><p>This article includes a complete inline image.</p><figure><img src="/media/0.svg" width="1920" height="1080" alt="Complete inline article image"><figcaption>An uncropped 16:9 image.</figcaption></figure>'
              : slug === "long-reader"
                ? Array.from(
                    { length: 35 },
                    (_, i) =>
                      `<h2>Section ${i + 1}</h2><p>${"A useful section of this longer article. ".repeat(30)}</p>`,
                  ).join("")
                : slug === "plain-reader"
                  ? "<p>A short article without headings or a featured image.</p>"
                  : `<p>Good decisions start with a little context. This test article explores the questions behind a familiar everyday choice and offers a practical place to begin.</p><h2>The questions worth asking</h2><p>${"Take time to understand what matters in your own situation before comparing the available options. ".repeat(15)}</p><h3>Start with everyday needs</h3><p>List the things you do most often, the things that frustrate you, and the things that would make a meaningful difference.</p><h2>A practical comparison</h2><table><thead><tr><th>Consideration</th><th>What to look for</th></tr></thead><tbody><tr><td>Everyday use</td><td>Reliable, simple, and useful</td></tr><tr><td>Longer term</td><td>Support, maintenance, and flexibility</td></tr></tbody></table><h2>The questions worth asking</h2><p>Compare the context behind a recommendation rather than the headline alone.</p><pre><code class="language-js">const question = "What matters to you?";</code></pre><p><a href="https://example.com/product" rel="sponsored nofollow" target="_blank">A sponsored product link</a></p><blockquote><p>The right question makes the next step a little clearer.</p></blockquote><h2>A useful next step</h2><p>${"Explore at your own pace and keep your own circumstances in mind. ".repeat(20)}</p>`,
        meta_title: `${a.title} — An Ask & Explore perspective`,
        meta_description: a.excerpt,
        schema: {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: a.title,
        },
      },
    });
  }
  for (const [collection, values] of [
    ["categories", [technology, automotive, everyday, inactive]],
    ["tags", [tag]],
    ["article-types", types],
  ]) {
    const active = values.filter((v) => v.is_active);
    if (url.pathname === `/api/v1/${collection}`)
      return json(200, {
        data: active,
        meta: { page: 1, page_size: 100, total: active.length, pages: 1 },
      });
    if (url.pathname.startsWith(`/api/v1/${collection}/`)) {
      const value = active.find(
        (v) => v.slug === url.pathname.split("/").at(-1),
      );
      return value ? json(200, { data: value }) : error(404);
    }
  }
  return error(404);
}).listen(4100, "127.0.0.1", () =>
  console.log("Isolated test API ready on 4100"),
);
