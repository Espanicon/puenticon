import styles from "./index.module.css";
import { Hr } from "../components/miscItems/miscItems";
import  WalletSelect  from "../components/WalletSelect/WalletSelect";
import { type NextPage } from "next";
import Head from "next/head";
// import Link from "next/link";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>
            <span className={styles.yellowrangeSpan}>Puenticon</span>
          </h1>
          <div className={styles.cardColumn}>
            <div
              className={styles.card}
            >
              <h3 className={styles.cardTitle}>Select wallet:</h3>
              <WalletSelect />
              <WalletSelect chain='bsc' />
              <Hr/>
              <div className={styles.cardText}>
                Just the basics - Everything you need to know to set up your
                database and authentication.
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
