"use client";
import { useEffect, useState } from "react";
import { Check, ChevronDown, Copy, Share2 } from "lucide-react";
import type { TocHeading } from "@/lib/utils/article-html";
export function ShareActions({ title }: { title: string }) {
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href.split("#")[0]);
      setMessage("Link copied");
      setCopied(true);
    } catch {
      setMessage("Copy the address from your browser to share this story.");
    }
  }
  async function share() {
    if (!navigator.share) return copy();
    try {
      await navigator.share({ title, url: window.location.href.split("#")[0] });
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError"))
        setMessage("Sharing is unavailable. Try copying the link.");
    }
  }
  return (
    <div className="share-block">
      <div className="share-actions">
        <button onClick={copy}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy link"}
        </button>
        <button onClick={share}>
          <Share2 size={14} />
          Share
        </button>
      </div>
      <span className="share-message" role="status">
        {message}
      </span>
    </div>
  );
}
export function ReadingTools({
  headings,
  title,
}: {
  headings: TocHeading[];
  title: string;
}) {
  const [active, setActive] = useState("");
  useEffect(() => {
    const article = document.getElementById("article-content");
    const progress = document.getElementById("reading-progress");
    if (!article || !progress) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = article.getBoundingClientRect();
      const total = Math.max(
        1,
        article.offsetHeight - window.innerHeight + 110,
      );
      const fraction = Math.min(1, Math.max(0, (110 - rect.top) / total));
      progress.style.transform = `scaleX(${fraction})`;
      let current = "";
      for (const heading of headings) {
        const node = document.getElementById(heading.id);
        if (node && node.getBoundingClientRect().top < 170)
          current = heading.id;
      }
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(article);
    update();
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [headings]);
  return (
    <>
      <div
        id="reading-progress"
        className="reading-progress"
        aria-hidden="true"
      />
      <aside className="toc-desktop">
        {headings.length > 0 && (
          <>
            <h2 className="toc-title">In this article</h2>
            <TocLinks headings={headings} active={active} />
          </>
        )}
        <ShareActions title={title} />
      </aside>
    </>
  );
}
function TocLinks({
  headings,
  active = "",
}: {
  headings: TocHeading[];
  active?: string;
}) {
  return (
    <nav className="toc-links" aria-label="Table of contents">
      {headings.map((heading) => (
        <a
          href={`#${heading.id}`}
          key={heading.id}
          className={heading.level === 3 ? "toc-subheading" : ""}
          aria-current={heading.id === active ? "location" : undefined}
        >
          {heading.text}
        </a>
      ))}
    </nav>
  );
}
export function MobileToc({ headings }: { headings: TocHeading[] }) {
  return headings.length ? (
    <details className="mobile-toc">
      <summary>
        In this article
        <ChevronDown size={16} />
      </summary>
      <TocLinks headings={headings} />
    </details>
  ) : null;
}
