import styles from "./categories.module.css";

export function CategoriesHeading() {
  return (
    <header className={styles.heading}>
      <p className={styles.eyebrow}>Discover by topic</p>
      <h1>Explore Categories</h1>
      <p className={styles.introduction}>
        Browse guides by topic on Ask &amp; Explore. Choose a category for
        technology guides, car buying advice, digital safety tips, lifestyle
        ideas, or travel planning.
      </p>
    </header>
  );
}
