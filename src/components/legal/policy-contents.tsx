"use client";
import { useEffect, useState } from "react";
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
