import { LegalHero } from "./legal-hero";
import { PolicyContents } from "./policy-contents";
import { LegalSections } from "./legal-sections";
import { LegalNote } from "./legal-note";
import type { LegalPageConfig } from "./legal-types";
import styles from "./legal.module.css";

export function LegalPage({ config }: { config: LegalPageConfig }) {
  return (
    <div
      className={styles.page}
      data-legal-page={config.id}
      data-heading-style={config.headingStyle}
    >
      <LegalHero {...config} />
      <div className={`${styles.shell} ${styles.layout}`}>
        <div className={styles.sidebar} data-legal-sidebar>
          <PolicyContents
            sections={config.sections.map(({ id, title }) => ({ id, title }))}
            variant="numbers"
          />
        </div>
        <LegalSections title={config.title} sections={config.sections} />
        <div className={styles.noteRow}>
          <LegalNote {...config.note} />
        </div>
      </div>
    </div>
  );
}
