import type { NextApiRequest, NextApiResponse } from "next";

import * as epic from "@lib/epicgames";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const feedUrl = buildFeedUrl(req);
  const jsonFeed = await epic.generateOfferFeed2({ feedUrl });
  res.setHeader("content-type", "application/json; charset=UTF-8");
  res.setHeader("cache-control", "public, max-age=900");
  res.send(jsonFeed);
}

function buildFeedUrl(req: NextApiRequest) {
  return "https://" + req.headers.host + req.url;
}
