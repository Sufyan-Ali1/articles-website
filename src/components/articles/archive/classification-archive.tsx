import { Suspense } from "react";
import { connection } from "next/server";
import { classificationCopy } from "@/lib/content/site-copy";
import { getClassification } from "@/lib/api/client";
import { orNotFound } from "@/lib/api/not-found";
import type { SearchParams } from "@/lib/utils/filters";
import { ArchiveHero } from "./archive-hero";
import { ArchiveContent, ArchiveSkeleton } from "./archive-content";
import { ArchiveNewsletter } from "./archive-newsletter";
import styles from "./archive.module.css";

export async function ClassificationArchive({
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
  return (
    <>
      <ArchiveHero
        eyebrow={kind === "tag" ? "Filed under" : "Explore the topic"}
        title={item.name}
        description={classificationCopy(item, kind).description}
      />
      <div className={`${styles.shell} ${styles.content}`}>
        <Suspense fallback={<ArchiveSkeleton showCategories={false} />}>
          <ArchiveContent
            searchParams={searchParams}
            path={`/${kind}/${item.slug}`}
            {...(kind === "tag" ? { tag: item.slug } : { category: item.slug })}
            showCategories={false}
          />
        </Suspense>
        <ArchiveNewsletter />
      </div>
    </>
  );
}
