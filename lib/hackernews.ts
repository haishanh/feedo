import { pad0 } from "@lib/util";
import * as renderUtil from "@lib/utils/render.util";
import ReactDOMServer from "react-dom/server";
import { createElement as c } from "react";
import axios from "axios";

const API_BASE = "https://hn.algolia.com/api/v1/search";

function buildJsonFeed(item: any, feedUrl: string) {
  return {
    version: "https://jsonfeed.org/version/1",
    title: "Hacker News Daily",
    home_page_url: "https://news.ycombinator.com/",
    feed_url: feedUrl,
    favicon: "https://news.ycombinator.com/favicon.ico",
    items: [item],
  };
}

function render(items: HackerNewsItemSource[]) {
  const e = c(
    "div",
    null,
    c(
      "ol",
      null,
      items.map((item) => renderItem(item))
    )
  );
  return ReactDOMServer.renderToStaticMarkup(e);
}

function renderItem({
  title,
  url,
  points,
  author,
  created_at,
  num_comments,
  objectID,
}: HackerNewsItemSource) {
  const base = "https://news.ycombinator.com";
  const authorUrl = `${base}/user?id=${author}`;
  const commentUrl = `${base}/item?id=${objectID}`;
  return c(
    "li",
    { key: objectID },
    c(
      "p",
      null,
      c("strong", null, renderUtil.link(title, url)),
      c("br", null),
      `${points} points by `,
      renderUtil.link(author, authorUrl),
      ` ${created_at} | `,
      renderUtil.link(`${num_comments} comments`, commentUrl)
    )
  );
}

function buildItem(html: string, id: string) {
  const o = {
    id: "hackernews:v1:daily:" + id,
    // url,
    title: "Hacker News Daily " + id,
    content_html: html,
    author: { name: "Feedo" },
  };
  return o;
}

function roundDatetime(d: Date) {
  d.setUTCHours(0);
  d.setUTCMilliseconds(0);
  d.setUTCMinutes(0);
  d.setUTCSeconds(0);
  return d;
}

export async function daily(feedUrl: string) {
  const n = new Date();

  const YYYY = n.getFullYear();
  const MM = pad0(n.getMonth() + 1, 2);
  const dd = pad0(n.getDate(), 2);

  const id = `${YYYY}-${MM}-${dd}`;

  const end = roundDatetime(n);
  const items = await getHeadlines(end);
  const html = render(items);
  const entry = buildItem(html, id);
  return buildJsonFeed(entry, feedUrl);
}

async function getHeadlines(date: Date) {
  try {
    const endTime = Math.round(date.getTime() / 1000);
    const startTime = endTime - 25 * 60 * 60;
    const qs = `numericFilters=created_at_i>${startTime},created_at_i<${endTime}`;
    const res = await axios.get(API_BASE + "?" + qs);
    const ret: HackerNewsItemSource[] = res.data.hits.slice(0, 10);
    return ret;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

type HackerNewsItemSource = {
  // '2021-07-22T18:32:58.000Z'
  created_at: string;
  title: string;
  url: string;
  author: string;
  points: number;
  // '27922545'
  objectID: string;
  num_comments: number;
};
