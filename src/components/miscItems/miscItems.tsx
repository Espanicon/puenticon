import styles from "./miscItems.module.css";

export function Hr() {
  return <div className={styles.hr}></div>;
}

export function LoadingComponent() {
  return (
    <div className={styles.imgLoading}>
      {[1, 2, 3, 4, 5].map(foo => (
        <div className={styles.imgLoadingItem}></div>
      ))}
    </div>
  );
}
