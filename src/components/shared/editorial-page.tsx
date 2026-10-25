import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrandMark } from "./brand";
import { PageHeading } from "./states";
export function EditorialPage({
  eyebrow,
  title,
  description,
  children,
  legal = false,
  summary,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
  legal?: boolean;
  summary?: string;
}) {
  const headings: { id: string; text: string }[] = [];
  const content = Children.map(children, (child) => {
    if (!isValidElement(child) || child.type !== "h2") return child;
    const heading = child as ReactElement<{
      children?: ReactNode;
      id?: string;
    }>;
    const text = Children.toArray(heading.props.children).join("");
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    headings.push({ id, text });
    return cloneElement(heading, { id });
  });
  return (
    <div className={`container ${legal ? "document-page" : ""}`}>
      <PageHeading eyebrow={eyebrow} title={title} description={description} />
      {legal ? (
        <div className="document-layout">
          <aside className="document-toc">
            <span className="eyebrow">On this page</span>
            <nav aria-label="Document contents">
              {headings.map((heading, index) => (
                <a key={heading.id} href={`#${heading.id}`}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {heading.text}
                </a>
              ))}
            </nav>
            <Link className="text-link" href="/contact">
              Have a question?
              <ArrowUpRight size={16} />
            </Link>
          </aside>
          <article className="editorial-copy legal-copy">
            {summary && (
              <div className="document-summary">
                <span className="eyebrow">At a glance</span>
                <p>{summary}</p>
              </div>
            )}
            {content}
            <div className="document-related">
              <span className="eyebrow">More context</span>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms of use</Link>
              <Link href="/disclaimer">Editorial disclosures</Link>
            </div>
          </article>
        </div>
      ) : (
        <div className="editorial-layout">
          <div className="editorial-copy">{content}</div>
          <aside className="editorial-aside">
            <BrandMark />
            <h2>Good questions open new doors.</h2>
            <p>Help shape what we explore next.</p>
            <Link href="/request-article" className="text-link">
              Suggest a topic
              <ArrowUpRight size={16} />
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
