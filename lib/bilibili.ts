import axios, { AxiosInstance, AxiosError } from "axios";
import { URLSearchParams } from "url";

export class BilibiliService {
  constructor() {
    this.axios = axios.create({
      headers: { "Content-Type": "application/json" },
    });
    this.baseUrl = "https://api.bilibili.com/x/space";
  }

  private baseUrl: string;
  private axios: AxiosInstance;

  // "https://api.bilibili.com/x/space/arc/search?ps=10&tid=0&pn=1&order=pubdate&jsonp=jsonp";
  private async fetchVideosByMid(mid: string) {
    const { baseUrl } = this;
    const qs = new URLSearchParams({
      ps: "10",
      tid: "0",
      pn: "1",
      order: "pubdate",
      mid,
    });
    const url = `${baseUrl}/arc/search?${qs}`;
    try {
      const ret = await this.axios.get(url);
      return ret.data;
    } catch (e) {
      this.handleAPIError(e);
    }
  }

  // https://api.bilibili.com/x/space/acc/info?mid=7458285
  private async fetchUserInfo(mid: string) {
    const { baseUrl } = this;
    const qs = new URLSearchParams({ mid });
    const url = `${baseUrl}/acc/info?${qs}`;
    try {
      const ret = await this.axios.get(url);
      return ret.data;
    } catch (e) {
      this.handleAPIError(e);
    }
  }

  handleAPIError(e: AxiosError) {
    if (e.response) {
      const msg = JSON.stringify(e.response.data);
      // I am lazy :(
      throw new Error(`${e.response.status}:${msg}`);
    } else if (e.request) {
      // network error
      throw new Error(`network:error:${e.code}`);
    }
    throw e;
  }

  public async genFeedFor(mid: string, feedUrl: string) {
    const user = await this.fetchUserInfo(mid);
    const arc = await this.fetchVideosByMid(mid);
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
      favicon: "https://www.bilibili.com/favicon.ico",
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
  const img = "https:" + item.pic + "@750w_469h_90Q_1c.jpg";
  return {
    id: item.bvid,
    url: `https://www.bilibili.com/video/${item.bvid}`,
    content_html: `
<p>${item.description}</p>
<img src="${img}" width="750" height="469" />
<iframe src="//player.bilibili.com/player.html?bvid=${item.bvid}&page=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>`,
    title: item.title,
    image: img,
    date_published: new Date(item.created * 1000),
  };
}
