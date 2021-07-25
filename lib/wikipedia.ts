import ReactDOMServer from "react-dom/server";
import { createElement as c } from "react";
import get from "dlv";

import { pad0 } from "@lib/util";

// curl -H 'Host: zh.wikipedia.org' \
//   -H 'Cookie: WMF-Last-Access-Global=13-Jan-2021; WMF-Last-Access=13-Jan-2021' \
//   -H 'accept: application/json; charset=utf-8' \
//   -H 'x-wmf-uuid: 64BFEDA6-F109-45BE-AC34-078209CA6A50' \
//   -H 'user-agent: WikipediaApp/6.7.3.1789 (iOS 14.2; Phone)' \
//   -H 'accept-language: zh-cn, en-cn;q=0.5' \
//   'https://zh.wikipedia.org/api/rest_v1/feed/featured/2021/01/13'

import axios, { AxiosInstance, AxiosError } from "axios";

type WikiImage = {
  source: string;
  width: number;
  height: number;
};

type WikiContentUrl = {
  desktop: { page: string };
  mobile: { page: string };
};

type WikipediaMostreadArticle = {
  pageid: number;
  description: string;
  displaytitle: string;
  thumbnail: WikiImage;
  content_urls: WikiContentUrl;
};

type WikiFeatured = {
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
  return render(item);
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

///// renderers

function img(a: WikiImage) {
  return a
    ? c("img", {
        src: a.source,
        width: a.width,
        height: a.height,
      })
    : null;
}

function renderTfa(tfa: WikiFeatured["tfa"] | undefined) {
  if (!tfa) return null;

  return c(
    "section",
    null,
    c("h2", null, "典范条目"),
    c(
      "h3",
      null,
      c("a", { href: get(tfa, "content_urls.desktop.page") }, tfa.displaytitle)
    ),
    img(tfa.thumbnail),
    c("div", { dangerouslySetInnerHTML: { __html: tfa.extract_html } })
  );
}

function renderMostReadArticle(a: WikipediaMostreadArticle) {
  return c(
    "li",
    { key: a.pageid },
    c(
      "div",
      null,
      c(
        "p",
        null,
        c("a", { href: get(a, "content_urls.desktop.page") }, a.displaytitle)
      ),
      c("p", null, a.description),
      img(a.thumbnail)
    )
  );
}

function renderMostRead(mostread: WikiFeatured["mostread"]) {
  const { articles } = mostread;
  return c(
    "section",
    null,
    c("h2", null, "最多阅读"),
    c(
      "ol",
      null,
      articles.slice(0, 10).map((a) => renderMostReadArticle(a))
    )
  );
}

function renderDailyImage(o: WikiFeatured["image"] | undefined) {
  if (!o) return null;
  return c(
    "section",
    null,
    c("h2", null, "每日图片"),
    img(o.thumbnail),
    o.description ? c("p", null, get(o, "description.text")) : null
  );
}

function render(data: WikiFeatured) {
  const e = c(
    "div",
    null,
    renderTfa(data.tfa),
    renderMostRead(data.mostread),
    renderDailyImage(data.image)
  );
  return ReactDOMServer.renderToStaticMarkup(e);
}
