import Image from "next/image";
import Link from "next/link";
import { House, Search } from "lucide-react";
import styles from "./not-found.module.css";

export function NotFoundHero() {
  return (
    <section className={styles.hero} aria-labelledby="not-found-title">
      <div className={`${styles.shell} ${styles.heroInner}`}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Page not found</p>
          <h1 id="not-found-title">
            <span className={styles.oops}>Oops!</span>
            <span className={styles.title}>We Can’t Find This Page</span>
          </h1>
          <p className={styles.description}>
            This link may be out of date, or the page may have moved. Search the
            article library or return to the homepage to choose your next read.
          </p>
          <div className={styles.actions}>
            <Link href="/" className={styles.primary}>
              <House size={23} strokeWidth={1.7} aria-hidden="true" />
              Go to Homepage
            </Link>
            <Link href="/search" className={styles.secondary}>
              <Search size={23} strokeWidth={1.8} aria-hidden="true" />
              Search Articles
            </Link>
          </div>
        </div>
        <div className={styles.art}>
          <Image
            src="/images/not-found/lost-page.webp"
            alt="A blue bird perched on a wooden 404 Page Not Found sign beside a curious golden puppy."
            width={1920}
            height={1080}
            sizes="(max-width: 760px) 100vw, (max-width: 1199px) 55vw, 800px"
            preload
          />
        </div>
      </div>
    </section>
  );
}
