import axios, { AxiosInstance, AxiosError } from "axios";
import { config } from "@lib/config";
import { URLSearchParams } from "url";
import ReactDOMServer from "react-dom/server";
import { BiliVideo } from "./server/components/BiliVideo";
import * as path from "node:path";
import * as crypto from "node:crypto";
import { Astra } from "./services/astra.service";

const FAVICON = "https://www.bilibili.com/favicon.ico";
const ASTRA_TABLE = "bilibili";
const BULK_INSERT_MUTATION = `mutation m($values: [${ASTRA_TABLE}Input!]) { bulkInsert${ASTRA_TABLE}(values: $values) { value { p0 } } }`;

const MIXIN_KEY_ENC_TABLE = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42, 19, 29, 28,
  14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54,
  21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34, 44, 52,
];

const ONE_DAY_MS = 864e5;
const SIX_HOUR_MS = 216e5;
const TWO_HOUR_MS = 72e5;
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36";

function getMixinKey(orig: string) {
  let temp = "";
  MIXIN_KEY_ENC_TABLE.forEach((n) => {
    temp += orig[n];
  });
  return temp.slice(0, 32);
}

function encWbi(params: Record<string, string>, img_key: string, sub_key: string) {
  const mixin_key = getMixinKey(img_key + sub_key);
  const curr_time = Math.round(Date.now() / 1000);
  const params1 = { ...params, wts: curr_time };
  const query = new URLSearchParams();
  Object.keys(params1)
    .sort()
    .forEach((key) => query.append(key, params1[key]));
  const wbi_sign = md5sum(query.toString() + mixin_key);
  query.append("w_rid", wbi_sign);
  return query;
}

function md5sum(input: string) {
  return crypto.createHash("md5").update(input).digest("hex");
}

export class BilibiliService {
  constructor() {
    this.axios = axios.create({
      headers: { "Content-Type": "application/json", "user-agent": UA },
    });
    this.baseUrl = "https://api.bilibili.com";
  }

  private baseUrl: string;
  private axios: AxiosInstance;
  private getWbiKeysInProgress?: Promise<{ imgKey: string; subKey: string }>;
  private getWbiKeysLastAt = 0;

  // "https://api.bilibili.com/x/space/arc/search?ps=10&tid=0&pn=1&order=pubdate&jsonp=jsonp&mid=7458285"
  public async fetchVideosByMid(mid: string) {
    const { baseUrl } = this;
    const qs = await this.sign({
      ps: "10",
      tid: "0",
      pn: "1",
      order: "pubdate",
      mid,
    });
    const url = `${baseUrl}/x/space/wbi/arc/search?${qs}`;
    let data: { code: number; data: any; message: string };
    try {
      const ret = await this.axios.get(url);
      data = ret.data;
    } catch (e) {
      throw this.wrapError(e);
    }
    if (data.code !== 0) {
      throw new Error(`fetchVideosByMid mid=${mid} response=${JSON.stringify(data)}`);
    }
    return data.data;
  }

  // https://api.bilibili.com/x/space/acc/info?mid=7458285
  public async fetchUserInfo(mid: string) {
    const { baseUrl } = this;
    const qs = await this.sign({ mid });
    const url = `${baseUrl}/x/space/wbi/acc/info?${qs}`;
    let data: { code: number; data: any; message: string };
    try {
      const ret = await this.axios.get(url);
      data = ret.data;
    } catch (e) {
      throw this.wrapError(e);
    }
    if (data.code !== 0) {
      throw new Error(`fetchUserInfo mid=${mid} response=${JSON.stringify(data)}`);
    }
    return data.data;
  }

  wrapError(e: AxiosError) {
    if (e.response) {
      const msg = JSON.stringify(e.response.data);
      // I am lazy :(
      return new Error(`${e.response.status}:${msg}`);
    } else if (e.request) {
      // network error
      return new Error(`network:error:${e.code}`);
    }
    return e;
  }

  async getWbiKeys() {
    const now = Date.now();
    if (this.getWbiKeysInProgress && now - this.getWbiKeysLastAt < TWO_HOUR_MS) {
      return this.getWbiKeysInProgress;
    }
    this.getWbiKeysInProgress = this.getWbiKeysCore();
    this.getWbiKeysLastAt = now;
    return this.getWbiKeysInProgress;
  }

  async getWbiKeysCore() {
    const uri = "/x/web-interface/nav";
    const url = `${this.baseUrl}${uri}`;
    const res = await this.axios.get(url);
    const img = res.data.data.wbi_img;
    if (!img) {
      console.log(`GET ${uri} response=${JSON.stringify(res.data)}`);
      throw new Error("data.wbi_img is not expected");
    }
    // both img_url and sub_url is a string like https://i0.hdslb.com/bfs/wbi/123.png
    // the string "123" inside it is the *key*
    return { imgKey: path.parse(img.img_url).name, subKey: path.parse(img.sub_url).name };
  }

  // https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/misc/sign/wbi.md
  // { code: -799, message: '请求过于频繁，请稍后再试', ttl: 1 }
  async sign(query0: Record<string, string>) {
    const keys = await this.getWbiKeys();
    return encWbi(query0, keys.imgKey, keys.subKey);
  }

  public async genFeedFor(mid: string, feedUrl: string) {
    const [user, arc] = await Promise.all([this.fetchUserInfo(mid), this.fetchVideosByMid(mid)]);
    const vlist = arc?.list.vlist ?? [];
    const author = {
      name: user.name,
      avatar: user.face.replace(/^http:/, "https:"),
    };

    const ret = {
      version: "https://jsonfeed.org/version/1",
      title: author.name + " on bilibili",
      home_page_url: `https://space.bilibili.com/${mid}`,
      feed_url: feedUrl,
      favicon: author.avatar || FAVICON,
      author,
      // authors: [author],
      items: vlist.map(formatVlistItem),
    };
    return ret;
  }
}

class BiliFeed {
  constructor(private bili: BilibiliService, private astra: Astra) {}

  private buildMetaKey(mid: string) {
    return `${mid}-meta`;
  }

  private buildItemKey(mid: string) {
    return `${mid}-item`;
  }

  private async fetchInfoForMid(mid: string, feedUrl: string) {
    const user = await this.bili.fetchUserInfo(mid);
    const author = { name: user.name, avatar: user.face.replace(/^http:/, "https:") };
    const ret = {
      version: "https://jsonfeed.org/version/1",
      title: author.name + " on bilibili",
      home_page_url: `https://space.bilibili.com/${mid}`,
      feed_url: feedUrl,
      favicon: author.avatar || FAVICON,
      author,
    };
    return ret;
  }

  private async fetchItemForMid(mid: string) {
    const arc = await this.bili.fetchVideosByMid(mid);
    const vlist: VlistItem[] = arc?.list.vlist ?? [];
    return vlist.map(formatVlistItem);
  }

  public async genFeedFor(mid: string, feedUrl: string) {
    const metaKey = this.buildMetaKey(mid);
    const res = await this.astra.getRows({ table: "bilibili", key: metaKey });
    const meta = { info: null, infoLastFetchedAt: 0, itemLastFetchedAt: 0 };
    const now = Date.now();
    res.data.data.forEach((item: { key: string; p0: string; data: string }) => {
      switch (item.p0) {
        case "info":
          meta.info = JSON.parse(item.data);
          break;
        case "infoLastFetchedAt":
          meta.infoLastFetchedAt = parseInt(item.data, 10);
          break;
        case "itemLastFetchedAt":
          meta.itemLastFetchedAt = parseInt(item.data, 10);
          break;
      }
    });

    const info =
      meta.info && now - meta.infoLastFetchedAt < ONE_DAY_MS
        ? meta.info
        : await this.fetchInfoForMid(mid, feedUrl).then(async (info) => {
            const values = [
              { key: metaKey, p0: "info", data: JSON.stringify(info) },
              { key: metaKey, p0: "infoLastFetchedAt", data: JSON.stringify(Date.now()) },
            ];
            await this.astra.gql({
              query: BULK_INSERT_MUTATION,
              variables: { values },
            });
            return info;
          });

    const getItemFromDb = async (mid: string) => {
      const itemKey = this.buildItemKey(mid);
      const res = await this.astra.query({
        table: "bilibili",
        where: { key: { $eq: itemKey } },
        pageSize: 20,
      });
      return res.data.data.map((item: { data: string }) => JSON.parse(item.data));
    };

    const fetchAndSaveItem = async (mid: string) => {
      const itemKey = this.buildItemKey(mid);
      const metaKey = this.buildMetaKey(mid);
      const items = await this.fetchItemForMid(mid);
      const values = items.map((item) => ({
        key: itemKey,
        p0: item.date_published.toISOString(),
        data: JSON.stringify(item),
      }));
      values.push({
        key: metaKey,
        p0: "itemLastFetchedAt",
        data: JSON.stringify(Date.now()),
      });

      try {
        await this.astra.gql({
          query: BULK_INSERT_MUTATION,
          variables: { values },
        });
      } catch (e) {
        console.log("Astra GraphQL call");
        console.log(e);
      }
      return items;
    };

    const items =
      now - meta.itemLastFetchedAt < SIX_HOUR_MS
        ? await getItemFromDb(mid)
        : await fetchAndSaveItem(mid);

    return { ...info, items };
  }
}

type VlistItem = {
  pic: string;
  bvid: string;
  description: string;
  title: string;
  created: number;
};

function formatVlistItem(item: VlistItem) {
  const img = item.pic.replace(/^http:\/\//, "https://") + "@750w_469h_90Q_1c.jpg";

  const html = ReactDOMServer.renderToStaticMarkup(BiliVideo({ ...item, imageUrl: img }));

  return {
    id: item.bvid,
    url: `https://www.bilibili.com/video/${item.bvid}`,
    content_html: html,
    title: item.title,
    image: img,
    date_published: new Date(item.created * 1000),
  };
}

let biliFeed: BiliFeed;
export function getBiliFeed() {
  if (biliFeed) return biliFeed;
  biliFeed = new BiliFeed(
    new BilibiliService(),
    new Astra(
      {
        dbId: config["bilibili.astra.dbId"],
        region: config["bilibili.astra.region"],
        keyspace: config["bilibili.astra.keyspace"],
        appToken: config["bilibili.astra.appToken"],
      },
      fetch
    )
  );
  return biliFeed;
}
