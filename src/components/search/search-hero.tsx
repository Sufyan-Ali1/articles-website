import Image from "next/image";
import { connection } from "next/server";
import { Search } from "lucide-react";
import { parseFilters, type SearchParams } from "@/lib/utils/filters";
import { SearchTopics } from "./search-topics";
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
            question. Choose one or more topics to narrow your results.
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
            {filters.topics?.length && (
              <input
                type="hidden"
                name="topics"
                value={filters.topics.join(",")}
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
          <SearchTopics filters={filters} view={view} />
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
