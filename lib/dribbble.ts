import axios from "axios";
import ReactDOMServer from "react-dom/server";
import * as cheerio from "cheerio";
import { DribbbleFeedVersion, DribbblePost, JsonFeedItem } from "./types";
import { LazyImage, Posts } from "./server/components/Dribbble";

const POPULAR_PAGE = "https://dribbble.com/shots/popular";
const FAVICON =
  "https://cdn.dribbble.com/assets/dribbble-ball-192-23ecbdf987832231e87c642bb25de821af1ba6734a626c8c259a20a0ca51a247.png";

export async function fetchPopularPage(): Promise<string> {
  const res = await axios.get(POPULAR_PAGE);
  return res.data;
}

export function buildJsonFeed(content: string, feedUrl: string, ver = DribbbleFeedVersion.V1) {
  const posts = extractPosts(content);
  return {
    version: "https://jsonfeed.org/version/1",
    title: "Dribbble Popular Shots",
    home_page_url: POPULAR_PAGE,
    feed_url: feedUrl,
    favicon: FAVICON,
    items: buildItems(posts, ver),
  };
}

function buildItems(posts: DribbblePost[], ver = DribbbleFeedVersion.V1): JsonFeedItem[] {
  if (ver === DribbbleFeedVersion.V2) {
    const first = posts[0];
    const html = ReactDOMServer.renderToStaticMarkup(Posts({ posts }));
    return [{
      id: first.id,
      url: POPULAR_PAGE,
      title: "Dribbble Popular Shots",
      author: {
        name: "Dribbble Users"
      },
      content_html: html,
    }]
  } else {
    return posts.map((o) => {
      const {id, url, title, image, author } = o;
      const html = ReactDOMServer.renderToStaticMarkup(LazyImage(image))
      return { id, url, title, author, content_html: html };
    });
  }
}

// TODO handler errors
function extractPosts(content: string) {
  const $ = cheerio.load(content);
  const list = $(".shots-grid li.shot-thumbnail");
  const items: DribbblePost[] = [];
  list.each(function (_i, elem) {
    const title = $(elem).find(".shot-title").text().trim();
    const uri = $(elem).find(".shot-thumbnail-link").attr("href");
    const url = "https://dribbble.com" + uri;
    const id = uri.slice(7);
    const imgEl = $(elem).find(".shot-thumbnail-base img");
    const image = {
      alt: imgEl.attr("alt"),
      srcSet: imgEl.data("srcset") as string,
      src: imgEl.data("src") as string,
    };
    const authorName = $(elem).find(".user-information .display-name").text().trim();
    const author = { name: authorName };
    const o = { id, url, title, image, author };
    items.push(o);
  });

  return items;
}
