import styles from "./DetailsSection.module.css";

type DetailsSectionType = {
  iconWallet: string;
  iconWalletDetails: any;
  bscWallet: string;
  bscWalletDetails: any;
};
export default function DetailsSection({
  iconWallet,
  iconWalletDetails,
  bscWallet,
  bscWalletDetails
}: DetailsSectionType) {
  return (
    <div className={styles.detailsMain}>
      <p>Test paragraph</p>
    </div>
  );
}
