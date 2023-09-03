import axios, { AxiosInstance, AxiosError } from "axios";
import { URLSearchParams } from "url";
import ReactDOMServer from "react-dom/server";
import { BiliVideo } from "./server/components/BiliVideo";
import * as path from "node:path";
import * as crypto from "node:crypto";

const FAVICON = "https://www.bilibili.com/favicon.ico";

const MIXIN_KEY_ENC_TABLE = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42, 19, 29, 28,
  14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54,
  21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34, 44, 52,
];

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
      headers: {
        "Content-Type": "application/json",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
      },
    });
    this.baseUrl = "https://api.bilibili.com";
    this.wbiKeys = null;
  }

  private baseUrl: string;
  private axios: AxiosInstance;
  private wbiKeys?: { imgKey: string; subKey: string };

  // "https://api.bilibili.com/x/space/arc/search?ps=10&tid=0&pn=1&order=pubdate&jsonp=jsonp&mid=7458285"
  private async fetchVideosByMid(mid: string) {
    const { baseUrl } = this;
    const qs = await this.sign({
      ps: "10",
      tid: "0",
      pn: "1",
      order: "pubdate",
      mid,
    });
    const url = `${baseUrl}/x/space/wbi/arc/search?${qs}`;
    try {
      const ret = await this.axios.get(url);
      return ret.data;
    } catch (e) {
      throw this.wrapError(e);
    }
  }

  // https://api.bilibili.com/x/space/acc/info?mid=7458285
  private async fetchUserInfo(mid: string) {
    const { baseUrl } = this;
    const qs = await this.sign({ mid });
    const url = `${baseUrl}/x/space/wbi/acc/info?${qs}`;
    try {
      const ret = await this.axios.get(url);
      return ret.data;
    } catch (e) {
      throw this.wrapError(e);
    }
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
    if (this.wbiKeys) return this.wbiKeys;
    const uri = "/x/web-interface/nav";
    const url = `${this.baseUrl}${uri}`
    const res = await this.axios.get(url);
    const img = res.data.data.wbi_img;
    if (!img) {
      console.log(`GET ${uri} response=${JSON.stringify(res.data)}`);
      throw new Error("data.wbi_img is not expected");
    }
    // both img_url and sub_url is a string like https://i0.hdslb.com/bfs/wbi/123.png
    // the string "123" inside it is the *key*
    this.wbiKeys = {
      imgKey: path.parse(img.img_url).name,
      subKey: path.parse(img.sub_url).name,
    };
    return this.wbiKeys;
  }

  // https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/misc/sign/wbi.md
  // { code: -799, message: '请求过于频繁，请稍后再试', ttl: 1 }
  async sign(query0: Record<string, string>) {
    const keys = await this.getWbiKeys();
    return encWbi(query0, keys.imgKey, keys.subKey);
  }

  public async genFeedFor(mid: string, feedUrl: string) {
    await this.getWbiKeys();
    const [user, arc] = await Promise.all([this.fetchUserInfo(mid), this.fetchVideosByMid(mid)]);
    // not throw for now
    if (user.code !== 0) console.log(`user=${JSON.stringify(user)}`);
    if (arc.code !== 0) console.log(`arc=${JSON.stringify(arc)}`);
    const vlist = arc?.data?.list.vlist ?? [];

    const author = {
      name: user.data.name,
      avatar: user.data.face.replace(/^http:/, "https:"),
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
