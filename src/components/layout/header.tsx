import { Suspense } from "react";
import Link from "next/link";
import { ArrowUpRight, Search, Asterisk } from "lucide-react";
import { connection } from "next/server";
import { getClassifications } from "@/lib/api/client";
import { MobileMenu } from "./mobile-menu";
import { DesktopNavigation } from "./desktop-navigation";
export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="Ask and Explore home">
      <span className="logo-mark">
        <Asterisk size={25} strokeWidth={2} />
      </span>
      <span>
        ask<span className="text-blue">&</span>explore
        <span className="logo-dot">.</span>
      </span>
    </Link>
  );
}
async function TopicLinks() {
  await connection();
  const categories = await getClassifications("categories")
    .then((items) => items.filter((c) => c.is_active))
    .catch(() => []);
  const ids = new Set(categories.map((c) => c.id));
  return (
    <>
      {categories
        .filter((c) => !c.parent_id || !ids.has(c.parent_id))
        .map((category) => (
          <Link key={category.id} href={`/category/${category.slug}`}>
            {category.name}
            <ArrowUpRight size={16} />
          </Link>
        ))}
    </>
  );
}
async function MobileCategoryLinks() {
  await connection();
  const categories = await getClassifications("categories")
    .then((items) => items.filter((c) => c.is_active).slice(0, 5))
    .catch(() => []);
  return (
    <>
      {categories.map((category) => (
        <Link key={category.id} href={`/category/${category.slug}`}>
          {category.name}
        </Link>
      ))}
    </>
  );
}
export function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Logo />
        <Suspense
          fallback={
            <nav className="desktop-nav" aria-label="Main navigation">
              <Link href="/articles">Latest</Link>
              <Link href="/categories">Topics</Link>
              <Link href="/about">About</Link>
            </nav>
          }
        >
          <DesktopNavigation>
            <Suspense
              fallback={<Link href="/categories">Browse categories</Link>}
            >
              <TopicLinks />
            </Suspense>
          </DesktopNavigation>
        </Suspense>
        <MobileMenu>
          <Suspense>
            <MobileCategoryLinks />
          </Suspense>
        </MobileMenu>
        <div className="header-actions">
          <Link
            href="/search"
            className="header-search"
            aria-label="Search articles"
          >
            <Search size={20} />
            <span className="search-label">Search</span>
          </Link>
          <Link href="/request-article" className="header-request">
            Request a topic <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </header>
  );
}
