import s from "@styles/Home.module.css";
import Head from "next/head";
import { Ol } from "@lib/components/Ol";

type ExampleItem = { name: string; url: string };

type FeedUrlItem = {
  key: string;
  url: string;
  examples?: ExampleItem[];
};

type FeedItem = {
  title: string;
  icon?: { u: string; w: number; h: number };
  items: FeedUrlItem[];
};

const feeds: FeedItem[] = [
  {
    title: "Bilibili",
    icon: {
      // iOS app icon from App Store
      // prettier-ignore
      u: "https://is5-ssl.mzstatic.com/image/thumb/Purple125/v4/ae/ea/4e/aeea4e01-1cb3-7c1d-9c46-bbaf0f412ac3/AppIcon-1x_U007emarketing-0-6-0-0-85-220.png/256x256bb.jpg",
      w: 48,
      h: 48,
    },
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
    icon: {
      u:
        "https://cdn.dribbble.com/assets/dribbble-ball-192-23ecbdf987832231e87c642bb25de821af1ba6734a626c8c259a20a0ca51a247.png",
      w: 48,
      h: 48,
    },
    items: [
      {
        key: "atom",
        url: "/api/dribbble/v1/popular/atom",
      },
    ],
  },
  {
    title: "Wikipedia Daily Featured (中文)",
    icon: {
      u: "https://zh.wikipedia.org/static/apple-touch/wikipedia.png",
      w: 48,
      h: 48,
    },
    items: [
      {
        key: "json",
        url: "/api/wikipedia/v1/featured/json",
      },
    ],
  },
];

const otherFeeds: FeedItem[] = [
  {
    title: "YouTube",
    icon: {
      u: "https://www.youtube.com/s/desktop/3a84d4c0/img/favicon_144.png",
      w: 48,
      h: 48,
    },
    items: [
      {
        key: "Channel",
        url: "https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}",
        examples: [
          {
            name: "Gamker攻壳官方频道",
            // prettier-ignore
            url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCLgGLSFMZQB8c0WGcwE49Gw",
          },
        ],
      },
    ],
  },
  {
    title: "GitHub",
    icon: {
      u: 'https://github.com/fluidicon.png',
      w: 48,
      h: 48,
    },
    items: [
      {
        key: "commits",
        url:
          "Recent Commits of a repo https://github.com/{user}/{repo}/commits/{branch}.atom",
        examples: [
          {
            name: "Recent Commits to evanw/esbuild master branch",
            // prettier-ignore
            url: "https://github.com/evanw/esbuild/commits/master.atom",
          },
        ],
      },
      {
        key: "releases",
        url:
          "Releases of a repo https://github.com/{user}/{repo}/releases.atom",
        examples: [
          {
            name: "Releases of facebook/react",
            url: "https://github.com/facebook/react/releases.atom",
          },
        ],
      },
    ],
  },
  {
    title: "Reddit",
    icon: {
      u:
        "https://www.redditstatic.com/desktop2x/img/favicon/apple-icon-180x180.png",
      w: 48,
      h: 48,
    },
    items: [
      {
        key: "subreddit",
        url: "Posts of a subreddit https://www.reddit.com/r/{subreddit}.rss",
        examples: [
          {
            name: "Posts of r/EarthPorn",
            url: "https://www.reddit.com/r/EarthPorn.rss",
          },
        ],
      },
      {
        key: "subreddit-hot-posts",
        // prettier-ignore
        url: "Hot posts of a subreddit https://www.reddit.com/r/{subreddit}/hot.rss?limit={limit}",
        examples: [
          {
            name: "Hot posts of r/EarthPorn",
            url: "https://www.reddit.com/r/EarthPorn/hot.rss?limit=3",
          },
        ],
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
        <Feeds feeds={feeds} />
        <h1>Some Sites That Already Provide Feeds</h1>
        <Feeds feeds={otherFeeds} />
      </main>
    </div>
  );
}

function Feeds({ feeds }: { feeds: FeedItem[] }) {
  return (
    <ul>
      {feeds.map(({ icon, title, items }) => {
        return (
          <li key={title}>
            <h2>{title}</h2>
            {icon ? (
              <img
                className={s.icon}
                src={icon.u}
                width={icon.w}
                height={icon.h}
              />
            ) : null}
            <ul>
              {items.map((item: FeedUrlItem) => {
                return (
                  <li key={item.key}>
                    <p>{item.url}</p>
                    <Examples examples={item.examples} />
                  </li>
                );
              })}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}

function Examples({ examples }: { examples?: ExampleItem[] }) {
  return examples ? (
    <>
      <h3>Examples</h3>
      <Ol>
        {examples.map((a) => {
          return (
            <li key={a.name}>
              <a href={a.url}>{a.name}</a>
            </li>
          );
        })}
      </Ol>
    </>
  ) : null;
}
