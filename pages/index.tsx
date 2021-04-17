import s from "@styles/Home.module.css";
import Head from "next/head";
import { Ol } from "@lib/components/Ol";

const feeds = [
  {
    title: "Bilibili",
    items: [
      {
        key: "atom",
        url: "/api/bilibili/v1/{uid}/atom",
        examples: [
          { name: "当下频道", url: "/api/bilibili/v1/32360194/atom" },
          { name: "爱否科技FView", url: "/api/bilibili/v1/7458285/atom" },
          { name: "老师好我叫何同学", url: "/api/bilibili/v1/163637592/atom" },
        ],
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
                    return (
                      <li key={item.key}>
                        <p>{item.url}</p>
                        {item.examples ? (
                          <>
                            <h3>Examples</h3>
                            <Ol>
                              {item.examples.map((a) => {
                                return (
                                  <li key={a.name}>
                                    <a href={a.url}>{a.name}</a>
                                  </li>
                                );
                              })}
                            </Ol>
                          </>
                        ) : null}
                      </li>
                    );
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
