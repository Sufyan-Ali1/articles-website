import "server-only";
import sanitizeHtml from "sanitize-html";
import { articleUrl } from "./urls";

// Match the publication's rich-text contract. No active content, arbitrary
// classes/IDs, styles, srcset, data attributes, or browser-controlled forms.
export function sanitizeArticle(html: string, origin?: string) {
  if (html.length > 1_000_000)
    throw new Error("Article content exceeds its supported size.");
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "hr",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "strong",
      "em",
      "b",
      "i",
      "u",
      "s",
      "blockquote",
      "pre",
      "code",
      "ul",
      "ol",
      "li",
      "a",
      "img",
      "figure",
      "figcaption",
      "table",
      "thead",
      "tbody",
      "tfoot",
      "tr",
      "th",
      "td",
      "caption",
      "sup",
      "sub",
      "details",
      "summary",
    ],
    allowedAttributes: {
      a: [
        "href",
        "title",
        { name: "target", values: ["_blank", "_self"] },
        "rel",
      ],
      img: ["src", "alt", "title", "width", "height"],
      th: ["scope", "colspan", "rowspan"],
      td: ["colspan", "rowspan"],
      ol: ["start"],
      code: ["class"],
    },
    allowedClasses: { code: [/^language-[a-z0-9-]+$/i] },
    allowedSchemes: ["http", "https"],
    allowProtocolRelative: false,
    nestingLimit: 60,
    nonTextTags: [
      "script",
      "style",
      "textarea",
      "option",
      "xmp",
      "iframe",
      "object",
      "embed",
      "svg",
      "math",
      "template",
      "noscript",
    ],
    parseStyleAttributes: false,
    transformTags: {
      a: (tagName, attribs) => {
        const href = articleUrl(attribs.href || "", undefined, true);
        if (href) attribs.href = href;
        else delete attribs.href;
        const rel = new Set(
          (attribs.rel || "")
            .toLowerCase()
            .split(/\s+/)
            .filter((token) =>
              [
                "nofollow",
                "sponsored",
                "ugc",
                "noopener",
                "noreferrer",
              ].includes(token),
            ),
        );
        if (attribs.target === "_blank") {
          rel.add("noopener");
          rel.add("noreferrer");
        }
        attribs.rel = [...rel].join(" ");
        return { tagName, attribs };
      },
      img: (tagName, attribs) => {
        const src = articleUrl(attribs.src || "", origin);
        if (src) attribs.src = src;
        else delete attribs.src;
        return { tagName, attribs };
      },
    },
  });
}
