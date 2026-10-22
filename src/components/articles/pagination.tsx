import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ArticleFilters, Meta } from "@/types/api";
import { filterUrl } from "@/lib/utils/filters";
export function Pagination({
  meta,
  filters,
  path,
  view,
}: {
  meta: Meta;
  filters: ArticleFilters;
  path: string;
  view?: "grid" | "list";
}) {
  if (meta.pages <= 1) return null;
  const pages = [
    ...new Set([1, meta.page - 1, meta.page, meta.page + 1, meta.pages]),
  ].filter((p) => p > 0 && p <= meta.pages);
  return (
    <nav className="pagination" aria-label="Article pagination">
      {meta.page > 1 ? (
        <Link
          className="pagination-direction"
          href={filterUrl(path, filters, meta.page - 1, view)}
        >
          <ArrowLeft size={17} />
          <span>Previous</span>
        </Link>
      ) : (
        <span />
      )}
      <div className="page-numbers">
        {pages.map((page, i) => (
          <span key={page}>
            {i > 0 && page - pages[i - 1] > 1 && (
              <span className="page-ellipsis">…</span>
            )}
            <Link
              href={filterUrl(path, filters, page, view)}
              aria-current={page === meta.page ? "page" : undefined}
              aria-label={`Page ${page}`}
            >
              {page}
            </Link>
          </span>
        ))}
      </div>
      {meta.page < meta.pages ? (
        <Link
          className="pagination-direction"
          href={filterUrl(path, filters, meta.page + 1, view)}
        >
          <span>Next</span>
          <ArrowRight size={17} />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
