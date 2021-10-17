import s from "@styles/Home.module.scss";
import Head from "next/head";
import { Ol } from "@lib/components/Ol";
import { Footer } from "@lib/components/Footer";
import { CopiableExample } from "@lib/components/CopiableExample";
import { GetServerSideProps } from "next";
import * as icons from "@lib/components/icons/ProductHunt";
import { Feedo as FeedoIcon } from "@lib/components/icons/Feedo";

type FeedItem = { name: string; url: string; feed: string };

type FeedListItem = { title?: string; items: FeedItem[] };

type FeedUrlItem = {
  key: string;
  url: string;
  list?: FeedListItem;
  // items?: FeedItem[];
};

type ImageIcon = {
  /**
   * the url
   */
  u: string;
  w: number;
  h: number;
};

type ComponentIcon<
  Props = {
    width: number;
    height: number;
  }
> = {
  component: React.FunctionComponent<Props>;
  props: Props;
};

type FeedSite = {
  title: string;
  icon?: ImageIcon | ComponentIcon;
  items: FeedUrlItem[];
};

const feeds: FeedSite[] = [
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
        url: "Atom feed /api/bilibili/v1/{uid}/atom",
        list: {
          title: "Examples",
          items: [
            {
              name: "当下频道",
              url: "https://space.bilibili.com/32360194",
              feed: "/api/bilibili/v1/32360194/atom",
            },
          ],
        },
      },
      {
        key: "json",
        url: "JSON feed /api/bilibili/v1/{uid}/json",
        list: {
          title: "Examples",
          items: [
            {
              name: "爱否科技FView",
              url: "https://space.bilibili.com/7458285",
              feed: "/api/bilibili/v1/7458285/json",
            },
          ],
        },
      },
    ],
  },
  {
    title: "Dribbble Popular Shots",
    icon: {
      u: "https://cdn.dribbble.com/assets/dribbble-ball-192-23ecbdf987832231e87c642bb25de821af1ba6734a626c8c259a20a0ca51a247.png",
      w: 48,
      h: 48,
    },
    items: [
      {
        key: "atom",
        url: "/api/dribbble/v1/popular/atom",
        list: {
          title: "Examples",
          items: [
            {
              name: "Popular",
              url: "https://dribbble.com/",
              feed: "/api/dribbble/v1/popular/atom",
            },
          ],
        },
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
        list: {
          title: "Examples",
          items: [
            {
              name: "Daily Featured",
              url: "https://zh.wikipedia.org/wiki/Wikipedia:%E9%A6%96%E9%A1%B5",
              feed: "/api/wikipedia/v1/featured/json",
            },
          ],
        },
      },
    ],
  },
  {
    title: "Hacker News Daily",
    icon: {
      u: "https://news.ycombinator.com/favicon.ico",
      w: 48,
      h: 48,
    },
    items: [
      {
        key: "json",
        url: "/api/hackernews/v1/daily/json",
        list: {
          items: [
            {
              name: "Daily",
              url: "https://news.ycombinator.com/",
              feed: "/api/hackernews/v1/daily/json",
            },
          ],
        },
      },
    ],
  },
  {
    title: "Epic Games",
    icon: {
      // prettier-ignore
      u: "https://cdn2.unrealengine.com/Epic+Games+Node%2Fxlarge_whitetext_blackback_epiclogo_504x512_1529964470588-503x512-ac795e81c54b27aaa2e196456dd307bfe4ca3ca4.jpg",
      w: 48,
      h: 48,
    },
    items: [
      {
        key: "offers",
        url: "Promotional Offers /api/epicgames/offers/v1/{type}",
        list: {
          items: [
            {
              name: "JSON",
              url: "https://www.epicgames.com/store/zh-CN/free-games",
              feed: "/api/epicgames/offers/v1/json",
            },
            {
              name: "Atom",
              url: "https://www.epicgames.com/store/zh-CN/free-games",
              feed: "/api/epicgames/offers/v1/atom",
            },
          ],
        },
      },
    ],
  },
  {
    title: "Product Hunt",
    icon: {
      component: icons.ProductHunt,
      props: {
        width: 48,
        height: 48,
      },
    },
    items: [
      {
        key: "daily",
        url: "Daily Posts /api/producthunt/posts/v1/{type}",
        list: {
          items: [
            {
              name: "JSON",
              url: "https://www.producthunt.com/",
              feed: "/api/producthunt/daily/v1/json",
            },
            {
              name: "Atom",
              url: "https://www.producthunt.com/",
              feed: "/api/producthunt/daily/v1/atom",
            },
          ],
        },
      },
    ],
  },
];

const otherFeeds: FeedSite[] = [
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

        list: {
          title: "Examples",
          items: [
            {
              name: "Gamker攻壳官方频道",
              // prettier-ignore
              url: "https://www.youtube.com/channel/UCLgGLSFMZQB8c0WGcwE49Gw",
              feed: "https://www.youtube.com/feeds/videos.xml?channel_id=UCLgGLSFMZQB8c0WGcwE49Gw",
            },
          ],
        },
      },
    ],
  },
  {
    title: "GitHub",
    icon: {
      u: "https://github.com/fluidicon.png",
      w: 48,
      h: 48,
    },
    items: [
      {
        key: "commits",
        url: "Recent Commits of a repo https://github.com/{user}/{repo}/commits/{branch}.atom",
        list: {
          title: "Examples",
          items: [
            {
              name: "Recent Commits to evanw/esbuild master branch",
              // prettier-ignore
              url: "https://github.com/evanw/esbuild",
              feed: "https://github.com/evanw/esbuild/commits/master.atom",
            },
          ],
        },
      },
      {
        key: "releases",
        url: "Releases of a repo https://github.com/{user}/{repo}/releases.atom",
        list: {
          title: "Examples",
          items: [
            {
              name: "Releases of facebook/react",
              url: "https://github.com/facebook/react",
              feed: "https://github.com/facebook/react/releases.atom",
            },
          ],
        },
      },
    ],
  },
  {
    title: "Reddit",
    icon: {
      u: "https://www.redditstatic.com/desktop2x/img/favicon/apple-icon-180x180.png",
      w: 48,
      h: 48,
    },
    items: [
      {
        key: "subreddit",
        url: "Posts of a subreddit https://www.reddit.com/r/{subreddit}.rss",
        list: {
          title: "Examples",
          items: [
            {
              name: "Posts of r/EarthPorn",
              url: "https://www.reddit.com/r/EarthPorn",
              feed: "https://www.reddit.com/r/EarthPorn.rss",
            },
          ],
        },
      },
      {
        key: "subreddit-hot-posts",
        // prettier-ignore
        url: "Hot posts of a subreddit https://www.reddit.com/r/{subreddit}/hot.rss?limit={limit}",
        list: {
          title: "Examples",
          items: [
            {
              name: "Hot posts of r/EarthPorn",
              url: "https://www.reddit.com/r/EarthPorn",
              feed: "https://www.reddit.com/r/EarthPorn/hot.rss?limit=3",
            },
          ],
        },
      },
    ],
  },
];

export default function Home({ base }: { base: string }) {
  return (
    <div>
      <Head>
        <title>Feedo</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={s.main}>
        <header>
          <FeedoIcon width={150} height={150} />
        </header>
        <h1>Available Feeds</h1>
        <Sites sites={feeds} base={base} />
        <h1>Sites Which Provide Feeds Already</h1>
        <Sites sites={otherFeeds} base={""} />
      </main>
      <Footer />
    </div>
  );
}

function renderFeedLogo(icon: ImageIcon | ComponentIcon) {
  if (!icon) return null;

  if ("u" in icon) {
    return <img className={s.icon} src={icon.u} width={icon.w} height={icon.h} />;
  }

  return icon.component(icon.props);
}

function Sites({ sites, base }: { sites: FeedSite[]; base: string }) {
  return (
    <section>
      {sites.map(({ icon, title, items }) => {
        return (
          <div key={title}>
            <h2>
              {renderFeedLogo(icon)}
              {title}
            </h2>
            <ul className={s.feedUl}>
              {items.map((item: FeedUrlItem) => {
                return (
                  <li key={item.key}>
                    <p>{item.url}</p>
                    {item.list ? (
                      <FeedList title={item.list.title} items={item.list.items} base={base} />
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </section>
  );
}

function FeedList(props: FeedListItem & { base: string }) {
  return (
    <>
      {props.title ? <h3>{props.title}</h3> : null}
      <Ol>
        {props.items.map((a) => {
          return (
            <li key={a.name}>
              <div className={s.listCnt}>
                <a href={a.url}>{a.name}</a>
                <CopiableExample cnt={props.base + a.feed} />
              </div>
            </li>
          );
        })}
      </Ol>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  let base = "https://" + ctx.req.headers.host;
  return {
    props: { base },
  };
};
