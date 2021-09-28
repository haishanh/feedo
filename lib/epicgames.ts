import axios from "axios";
import fetch from "node-fetch";
import get from "dlv";
import { config } from "@lib/config";
import { Astra } from "@lib/services/astra.service";
import ReactDOMServer from "react-dom/server";
import { EpicGamesOffers } from "@lib/server/components/EpicGamesOfferItem";
import * as date from "@lib/utils/date.util";

const EPICGAMES_PROMOTIONS_URL =
  "https://store-site-backend-static-ipv4.ak.epicgames.com/freeGamesPromotions?locale=zh-CN&country=CN&allowCountries=CN,US";

export async function fetchPromotions() {
  const ret = await axios.get(EPICGAMES_PROMOTIONS_URL);
  return ret.data;
}

type KeyImage = {
  type: string;
  url: string;
};

type PromotionalOffer = {
  // ISO timestamp
  startDate: string;
  endDate: string;
  discountSetting: {
    discountType: "PERCENTAGE";
    discountPercentage: number;
  };
};

type PromotionalOfferWrap = {
  promotionalOffers: PromotionalOffer[];
};

type Promotion = {
  promotionalOffers: PromotionalOfferWrap[];
  upcomingPromotionalOffers: PromotionalOfferWrap[];
};

export type PromoElement = {
  title: string;
  id: string;
  namespace: string;
  description: string;
  // BASE_GAME
  offerType: string;
  keyImages: KeyImage[];
  seller: {
    id: string;
    name: string;
  };
  productSlug: string;
  urlSlug: string;
  url: string | null;
  // key could be
  // publisherName, developerName, etc.
  customAttributes: Array<{ key: string; value: string }>;
  price: {
    totalPrice: {
      fmtPrice: {
        // "¥62.00",
        originalPrice: string;
        // "¥62.00" or "0" (free)
        discountPrice: string;
        intermediatePrice: string;
      };
    };
  };
  promotions: Promotion | null;
};

export function formatPromotions(input: any) {
  const searchStore = get(input, "data.Catalog.searchStore", {});
  const elements: PromoElement[] = searchStore.elements || [];
  let promoElements: PromoElement[] = [];
  for (const e of elements) {
    if (
      e.promotions &&
      ((e.promotions.promotionalOffers && e.promotions.promotionalOffers.length > 0) ||
        (e.promotions.upcomingPromotionalOffers &&
          e.promotions.upcomingPromotionalOffers.length > 0))
    ) {
      promoElements.push(e);
    }
  }
  return promoElements;
}

export function findPromotionStartDate(elements: PromoElement[]) {
  for (let e of elements) {
    const s = findStartDate(e.promotions);
    if (s) return s;
  }
}

function findStartDate(promotions: Promotion | null): string | undefined {
  if (!promotions) return;
  let s = get(promotions, "promotionalOffers.0.promotionalOffers.0.startDate");
  if (s) return s;
  return get(promotions, "upcomingPromotionalOffers.0.promotionalOffers.0.startDate");
}

export function initAtra() {
  return new Astra(
    {
      dbId: config["epicgames.offer.astra.dbId"],
      region: config["epicgames.offer.astra.region"],
      keyspace: config["epicgames.offer.astra.keyspace"],
      appToken: config["epicgames.offer.astra.appToken"],
    },
    fetch
  );
}

export async function generateOfferFeed2({ feedUrl }: { feedUrl: string }) {
  const astra = initAtra();
  const now = new Date();
  const start = new Date(now.getTime() - 2592e6);
  try {
    const ret = await astra.query({
      table: "epicgames_offers",
      where: {
        key: { $eq: "offers" },
        p0: { $gt: start.toISOString() },
      },
    });

    return generateOfferFeed(ret.data, feedUrl);
  } catch (e) {
    const data = e?.response?.data;
    if (data) {
      console.log(data);
    }
    throw e;
  }
}

export function generateOfferFeed(
  data: { count: number; data: Array<{ data: string; p0: string; key: string }> },
  feedUrl: string
) {
  // sort desc with p0 (startDate ISO)
  const rawItems = data.data.sort((x, y) => (x.p0 > y.p0 ? -1 : x.p0 < y.p0 ? 1 : 0));
  let items = [];
  for (const i of rawItems) {
    const promoElements = JSON.parse(i.data);
    const title = makeItemTitle(promoElements, i.p0);
    const html = ReactDOMServer.renderToStaticMarkup(EpicGamesOffers({ promos: promoElements }));
    items.push(buildItem(html, i.p0, title));
  }
  return buildJsonFeed(items, feedUrl);
}

function makeItemTitle(promoElements: PromoElement[], dateStr: string) {
  const titles: string[] = [];
  for (const e of promoElements) {
    if (e.promotions?.promotionalOffers?.[0]) {
      titles.push(e.title);
    }
  }
  return date.fmt1(dateStr) + " " + titles.join("+");
}

function buildJsonFeed(items: any, feedUrl: string) {
  return {
    version: "https://jsonfeed.org/version/1",
    title: "Epic Games Offers",
    home_page_url: "https://www.epicgames.com/store/zh-CN/",
    feed_url: feedUrl,
    favicon: "https://static-assets-prod.epicgames.com/epic-store/static/favicon.ico",
    items,
  };
}

function buildItem(html: string, id: string, title: string) {
  const o = {
    id,
    // url,
    title: title,
    content_html: html,
    author: {
      name: config["site.name"],
      url: config["site.url"],
      avatar: config["site.avatar"],
    },
  };
  return o;
}
