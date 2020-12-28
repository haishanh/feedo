import type { NextApiRequest, NextApiResponse } from "next";
import { fetchPopularPage, buildJsonFeed } from "@lib/dribbble";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const feedUrl = buildFeedUrl(req);
  const html = await fetchPopularPage();
  const json = buildJsonFeed(html, feedUrl);
  res.setHeader("content-type", "application/json; charset=UTF-8");
  res.setHeader("cache-control", "public, max-age=900");
  res.json(json);
}

function buildFeedUrl(req: NextApiRequest) {
  return "https://" + req.headers.host + req.url;
}
