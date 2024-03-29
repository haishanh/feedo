import ReactDOMServer from "react-dom/server";

import { pad0 } from "@lib/util";

// curl -H 'Host: zh.wikipedia.org' \
//   -H 'Cookie: WMF-Last-Access-Global=13-Jan-2021; WMF-Last-Access=13-Jan-2021' \
//   -H 'accept: application/json; charset=utf-8' \
//   -H 'x-wmf-uuid: 64BFEDA6-F109-45BE-AC34-078209CA6A50' \
//   -H 'user-agent: WikipediaApp/6.7.3.1789 (iOS 14.2; Phone)' \
//   -H 'accept-language: zh-cn, en-cn;q=0.5' \
//   'https://zh.wikipedia.org/api/rest_v1/feed/featured/2021/01/13'

import axios, { AxiosInstance, AxiosError } from "axios";
import { WikipediaFeatured } from "./server/components/WikipediaFeatured";

export type WikiImage = {
  source: string;
  width: number;
  height: number;
};

type WikiContentUrl = {
  desktop: { page: string };
  mobile: { page: string };
};

export type WikipediaMostreadArticle = {
  pageid: number;
  description: string;
  displaytitle: string;
  thumbnail: WikiImage;
  content_urls: WikiContentUrl;
};

export type WikiFeatured = {
  tfa?: {
    displaytitle: string;
    extract_html: string;
    thumbnail: WikiImage;
    content_urls: WikiContentUrl;
  };
  mostread: {
    articles: WikipediaMostreadArticle[];
  };
  image: {
    thumbnail: WikiImage;
    description: string;
  };
};

type Id = {
  endpoint: string;
  id: string;
};

function buildId(now: number, offset = 0): Id {
  let t = offset ? new Date(now - offset * 864e5) : new Date(now);
  const y = t.getFullYear();
  const m = pad0(t.getMonth() + 1, 2);
  const d = pad0(t.getDate(), 2);
  return {
    endpoint: `/${y}/${m}/${d}`,
    id: `${y}-${m}-${d}`,
  };
}

export class Wikipedia {
  private axios: AxiosInstance;

  constructor() {
    this.axios = axios.create({
      headers: { "Content-Type": "application/json" },
      baseURL: "https://zh.wikipedia.org/api/rest_v1/feed/featured",
    });
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

  async fetchFeatured(id: { endpoint: string; id: string }) {
    try {
      const ret = await this.axios.get(id.endpoint);
      return ret.data as WikiFeatured;
    } catch (e) {
      this.handleAPIError(e);
    }
  }

  async buildFeed(feedUrl: string) {
    const now = Date.now();
    const ids = [buildId(now, 0), buildId(now, 1), buildId(now, 2)];
    const x = await Promise.all(ids.map((id) => this.fetchFeatured(id)));
    return buildJsonFeed(x, ids, feedUrl);
  }
}

function buildItemContentHtml(item: WikiFeatured) {
  return ReactDOMServer.renderToStaticMarkup(WikipediaFeatured(item));
}

function buildItem(id: Id, item: WikiFeatured) {
  return {
    id: id.id,
    // url
    // author
    title: "Featured " + id.id,
    content_html: buildItemContentHtml(item),
  };
}

function buildJsonFeed(cnt: WikiFeatured[], ids: Id[], feedUrl: string) {
  return {
    version: "https://jsonfeed.org/version/1",
    title: "Wikipedia Featured (中文)",
    home_page_url: "https://zh.wikipedia.org/wiki/Wikipedia:首页",
    feed_url: feedUrl,
    favicon: "https://zh.wikipedia.org/static/apple-touch/wikipedia.png",
    items: cnt.map((item, idx) => buildItem(ids[idx], item)),
  };
}
