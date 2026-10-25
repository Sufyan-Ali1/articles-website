import Image from "next/image";
import styles from "./brand.module.css";

export function BrandMark() {
  return (
    <Image
      src="/images/brand/ae-mark.svg"
      alt=""
      width={800}
      height={430}
      unoptimized
      className={styles.mark}
    />
  );
}

export function Brand() {
  return (
    <span className={styles.brand} data-brand>
      <BrandMark />
      <span className={styles.wordmark}>
        Ask &amp; <span>Explore</span>
      </span>
    </span>
  );
}
