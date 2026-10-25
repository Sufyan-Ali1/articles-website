"use client";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Link2, Share2 } from "lucide-react";
import { ReadingPanel } from "./reading-panel";
import styles from "./reading-layout.module.css";
import type { TocHeading } from "@/lib/utils/article-html";
export function ShareActions({ title }: { title: string }) {
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href.split("#")[0]);
      setMessage("");
      setCopied(true);
    } catch {
      setCopied(false);
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
        <button onClick={copy} data-copied={copied} aria-live="polite">
          {copied ? (
            <Check size={14} aria-hidden="true" />
          ) : (
            <Link2 size={14} aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy link"}
        </button>
        <button onClick={share}>
          <Share2 size={14} />
          Share
        </button>
      </div>
      {message && (
        <span className="share-message" role="status">
          {message}
        </span>
      )}
    </div>
  );
}
export function ReadingTools({ headings }: { headings: TocHeading[] }) {
  const [active, setActive] = useState("");
  useEffect(() => {
    const article = document.getElementById("article-content");
    if (!article) return;
    let frame = 0;
    const update = () => {
      frame = 0;
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
      {headings.length > 0 && (
        <ReadingPanel side="contents">
          <TocLinks headings={headings} active={active} followActive />
        </ReadingPanel>
      )}
    </>
  );
}
function TocLinks({
  headings,
  active = "",
  followActive = false,
}: {
  headings: TocHeading[];
  active?: string;
  followActive?: boolean;
}) {
  const navigation = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!followActive) return;
    const nav = navigation.current;
    const scroller = nav?.closest<HTMLElement>("[data-reader-scroll]");
    if (!nav || !scroller) return;
    const revealActive = () => {
      const link = nav.querySelector<HTMLElement>('[aria-current="location"]');
      if (!link || !scroller.clientHeight) return;
      const bounds = scroller.getBoundingClientRect();
      const item = link.getBoundingClientRect();
      if (item.top < bounds.top + 8 || item.bottom > bounds.bottom - 8) {
        scroller.scrollTo({
          top:
            scroller.scrollTop +
            item.top -
            bounds.top -
            scroller.clientHeight / 2 +
            item.height / 2,
          behavior: "instant",
        });
      }
    };
    const observer = new ResizeObserver(revealActive);
    observer.observe(scroller);
    revealActive();
    return () => observer.disconnect();
  }, [active, followActive]);
  return (
    <nav ref={navigation} className="toc-links" aria-label="Table of contents">
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

export function ReadingProgress() {
  const progress = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = progress.current;
    const content = document.getElementById("article-content");
    if (!track || !content) return;
    const article = content.closest("article") || content;
    const header = document.querySelector<HTMLElement>(".site-header");
    let frame = 0;
    const update = () => {
      frame = 0;
      const headerHeight = header?.getBoundingClientRect().height ?? 0;
      const start = Math.max(
        0,
        window.scrollY + article.getBoundingClientRect().top - headerHeight,
      );
      const end = Math.max(
        start + 1,
        window.scrollY +
          content.getBoundingClientRect().bottom -
          window.innerHeight,
      );
      const fraction = Math.min(
        1,
        Math.max(0, (window.scrollY - start) / (end - start)),
      );
      track.style.setProperty("--progress", String(fraction));
      track.setAttribute("aria-valuenow", String(Math.round(fraction * 100)));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(schedule)
        : null;
    observer?.observe(article);
    observer?.observe(content);
    if (header) observer?.observe(header);
    update();
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer?.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={progress}
      id="reading-progress"
      className={styles.progressTrack}
      role="progressbar"
      aria-label="Article reading progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
    >
      <span aria-hidden="true" />
    </div>
  );
}
