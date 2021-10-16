import axios, { AxiosInstance } from "axios";
import { config } from "@lib/config";
import { pad0 } from "@lib/util";
import { roundUTCDatetime } from "@lib/utils/date.util";
import { wrapAxiosError } from "@lib/utils/common.util";
import { ProductHuntDailyPosts } from "@lib/server/components/ProductHuntDailyPosts";
import ReactDOMServer from "react-dom/server";
import get from "dlv";

const ONE_DAY_MS = 864e5;
const BASE_URL = "https://api.producthunt.com/v2/api";
const POSTS_QUERY = `query ($after: DateTime, $before: DateTime) {
  posts(postedAfter: $after, postedBefore: $before, first: 10) {
    edges { node {
        id name slug tagline description commentsCount votesCount createdAt
        topics(first: 3) { edges { node { name } } }
        thumbnail { type videoUrl url(width:120,height:120) }
        productLinks { type url }
      }
    }
  }
}`;

export function initProductHunt() {
  return new ProductHunt(config["producthunt.token"]);
}

class ProductHunt {
  private axios: AxiosInstance;

  constructor(token: string) {
    this.axios = axios.create({
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      baseURL: BASE_URL,
    });
  }

  private async graphql(query: string, variables: Record<string, any>) {
    try {
      return await this.axios.post("/graphql", { query, variables });
    } catch (e) {
      const err = wrapAxiosError(e);
      console.log("ProductHunt.graphql error:", err);
      throw err;
    }
  }

  private async fetchPosts(variables: { before: string; after: string }) {
    return await this.graphql(POSTS_QUERY, variables);
  }

  async buildDailyFeed() {
    const n = new Date();

    const YYYY = n.getFullYear();
    const MM = pad0(n.getMonth() + 1, 2);
    const dd = pad0(n.getDate(), 2);
    const id = `${YYYY}-${MM}-${dd}`;

    const beforeDate = roundUTCDatetime(n);
    const afterDate = new Date(beforeDate.getTime() - ONE_DAY_MS);

    const response = await this.fetchPosts({
      before: beforeDate.toISOString(),
      after: afterDate.toISOString(),
    });

    const postEdges: ProductHuntPostEdge[] = get(response, "data.data.posts.edges", []);
    const html = render(postEdges);
    const entry = buildItem(html, id);
    return buildJsonFeed([entry]);
  }
}

function buildItem(html: string, id: string) {
  const o = {
    id,
    // url,
    title: id,
    content_html: html,
    author: {
      name: config["site.name"],
      url: config["site.url"],
      avatar: config["site.avatar"],
    },
  };
  return o;
}

function buildJsonFeed(items: any[]) {
  return {
    version: "https://jsonfeed.org/version/1",
    title: "Product Hunt Daily",
    home_page_url: "https://www.producthunt.com/",
    feed_url: config["site.url"],
    favicon: "https://ph-static.imgix.net/ph-ios-icon.png",
    items,
  };
}

type ProductHuntPostTopicEdge = {
  node: {
    name: string;
  };
};

type ProductHuntPostMedia = {
  type: "image" | "vidoe";
  url: string;
  videoUrl: string;
};

type ProductHuntPostProductLink = {
  type: string;
  url: string;
};

type ProductHuntPostNode = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  commentsCount: number;
  votesCount: number;
  createdAt: string;
  topics: {
    edges: ProductHuntPostTopicEdge[];
  };
  thumbnail: ProductHuntPostMedia;
  productLinks: ProductHuntPostProductLink[];
};

export type ProductHuntPostEdge = {
  node: ProductHuntPostNode;
};

function render(edges: ProductHuntPostEdge[]) {
  return ReactDOMServer.renderToStaticMarkup(ProductHuntDailyPosts({ edges }));
}
