import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { CuriosityArt } from "@/components/shared/curiosity-art";
export default function NotFound() {
  return (
    <div className="container not-found">
      <div>
        <div className="not-found-code">404 / AN UNEXPECTED DETOUR</div>
        <h1>
          A little off
          <br />
          the beaten path.
        </h1>
        <p>
          This page may have moved, or the story is no longer available. Your
          next discovery could be just one question away.
        </p>
        <form
          action="/search"
          method="get"
          className="recovery-search"
          role="search"
        >
          <label htmlFor="recovery-search" className="sr-only">
            Search article titles
          </label>
          <input
            id="recovery-search"
            name="search"
            type="search"
            maxLength={200}
            placeholder="Try a different direction…"
          />
          <button type="submit" aria-label="Search articles">
            <Search size={19} />
          </button>
        </form>
        <Link href="/articles" className="text-link">
          Explore articles
          <ArrowUpRight size={17} />
        </Link>
        <Link href="/categories" className="text-link">
          Browse topics
          <ArrowUpRight size={17} />
        </Link>
      </div>
      <CuriosityArt />
    </div>
  );
}
