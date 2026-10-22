"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
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
      <Link
        href="/articles"
        aria-current={path === "/articles" ? "page" : undefined}
      >
        Latest
      </Link>
      <div
        className="topics-dropdown"
        ref={ref}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setOpen(false);
        }}
      >
        <button
          ref={trigger}
          aria-expanded={open}
          aria-controls="topics-panel"
          onClick={() => setOpen(!open)}
          className={path.startsWith("/categor") ? "nav-active" : ""}
        >
          Topics
          <ChevronDown size={14} />
        </button>
        {open && (
          <div
            id="topics-panel"
            className="topics-panel"
            onClick={(event) => {
              if ((event.target as Element).closest("a")) setOpen(false);
            }}
          >
            <div className="eyebrow">Follow your curiosity</div>
            <div className="topics-panel-links">{children}</div>
            <Link className="topics-all" href="/categories">
              Explore every topic <span aria-hidden="true">↗</span>
            </Link>
          </div>
        )}
      </div>
      <Link href="/about" aria-current={path === "/about" ? "page" : undefined}>
        About
      </Link>
    </nav>
  );
}
