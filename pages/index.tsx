import Head from "next/head";
import s from "../styles/Home.module.css";

const feeds = [
  {
    title: "Bilibili",
    items: [
      {
        key: "atom",
        url: "/api/bilibili/v1/7458285/atom",
      },
    ],
  },
  {
    title: "Dribbble Popular Shots",
    items: [
      {
        key: "atom",
        url: "/api/dribbble/v1/popular/atom",
      },
    ],
  },
  {
    title: "Wikipedia Daily Featured (中文)",
    items: [
      {
        key: "json",
        url: "/api/wikipedia/v1/featured/json",
      },
    ],
  },
];

export default function Home() {
  return (
    <div className={s.root}>
      <Head>
        <title>Feedo</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={s.main}>
        <h1>Available Feeds</h1>
        <ul>
          {feeds.map((feed) => {
            return (
              <li key={feed.title}>
                <h2>{feed.title}</h2>
                <ul>
                  {feed.items.map((item) => {
                    return <li key={item.key}>{item.url}</li>;
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
