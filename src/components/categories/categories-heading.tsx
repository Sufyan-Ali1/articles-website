import styles from "./categories.module.css";

export function CategoriesHeading() {
  return (
    <header className={styles.heading}>
      <p className={styles.eyebrow}>Discover by topic</p>
      <h1>Explore Categories</h1>
      <p className={styles.introduction}>
        Start with a topic that matters to you. Find technology guides, car
        buying advice, product comparisons, and practical ideas for everyday
        life.
      </p>
    </header>
  );
}
