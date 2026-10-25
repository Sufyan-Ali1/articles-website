import Link from "next/link";
import { ArrowRight, BookOpen, Home, SearchX, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
export function EmptyState({
  title = "No articles here yet.",
  description = "There are no published articles in this collection yet. Browse another topic or suggest a question for a future guide.",
  search = false,
}: {
  title?: string;
  description?: string;
  search?: boolean;
}) {
  const Icon = search ? SearchX : BookOpen;
  return (
    <div className="empty-state">
      <span className="state-icon">
        <Icon size={29} strokeWidth={1.5} />
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      <Button asChild variant="outline">
        <Link href={search ? "/articles" : "/request-article"}>
          {search ? "Explore all articles" : "Suggest a topic"}
          <ArrowRight size={16} />
        </Link>
      </Button>
    </div>
  );
}
export function Unavailable({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`empty-state ${compact ? "compact-state" : ""}`}
      role="status"
    >
      <span className="state-icon">
        <WifiOff size={27} strokeWidth={1.5} />
      </span>
      <h2>We couldn’t load the latest articles.</h2>
      <p>
        The article library is temporarily unavailable. Please try again in a
        moment.
      </p>
      <a className="text-link" href="">
        Try again <ArrowRight size={16} />
      </a>
    </div>
  );
}
export function GridSkeleton({
  variant = "grid",
}: {
  variant?: "grid" | "article" | "directory";
}) {
  if (variant === "article")
    return (
      <div
        className="article-skeleton"
        role="status"
        aria-label="Loading article"
      >
        <div className="skeleton skeleton-line short" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-image" />
        <div className="skeleton-reading">
          {Array.from({ length: 6 }, (_, i) => (
            <div className="skeleton skeleton-line" key={i} />
          ))}
        </div>
        <span className="sr-only">Loading the article…</span>
      </div>
    );
  return (
    <div
      className={variant === "directory" ? "categories-grid" : "article-grid"}
      aria-label="Loading articles"
      role="status"
    >
      {Array.from({ length: 6 }, (_, i) => (
        <div className="skeleton-card" key={i}>
          <div className="skeleton skeleton-image" />
          <div className="skeleton skeleton-line short" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line short" />
        </div>
      ))}
      <span className="sr-only">Loading articles…</span>
    </div>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div className="eyebrow">
        <span className="blue-dot" />
        {eyebrow}
      </div>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
      {children}
    </div>
  );
}
export function Breadcrumbs({
  items,
  homeIcon = false,
}: {
  items: { label: string; href?: string }[];
  homeIcon?: boolean;
}) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <ol>
        <li>
          <Link href="/">
            {homeIcon && <Home size={13} aria-hidden="true" />}Home
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i}>
            <span aria-hidden="true">/</span>
            {item.href ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
