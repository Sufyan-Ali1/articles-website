"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

export function NavLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const path = usePathname();
  const params = useSearchParams();
  const [target, query] = href.split("?");
  const type = new URLSearchParams(query).get("article_type");
  const active =
    (path === target ||
      (target === "/articles" && path.startsWith("/articles/"))) &&
    (!type || params.get("article_type") === type);
  return (
    <Link href={href} aria-current={active ? "page" : undefined}>
      {children}
    </Link>
  );
}

export function DesktopNavigation({ children }: { children: ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    const outside = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", outside);
    };
  }, [open]);
  return (
    <nav className="desktop-nav" aria-label="Main navigation">
      <NavLink href="/">Home</NavLink>
      <NavLink href="/articles">Articles</NavLink>
      <div
        className="categories-dropdown"
        ref={ref}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setOpen(false);
        }}
      >
        <button
          ref={trigger}
          type="button"
          aria-expanded={open}
          aria-controls="categories-panel"
          onClick={() => setOpen(!open)}
          className={
            path === "/categories" || path.startsWith("/category/")
              ? "nav-active"
              : ""
          }
        >
          Categories
          <ChevronDown size={14} />
        </button>
        {open && (
          <div
            id="categories-panel"
            className="categories-panel"
            onClick={(event) => {
              if ((event.target as Element).closest("a")) setOpen(false);
            }}
          >
            <div className="eyebrow">Explore by topic</div>
            <div className="category-menu-links">{children}</div>
          </div>
        )}
      </div>
      <NavLink href="/about">About</NavLink>
    </nav>
  );
}
