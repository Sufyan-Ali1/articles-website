"use client";

import {
  createContext,
  useContext,
  useOptimistic,
  useTransition,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";
import type { ArticleFilters } from "@/types/api";
import { filterUrl } from "@/lib/utils/filters";
import styles from "./archive.module.css";

type View = "grid" | "list";
const LayoutContext = createContext<{
  view: View;
  pending: boolean;
  changeView: (view: View, href: string) => void;
} | null>(null);

export function ArchiveLayoutProvider({
  view,
  children,
}: {
  view: View;
  children: ReactNode;
}) {
  const router = useRouter();
  const [optimisticView, setOptimisticView] = useOptimistic(view);
  const [pending, startTransition] = useTransition();
  const changeView = (next: View, href: string) => {
    if (next === optimisticView) return;
    startTransition(() => {
      setOptimisticView(next);
      router.push(href, { scroll: false });
    });
  };
  return (
    <LayoutContext.Provider
      value={{ view: optimisticView, pending, changeView }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function ArchiveLayoutSwitch({
  path,
  filters,
  view = "grid",
}: {
  path: string;
  filters: ArticleFilters;
  view?: View;
}) {
  const layout = useContext(LayoutContext);
  const selected = layout?.view ?? view;
  return (
    <nav
      className={styles.viewSwitch}
      aria-label="Article layout"
      aria-busy={layout?.pending || undefined}
    >
      {(["grid", "list"] as const).map((next) => {
        const href = filterUrl(path, filters, undefined, next);
        return (
          <Link
            key={next}
            href={href}
            aria-label={next === "grid" ? "Grid view" : "List view"}
            aria-current={selected === next ? "true" : undefined}
            prefetch={false}
            scroll={false}
            data-archive-layout-link
            onNavigate={
              layout
                ? (event) => {
                    event.preventDefault();
                    layout.changeView(next, href);
                  }
                : undefined
            }
          >
            {next === "grid" ? (
              <LayoutGrid size={16} aria-hidden="true" />
            ) : (
              <List size={18} aria-hidden="true" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function ArchiveCards({
  view,
  children,
}: {
  view: View;
  children: ReactNode;
}) {
  const layout = useContext(LayoutContext);
  const selected = layout?.view ?? view;
  return (
    <div
      className={`${styles.cards} ${selected === "list" ? "article-list" : ""}`}
      data-view={selected}
    >
      {children}
    </div>
  );
}
