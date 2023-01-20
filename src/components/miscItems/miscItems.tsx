import styles from "./miscItems.module.css";

export function Hr() {
  return <div className={styles.hr}></div>;
}

export function LoadingComponent() {
  return (
    <div className={styles.imgLoading}>
      {[1, 2, 3, 4, 5].map((foo, index) => (
        <div className={styles.imgLoadingItem} key={`foo-key-${index}`}></div>
      ))}
    </div>
  );
}
