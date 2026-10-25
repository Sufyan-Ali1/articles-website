"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import styles from "./header.module.css";

export function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    const outside = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", outside);
    };
  }, [open]);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    const query = input.current?.value.trim() || "";
    if (!query) {
      event.preventDefault();
      if (input.current) input.current.value = "";
      input.current?.focus();
      return;
    }
    if (input.current) input.current.value = query;
  };
  return (
    <div ref={container} className={styles.searchControl} data-open={open}>
      <form
        id="header-search-panel"
        action="/search"
        method="get"
        role="search"
        aria-label="Search publication"
        className="header-search-form"
        onSubmit={submit}
      >
        <label htmlFor="header-article-search" className="sr-only">
          Search published articles
        </label>
        <input
          ref={input}
          id="header-article-search"
          name="search"
          type="search"
          placeholder="Search articles..."
          maxLength={200}
          required
        />
        <button type="submit" aria-label="Search publication">
          <Search size={18} aria-hidden="true" />
        </button>
      </form>
      <button
        ref={trigger}
        type="button"
        className="header-search"
        aria-label="Open search"
        aria-expanded={open}
        aria-controls="header-search-panel"
        onClick={() => setOpen(!open)}
      >
        <Search size={20} aria-hidden="true" />
      </button>
    </div>
  );
}
