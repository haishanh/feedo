import Head from "next/head";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Feedo</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <h1>Available Feeds</h1>
        <ul>
          <li>
            <h2>Bilibili</h2>
            <p>Examples</p>
            <p>
              <ul>
                <li>https://feedo.vercel.app/api/bilibili/v1/7458285/atom</li>
              </ul>
            </p>
          </li>
          <li>
            <h2>Dribbble</h2>
            <p>Popular Shots</p>
            <p>
              <ul>
                <li>
                  https://feed.haishan.vercel.app/api/dribbble/v1/popular/atom
                </li>
              </ul>
            </p>
          </li>
        </ul>
      </main>
    </div>
  );
}
