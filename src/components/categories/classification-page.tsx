import Link from "next/link";
import { connection } from "next/server";
import { getClassification, getClassifications } from "@/lib/api/client";
import { orNotFound } from "@/lib/api/not-found";
import { Breadcrumbs, PageHeading } from "@/components/shared/states";
import { ArticleListing } from "@/components/articles/article-listing";
import type { SearchParams } from "@/lib/utils/filters";
export async function ClassificationPage({
  params,
  searchParams,
  kind,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
  kind: "category" | "tag";
}) {
  await connection();
  const { slug } = await params;
  const item = await orNotFound(
    getClassification(kind === "category" ? "categories" : "tags", slug),
  );
  const categories =
    kind === "category" ? await getClassifications("categories") : [];
  const children = categories.filter(
    (c) => c.parent_id === item.id && c.is_active,
  );
  const parent =
    "parent_id" in item
      ? categories.find((c) => c.id === item.parent_id)
      : undefined;
  return (
    <div className={kind === "tag" ? "tag-collection" : "category-collection"}>
      <Breadcrumbs
        items={[
          ...(kind === "category"
            ? [{ label: "Categories", href: "/categories" }]
            : []),
          ...(parent
            ? [{ label: parent.name, href: `/category/${parent.slug}` }]
            : []),
          { label: item.name },
        ]}
      />
      <PageHeading
        eyebrow={kind === "category" ? "Explore the topic" : "Filed under"}
        title={item.name}
        description={item.description || undefined}
      >
        {children.length > 0 && (
          <nav className="category-children" aria-label="Subcategories">
            {children.map((child) => (
              <Link href={`/category/${child.slug}`} key={child.id}>
                {child.name} ↗
              </Link>
            ))}
          </nav>
        )}
      </PageHeading>
      <ArticleListing
        searchParams={searchParams}
        path={`/${kind}/${slug}`}
        {...(kind === "category" ? { category: slug } : { tag: slug })}
      />
    </div>
  );
}
