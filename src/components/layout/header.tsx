import { Suspense } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { connection } from "next/server";
import { getClassifications } from "@/lib/api/client";
import { HeaderSearch } from "./header-search";
import { Brand } from "@/components/shared/brand";
import { MobileMenu } from "./mobile-menu";
import { DesktopNavigation, NavLink } from "./desktop-navigation";
import styles from "./header.module.css";

export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="Ask and Explore home">
      <Brand />
    </Link>
  );
}

async function CategoryLinks() {
  await connection();
  const categories = await getClassifications("categories")
    .then((items) => items.filter((category) => category.is_active))
    .catch(() => []);
  return categories.map((category) => (
    <NavLink key={category.id} href={`/category/${category.slug}`}>
      <span>{category.name}</span>
      <ArrowUpRight size={14} aria-hidden="true" />
    </NavLink>
  ));
}

export function Header() {
  return (
    <header className={`site-header ${styles.header}`}>
      <div className={`header-inner ${styles.inner}`}>
        <Logo />
        <Suspense
          fallback={
            <nav className="desktop-nav" aria-label="Main navigation">
              <Link href="/">Home</Link>
              <Link href="/articles">Articles</Link>
              <Link href="/categories">Categories</Link>
              <Link href="/about">About</Link>
            </nav>
          }
        >
          <DesktopNavigation>
            <NavLink href="/categories">Explore all categories</NavLink>
            <Suspense>
              <CategoryLinks />
            </Suspense>
          </DesktopNavigation>
        </Suspense>
        <MobileMenu>
          <Suspense>
            <CategoryLinks />
          </Suspense>
        </MobileMenu>
        <div className="header-actions">
          <HeaderSearch />
          <Link
            href="/request-article"
            className={styles.requestTopic}
            aria-label="Request a topic"
          >
            <span className={styles.requestLabel}>Request a topic</span>
            <span className={styles.requestCompactLabel} aria-hidden="true">
              Request
            </span>
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}
