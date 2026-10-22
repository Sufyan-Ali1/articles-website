import { parseDocument } from "htmlparser2";
import { textContent, findAll } from "domutils";
import render from "dom-serializer";
import { isTag, type Element } from "domhandler";
export interface TocHeading {
  id: string;
  text: string;
  level: number;
}
export function prepareArticle(html: string, origin?: string) {
  const document = parseDocument(html);
  const headings: TocHeading[] = [];
  const used = new Map<string, number>();
  let sponsored = false;
  const elements = findAll(isTag, document.children);
  // Calculate from content only, before adding interface labels and controls.
  const originalWords = textContent(document)
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  for (const element of elements) {
    // Input is sanitized by FastAPI. Strip executable elements defensively at the boundary.
    if (
      ["script", "iframe", "object", "embed", "style", "svg", "form"].includes(
        element.name,
      )
    ) {
      element.children = [];
      element.name = "span";
      element.attribs = {};
    }
    for (const attr of Object.keys(element.attribs))
      if (attr.startsWith("on") || attr === "style")
        delete element.attribs[attr];
    if (/^h[1-6]$/.test(element.name)) {
      if (element.name === "h1") element.name = "h2";
      const text = textContent(element).trim();
      const base =
        text
          .normalize("NFKD")
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-") || "section";
      const count = (used.get(base) || 0) + 1;
      used.set(base, count);
      const id = `${base}${count > 1 ? `-${count}` : ""}`;
      element.attribs.id = id;
      if (text && ["h2", "h3"].includes(element.name))
        headings.push({ id, text, level: Number(element.name[1]) });
    }
    if (element.name === "a") {
      const href = element.attribs.href || "";
      if (!/^(https?:\/\/|\/(?!\/)|#)/i.test(href)) delete element.attribs.href;
      const rel = new Set((element.attribs.rel || "").split(/\s+/));
      if (rel.has("sponsored")) sponsored = true;
      if (element.attribs.target === "_blank") {
        rel.add("noopener");
        rel.add("noreferrer");
      }
      element.attribs.rel = [...rel].filter(Boolean).join(" ");
    }
    if (element.name === "img") {
      const src = element.attribs.src || "";
      if (!/^(https?:\/\/|\/(?!\/))/i.test(src)) delete element.attribs.src;
      else if (origin && src.startsWith("/"))
        element.attribs.src = new URL(src, origin).href;
      element.attribs.loading = "lazy";
      element.attribs.decoding = "async";
      element.attribs.alt ||= "";
    }
    if (element.name === "pre" && element.parent) {
      const parent = element.parent;
      const wrapper = parseDocument(
        '<div class="code-block"><div class="code-toolbar"><span>Code</span><button type="button" data-copy-code disabled aria-label="Copy code">Copy code</button></div></div>',
      ).children[0] as Element;
      const index = parent.children.indexOf(element);
      parent.children[index] = wrapper;
      wrapper.parent = parent;
      wrapper.prev = element.prev;
      wrapper.next = element.next;
      if (wrapper.prev) wrapper.prev.next = wrapper;
      if (wrapper.next) wrapper.next.prev = wrapper;
      wrapper.children.push(element);
      element.parent = wrapper;
      element.prev = wrapper.children[0];
      element.next = null;
      wrapper.children[0].next = element;
    }
    if (element.name === "table") {
      const parent = element.parent;
      if (parent) {
        const wrapper = parseDocument(
          '<div class="table-scroll" tabindex="0" role="region" aria-label="Article table"></div>',
        ).children[0] as Element;
        const index = parent.children.indexOf(element);
        parent.children[index] = wrapper;
        wrapper.parent = parent;
        wrapper.prev = element.prev;
        wrapper.next = element.next;
        if (wrapper.prev) wrapper.prev.next = wrapper;
        if (wrapper.next) wrapper.next.prev = wrapper;
        wrapper.children = [element];
        element.parent = wrapper;
        element.prev = null;
        element.next = null;
      }
    }
  }
  return {
    html: render(document),
    headings,
    readingMinutes: Math.max(1, Math.ceil(originalWords / 220)),
    sponsored,
  };
}
