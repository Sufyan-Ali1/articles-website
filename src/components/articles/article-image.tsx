"use client";
import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { safeHttpUrl } from "@/lib/utils";
export function ArticleImage({
  src,
  alt,
  preload = false,
  optimized = false,
  className = "",
  sizes = "(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw",
}: {
  src: string | null;
  alt: string;
  preload?: boolean;
  optimized?: boolean;
  className?: string;
  sizes?: string;
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const url = safeHttpUrl(src);
  return (
    <div
      className={`article-image ${className}`}
      style={{
        aspectRatio: "16 / 9",
        width: "100%",
        height: "auto",
        minHeight: 0,
      }}
    >
      {url && failedSource !== url ? (
        <Image
          src={url}
          alt={alt}
          fill
          style={{ objectFit: "contain" }}
          sizes={sizes}
          preload={preload}
          unoptimized={!optimized}
          onError={() => setFailedSource(url)}
        />
      ) : (
        <div className="image-fallback" aria-hidden="true">
          <Image
            src="/images/brand/article-fallback.webp"
            alt=""
            fill
            sizes={sizes}
            style={{ objectFit: "contain" }}
            preload={preload}
          />
        </div>
      )}
      <span className="image-arrow" aria-hidden="true">
        <ArrowUpRight size={20} />
      </span>
    </div>
  );
}
