"use client";
import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Asterisk } from "lucide-react";
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
  const [failed, setFailed] = useState(false);
  const url = safeHttpUrl(src);
  return (
    <div className={`article-image ${className}`}>
      {url && !failed ? (
        <Image
          src={url}
          alt={alt}
          fill
          sizes={sizes}
          preload={preload}
          unoptimized={!optimized}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="image-fallback" aria-hidden="true">
          <Asterisk size={65} strokeWidth={1} />
          <span>ask & explore</span>
        </div>
      )}
      <span className="image-arrow" aria-hidden="true">
        <ArrowUpRight size={20} />
      </span>
    </div>
  );
}
