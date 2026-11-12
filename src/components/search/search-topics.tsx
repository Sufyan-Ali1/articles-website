"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CarFront,
  Check,
  Laptop,
  Leaf,
  Plane,
  ShieldCheck,
  ShoppingCart,
} from "lucide-react";
import type { ArticleFilters } from "@/types/api";
import { filterUrl } from "@/lib/utils/filters";
import { searchTopics, selectedSearchTopics } from "@/lib/utils/search-topics";
import styles from "./search.module.css";

const icons = [Laptop, CarFront, ShoppingCart, Leaf, ShieldCheck, Plane];

export function SearchTopics({
  filters,
  view,
}: {
  filters: ArticleFilters;
  view?: "grid" | "list";
}) {
  const router = useRouter();
  const [selected, setSelected] = useOptimistic(selectedSearchTopics(filters));
  const [pending, startTransition] = useTransition();
  const all = !selected.length || selected.includes("all");
  const toggle = (key: string) => {
    let topics =
      key === "all" ? ["all"] : selected.filter((topic) => topic !== "all");
    if (key !== "all")
      topics = topics.includes(key)
        ? topics.filter((topic) => topic !== key)
        : [...topics, key];
    if (!topics.length) topics = ["all"];
    if (!topics.includes("all")) {
      topics = searchTopics
        .filter((topic) => topics.includes(topic.key))
        .map((topic) => topic.key);
    }
    startTransition(() => {
      setSelected(topics);
      router.push(
        filterUrl(
          "/search",
          { ...filters, category: undefined, article_type: undefined, topics },
          1,
          view,
        ),
        { scroll: false },
      );
    });
  };
  return (
    <div className={styles.topicFilters}>
      <p className={styles.topicHint}>
        Topics <span>Choose any · Matches any selected topic</span>
      </p>
      <div
        className={styles.shortcuts}
        role="group"
        aria-label="Search topics"
        aria-busy={pending || undefined}
      >
        <button type="button" aria-pressed={all} onClick={() => toggle("all")}>
          <Check size={16} aria-hidden="true" /> All
        </button>
        {searchTopics.map((topic, index) => {
          const Icon = icons[index];
          return (
            <button
              key={topic.key}
              type="button"
              aria-pressed={!all && selected.includes(topic.key)}
              onClick={() => toggle(topic.key)}
            >
              <Icon size={16} aria-hidden="true" />
              {topic.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
