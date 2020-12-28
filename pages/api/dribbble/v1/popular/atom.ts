import type { NextApiRequest, NextApiResponse } from "next";
import { fetchPopularPage, buildJsonFeed } from "@lib/dribbble";

import jsonfeedToAtom from "jsonfeed-to-atom";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const feedUrl = buildFeedUrl(req);
  const html = await fetchPopularPage();
  const json = buildJsonFeed(html, feedUrl);
  const atom = toAtom(json);
  res.setHeader("content-type", "text/xml; charset=UTF-8");
  res.setHeader("cache-control", "public, max-age=900");
  res.send(atom);
}

function buildFeedUrl(req: NextApiRequest) {
  return "https://" + req.headers.host + req.url;
}

function toAtom(payload: any) {
  return jsonfeedToAtom(payload);
}
