"use client";
import { useEffect, useRef, useState } from "react";
import { PolicyIcon, type PolicyIconName } from "./policy-icons";
import styles from "./policy.module.css";

export function PolicyContents({
  sections,
  variant = "icons",
  framed = true,
}: {
  sections: { id: string; title: string; icon?: PolicyIconName }[];
  variant?: "icons" | "numbers";
  framed?: boolean;
}) {
  const [active, setActive] = useState(sections[0]?.id);
  const contentsRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const revealActive = () => {
      const contents = contentsRef.current;
      const link = contents?.querySelector<HTMLElement>(
        'a[aria-current="location"]',
      );
      if (!contents || !link) return;
      const bounds = contents.getBoundingClientRect();
      const item = link.getBoundingClientRect();
      const left = bounds.left + contents.clientLeft;
      const top = bounds.top + contents.clientTop;
      const right = left + contents.clientWidth;
      const bottom = top + contents.clientHeight;
      const dx =
        item.left < left ? item.left - left : Math.max(0, item.right - right);
      const dy =
        item.top < top ? item.top - top : Math.max(0, item.bottom - bottom);
      if (dx || dy) {
        contents.scrollTo({
          left: contents.scrollLeft + dx,
          top: contents.scrollTop + dy,
          behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "instant"
            : "smooth",
        });
      }
    };
    revealActive();
    window.addEventListener("resize", revealActive);
    return () => window.removeEventListener("resize", revealActive);
  }, [active]);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      const header =
        document.querySelector("header")?.getBoundingClientRect().height || 65;
      const mobile = matchMedia("(max-width: 760px)").matches;
      const threshold = header + (mobile ? 100 : 65);
      let current = sections[0]?.id;
      for (const section of sections) {
        const heading = document.getElementById(section.id);
        if (heading && heading.getBoundingClientRect().top <= threshold)
          current = section.id;
      }
      setActive(current);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [sections]);
  return (
    <nav
      ref={contentsRef}
      className={styles.contents}
      aria-label="Document contents"
      data-policy-contents
      data-variant={variant}
      data-framed={framed}
    >
      {variant === "numbers" && (
        <h2 className={styles.contentsTitle}>On this page</h2>
      )}
      {sections.map((section, index) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          aria-current={active === section.id ? "location" : undefined}
        >
          {variant === "numbers" ? (
            <span className={styles.contentsNumber} aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
          ) : (
            <PolicyIcon name={section.icon || "document"} size={20} />
          )}
          <span>{section.title}</span>
        </a>
      ))}
    </nav>
  );
}
