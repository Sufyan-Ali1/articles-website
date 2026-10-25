import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { PolicyIcon } from "./policy-icons";
import type { LegalPageConfig } from "./legal-types";
import styles from "./legal.module.css";

export function LegalNote({
  title,
  description,
  updatedAt,
  link,
  icon,
}: LegalPageConfig["note"]) {
  return (
    <aside className={styles.note} aria-label="Document information">
      {icon ? (
        <PolicyIcon name={icon} size={23} />
      ) : (
        <Clock3 size={23} strokeWidth={1.7} aria-hidden="true" />
      )}
      <div>
        <p>
          {updatedAt ? (
            <>
              Last updated:{" "}
              <time dateTime={updatedAt}>{formatDate(updatedAt)}</time>
            </>
          ) : (
            title
          )}
        </p>
        <span>{description}</span>
      </div>
      {link && (
        <Link href={link.href}>
          {link.label}
          <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      )}
    </aside>
  );
}
