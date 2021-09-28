import type { NextApiRequest, NextApiResponse } from "next";

import * as epic from "@lib/epicgames";
import toAtom from "jsonfeed-to-atom";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const feedUrl = buildFeedUrl(req);
  const jsonFeed = await epic.generateOfferFeed2({ feedUrl });
  const atom = toAtom(jsonFeed);
  res.setHeader("content-type", "text/xml; charset=UTF-8");
  res.setHeader("cache-control", "public, max-age=900");
  res.send(atom);
}

function buildFeedUrl(req: NextApiRequest) {
  return "https://" + req.headers.host + req.url;
}
