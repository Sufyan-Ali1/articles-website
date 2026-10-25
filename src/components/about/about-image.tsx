import Image from "next/image";
import styles from "./about.module.css";

export function AboutImage({
  name,
  alt,
  preload = false,
  sizes = "(max-width: 760px) 100vw, 50vw",
}: {
  name: string;
  alt: string;
  preload?: boolean;
  sizes?: string;
}) {
  return (
    <div className={styles.imageFrame}>
      <Image
        src={`/images/about/${name}.webp`}
        alt={alt}
        width={1920}
        height={1080}
        sizes={sizes}
        preload={preload}
      />
    </div>
  );
}
