import type { LegalSection } from "./legal-types";
import { PolicyIcon } from "./policy-icons";
import styles from "./legal.module.css";

export function LegalSections({
  title,
  sections,
}: {
  title: string;
  sections: LegalSection[];
}) {
  return (
    <article className={styles.article} aria-label={title}>
      {sections.map((section, index) => (
        <section
          className={styles.section}
          key={section.id}
          aria-labelledby={section.id}
        >
          {section.icon ? (
            <span
              className={styles.sectionSymbol}
              data-tone={section.tone}
              aria-hidden="true"
            >
              <PolicyIcon name={section.icon} size={26} />
            </span>
          ) : (
            <span className={styles.sectionNumber} aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
          )}
          <div>
            <h2 id={section.id} aria-label={section.title}>
              {section.icon && <span aria-hidden="true">{index + 1}. </span>}
              {section.title}
            </h2>
            {section.content}
          </div>
        </section>
      ))}
    </article>
  );
}
