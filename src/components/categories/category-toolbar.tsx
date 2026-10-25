"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { Search, X } from "lucide-react";
import styles from "./categories.module.css";

type SearchProps = {
  query: string;
  onQueryChange: (query: string) => void;
};

function CategorySearchInput({
  query,
  onQueryChange,
  id,
  inputRef,
}: SearchProps & {
  id: string;
  inputRef: RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className={styles.search}>
      <Search size={22} strokeWidth={1.8} aria-hidden="true" />
      <label htmlFor={id} className="sr-only">
        Search categories
      </label>
      <input
        ref={inputRef}
        id={id}
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search categories..."
        aria-controls="category-results"
      />
      {query && (
        <button
          className={styles.clearSearch}
          type="button"
          onClick={() => {
            onQueryChange("");
            inputRef.current?.focus({ preventScroll: true });
          }}
          aria-label="Clear search"
        >
          <X size={17} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export function CategoryToolbar({
  onFloatingChange,
  ...props
}: SearchProps & {
  onFloatingChange?: (floating: boolean) => void;
}) {
  const [floating, setFloating] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const toolbar = toolbarRef.current;
    if (!toolbar || typeof IntersectionObserver === "undefined") return;
    const header = document.querySelector<HTMLElement>(".site-header");
    let observer: IntersectionObserver;
    let headerHeight = -1;
    const observe = () => {
      const height = Math.ceil(header?.getBoundingClientRect().height ?? 0);
      if (height === headerHeight) return;
      headerHeight = height;
      observer?.disconnect();
      observer = new IntersectionObserver(
        ([entry]) => {
          const next =
            !entry.isIntersecting && entry.boundingClientRect.bottom <= height;
          setFloating(next);
          onFloatingChange?.(next);
        },
        { rootMargin: `-${height}px 0px 0px 0px`, threshold: 0 },
      );
      observer.observe(toolbar);
    };
    observe();
    const headerResize =
      header && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(observe)
        : null;
    if (header) headerResize?.observe(header);
    window.addEventListener("resize", observe);
    return () => {
      observer?.disconnect();
      headerResize?.disconnect();
      window.removeEventListener("resize", observe);
    };
  }, [onFloatingChange]);

  const updateQuery = (query: string) => {
    const toolbar = toolbarRef.current;
    if (floating && toolbar) {
      const headerHeight =
        document.querySelector(".site-header")?.getBoundingClientRect()
          .height ?? 0;
      // Keep the original field above the navbar while bringing matches into view.
      const resultsTop =
        window.scrollY +
        toolbar.getBoundingClientRect().bottom -
        headerHeight +
        12;
      if (window.scrollY > resultsTop)
        window.scrollTo({ top: resultsTop, behavior: "instant" });
    }
    props.onQueryChange(query);
  };

  return (
    <div
      ref={toolbarRef}
      className={styles.toolbar}
      data-category-search-anchor
    >
      <div
        className={styles.searchSurface}
        role="search"
        aria-label="Search category directory"
        data-category-search
        data-floating={floating}
      >
        <CategorySearchInput
          {...props}
          onQueryChange={updateQuery}
          id="category-search"
          inputRef={inputRef}
        />
      </div>
    </div>
  );
}
