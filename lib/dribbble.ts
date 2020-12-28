import axios from "axios";

import cheerio from "cheerio";

const PopularPage = "https://dribbble.com/shots/popular";

export async function fetchPopularPage(): Promise<string> {
  const res = await axios.get(PopularPage);
  return res.data;
}

export function buildJsonFeed(content: string, feedUrl: string) {
  return {
    version: "https://jsonfeed.org/version/1",
    title: "Dribbble Popular Shots",
    home_page_url: "https://dribbble.com/shots/popular",
    feed_url: feedUrl,
    favicon:
      "https://cdn.dribbble.com/assets/dribbble-ball-192-23ecbdf987832231e87c642bb25de821af1ba6734a626c8c259a20a0ca51a247.png",
    items: buildItems(content),
  };
}

// TODO handler errors
function buildItems(content: string) {
  const $ = cheerio.load(content);
  const list = $(".shots-grid li.shot-thumbnail");

  const items = [];

  list.each(function (_i, elem) {
    const title = $(elem).find(".shot-title").text().trim();
    const uri = $(elem).find(".shot-thumbnail-link").attr("href");
    const url = "https://dribbble.com" + uri;
    const id = uri.slice(7);

    const imgEl = $(elem).find(".js-shot-thumbnail-base img");
    const formattedImgStr = buildImageElement(imgEl);

    const authorName = $(elem)
      .find(".user-information .display-name")
      .text()
      .trim();

    const o = {
      id,
      url,
      title,
      content_html: formattedImgStr,
      author: { name: authorName },
    };

    items.push(o);
  });
  return items;
}

type Root = ReturnType<typeof cheerio.load>;

function buildImageElement(e: ReturnType<Root>) {
  const alt = e.attr("alt");
  const srcset = e.data("srcset");
  const src = e.data("src");
  return `<img alt="${alt}" src="${src}" srcset="${srcset}" loading="lazy"></img>`;
}
