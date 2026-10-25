"use client";

import { useState } from "react";
import Image from "next/image";
import { safeHttpUrl } from "@/lib/utils";
import { categoryPresentation } from "./category-presentation";
import type { CategoryPreview } from "./category-types";
import styles from "./categories.module.css";

export function CategoryImage({
  category,
  preview,
  preload = false,
}: {
  category: { name: string; slug: string };
  preview?: CategoryPreview;
  preload?: boolean;
}) {
  const [failed, setFailed] = useState<string | null>(null);
  const presentation = categoryPresentation(category);
  const remote = safeHttpUrl(preview?.src);
  const usePreview = Boolean(remote && remote !== failed);
  return (
    <div className={`article-image ${styles.image}`}>
      <Image
        src={usePreview ? remote! : `/images/about/${presentation.image}.webp`}
        alt={
          usePreview
            ? preview?.alt || `${category.name} article preview`
            : presentation.alt
        }
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw"
        style={{ objectFit: "contain" }}
        preload={preload}
        unoptimized={usePreview && !preview?.optimized}
        onError={usePreview ? () => setFailed(remote) : undefined}
      />
    </div>
  );
}
