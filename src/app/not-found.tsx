import type { Metadata } from "next";
import { NotFoundHero } from "@/components/errors/not-found-hero";
import { RecoveryLinks } from "@/components/errors/recovery-links";
import styles from "@/components/errors/not-found.module.css";

export const metadata: Metadata = {
  title: "404 — Page Not Found",
  description:
    "This page seems to be lost. Find your next Ask & Explore article.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className={styles.page} data-not-found-page>
      <NotFoundHero />
      <RecoveryLinks />
    </div>
  );
}
