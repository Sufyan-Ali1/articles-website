import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { BookOpen, Clock3, Search, Star } from "lucide-react";
import { getClassifications } from "@/lib/api/client";
import {
  filterUrl,
  parseFilters,
  type SearchParams,
} from "@/lib/utils/filters";
import {
  categoryPresentation,
  compareCategories,
} from "@/components/categories/category-presentation";
import styles from "./search.module.css";

export async function SearchHero({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await connection();
  const params = await searchParams;
  const filters = parseFilters(params);
  const view =
    params.view === "list" || params.view === "grid" ? params.view : undefined;
  const [categories, types] = await Promise.all([
    getClassifications("categories").catch(() => []),
    getClassifications("article-types").catch(() => []),
  ]);
  const topics = categories
    .filter((item) => item.is_active && !item.parent_id)
    .sort(compareCategories)
    .slice(0, 3);
  const formats = types.filter((item) => item.is_active).slice(0, 2);
  return (
    <section className={styles.hero} aria-labelledby="search-title">
      <div className={`${styles.shell} ${styles.heroInner}`}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Search articles</p>
          <h1 id="search-title">
            Find the answers
            <br />
            you’re looking for
          </h1>
          <p className={styles.description}>
            Search published article titles for a product, a topic, or a
            question. Use the topic and article-type filters to narrow your
            results.
          </p>
          <form
            key={JSON.stringify([filters, view])}
            action="/search"
            method="get"
            role="search"
            aria-label="Search the article library"
            className={styles.searchForm}
            data-search-hero-form
          >
            <Search size={22} aria-hidden="true" />
            <label htmlFor="search-library" className="sr-only">
              Search article titles
            </label>
            <input
              id="search-library"
              type="search"
              name="search"
              placeholder="Search a topic, product, or question..."
              defaultValue={filters.search}
              maxLength={200}
            />
            {filters.category && (
              <input type="hidden" name="category" value={filters.category} />
            )}
            {filters.article_type && (
              <input
                type="hidden"
                name="article_type"
                value={filters.article_type}
              />
            )}
            {filters.tag && (
              <input type="hidden" name="tag" value={filters.tag} />
            )}
            <input type="hidden" name="sort" value={filters.sort} />
            {view && <input type="hidden" name="view" value={view} />}
            <button type="submit" aria-label="Search articles">
              Search
            </button>
          </form>
          <nav className={styles.shortcuts} aria-label="Search shortcuts">
            {topics.map((category) => {
              const { icon: Icon } = categoryPresentation(category);
              return (
                <Link
                  key={category.id}
                  href={filterUrl(
                    "/search",
                    {
                      ...filters,
                      category:
                        filters.category === category.slug
                          ? undefined
                          : category.slug,
                    },
                    1,
                    view,
                  )}
                  aria-current={
                    filters.category === category.slug ? "true" : undefined
                  }
                  prefetch={false}
                >
                  <Icon size={16} aria-hidden="true" />
                  {category.name}
                </Link>
              );
            })}
            {formats.map((type) => {
              const Icon = /review/i.test(type.name) ? Star : BookOpen;
              return (
                <Link
                  key={type.id}
                  href={filterUrl(
                    "/search",
                    {
                      ...filters,
                      article_type:
                        filters.article_type === type.slug
                          ? undefined
                          : type.slug,
                    },
                    1,
                    view,
                  )}
                  aria-current={
                    filters.article_type === type.slug ? "true" : undefined
                  }
                  prefetch={false}
                >
                  <Icon size={16} aria-hidden="true" />
                  {type.name}
                </Link>
              );
            })}
            <Link
              href={filterUrl(
                filters.search ||
                  filters.category ||
                  filters.article_type ||
                  filters.tag
                  ? "/search"
                  : "/articles",
                { ...filters, sort: "-published_at" },
                1,
                view,
              )}
              prefetch={false}
            >
              <Clock3 size={16} aria-hidden="true" />
              Latest
            </Link>
          </nav>
        </div>
        <div className={styles.heroArt}>
          <Image
            src="/images/search/hero.webp"
            alt="A curious reader in a blue hoodie exploring ideas on a laptop beside books and plants."
            width={1920}
            height={1080}
            sizes="(max-width: 760px) 100vw, 52vw"
            preload
          />
        </div>
      </div>
    </section>
  );
}
