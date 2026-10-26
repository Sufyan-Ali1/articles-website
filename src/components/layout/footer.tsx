import { Suspense } from "react";
import { connection } from "next/server";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Mail, Search } from "lucide-react";
import { getClassifications } from "@/lib/api/client";
import { site } from "@/lib/config";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import { Brand } from "@/components/shared/brand";
import styles from "./footer.module.css";

async function FooterTopics() {
  await connection();
  const [categoriesResult, typesResult] = await Promise.allSettled([
    getClassifications("categories"),
    getClassifications("article-types"),
  ]);
  const categories =
    categoriesResult.status === "fulfilled"
      ? categoriesResult.value
          .filter((category) => category.is_active && !category.parent_id)
          .slice(0, 3)
      : [];
  const types =
    typesResult.status === "fulfilled"
      ? typesResult.value
          .filter(
            (type) =>
              type.is_active &&
              /review|guide|tutorial/i.test(`${type.name} ${type.slug}`),
          )
          .slice(0, 2)
      : [];
  return (
    <>
      {categories.map((category) => (
        <Link key={category.id} href={`/category/${category.slug}`}>
          {category.name}
        </Link>
      ))}
      {types.map((type) => (
        <Link key={type.id} href={`/articles?article_type=${type.slug}`}>
          {type.name}
        </Link>
      ))}
      {!categories.length && !types.length && (
        <Link href="/categories">Explore all topics</Link>
      )}
    </>
  );
}
async function FooterFormats() {
  await connection();
  const types = await getClassifications("article-types")
    .then((items) => items.filter((type) => type.is_active))
    .catch(() => []);
  const review = types.find((type) =>
    /review/i.test(`${type.name} ${type.slug}`),
  );
  const guide = types.find((type) =>
    /buying.?guide|guide|tutorial/i.test(`${type.name} ${type.slug}`),
  );
  return (
    <>
      {review && (
        <Link href={`/articles?article_type=${review.slug}`}>Reviews</Link>
      )}
      {guide && (
        <Link href={`/articles?article_type=${guide.slug}`}>Guides</Link>
      )}
    </>
  );
}
async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return new Date().getUTCFullYear();
}
export function Footer() {
  return (
    <footer className={`site-footer ${styles.footer}`}>
      <div className={styles.shell}>
        <div className={styles.columns}>
          <div className={styles.brandColumn}>
            <Link
              href="/"
              className={styles.brand}
              aria-label="Ask and Explore home"
            >
              <Brand />
            </Link>
            <p>
              Discover more. Learn every day.
              <br />
              Practical guides for the choices you make every day.
            </p>
            <div
              className={styles.utilityLinks}
              aria-label="More from Ask and Explore"
            >
              <Link
                href="/about"
                aria-label="About the publication"
                title="About the publication"
              >
                <BookOpen size={16} />
              </Link>
              <Link
                href="/contact"
                aria-label="Contact Ask and Explore"
                title="Contact Ask and Explore"
              >
                <Mail size={16} />
              </Link>
              <Link
                href="/search"
                aria-label="Search the publication"
                title="Search the publication"
              >
                <Search size={16} />
              </Link>
              <Link
                href="/request-article"
                aria-label="Request an article"
                title="Request an article"
              >
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
          <nav className={styles.linkColumn} aria-label="Footer quick links">
            <h2>Quick Links</h2>
            <Link href="/">Home</Link>
            <Link href="/articles">All articles</Link>
            <Link href="/categories">Categories</Link>
            <Suspense>
              <FooterFormats />
            </Suspense>
            <Link href="/contact">Contact</Link>
          </nav>
          <nav className={styles.linkColumn} aria-label="Footer popular topics">
            <h2>Explore Topics</h2>
            <Suspense
              fallback={<Link href="/categories">Explore all topics</Link>}
            >
              <FooterTopics />
            </Suspense>
          </nav>
          <div className={styles.newsletterColumn}>
            <h2>Stay in Touch</h2>
            <p>
              Subscribe for future article updates.
              <br />
              Browse the latest articles today.
            </p>
            <NewsletterForm compact label="Footer newsletter signup" />
          </div>
        </div>
        <div className={styles.bottom}>
          <span>
            ©{" "}
            <Suspense>
              <CopyrightYear />
            </Suspense>{" "}
            {site.name}. All rights reserved.
          </span>
          <nav aria-label="Footer legal links">
            <Link href="/about">About</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/disclaimer">Disclosures</Link>
            <Link href="/contact">Contact</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
