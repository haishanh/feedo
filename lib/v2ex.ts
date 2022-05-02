import { marked } from "marked";
import axios from "axios";

const API_BASE = "https://v2trend.vercel.app/api/topics/v1";

const ONE_DAY_MS = 86400000;

export async function generateJsonFeed({ feedUrl }: { feedUrl: string }) {
  const topics = await fetchTopics();
  let items = [];
  for (const t of topics) {
    const html = marked.parse(t.content);
    const i = {
      id: "v2ex:topics:" + t.id,
      url: "https://v2ex.com/t/" + t.id,
      title: t.title,
      content_html: html,
      author: { name: t.author?.username },
    };
    items.push(i);
  }
  return buildJsonFeed(items, feedUrl);
}

function buildJsonFeed(items: any, feedUrl: string) {
  return {
    version: "https://jsonfeed.org/version/1",
    title: "V2ex Topic",
    home_page_url: "https://v2ex.com/",
    feed_url: feedUrl,
    favicon: "https://v2ex.com/favicon.ico",
    items,
  };
}

async function fetchTopics() {
  const toDate = new Date();
  const fromDate = new Date(toDate.valueOf() - ONE_DAY_MS);
  const q = { from: fromDate.toISOString(), to: toDate.toISOString() };
  const qs = new URLSearchParams(q);
  try {
    const res = await axios.get(API_BASE + "?" + qs);
    return res.data;
  } catch (e) {
    console.log(e);
    throw e;
  }
}
