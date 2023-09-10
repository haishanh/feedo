import type { NextApiRequest, NextApiResponse } from "next";
import { getDribbbleFeed } from "@lib/dribbble";

import toAtom from "jsonfeed-to-atom";
import { DribbbleFeedVersion } from "@lib/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const type = req.query?.type || "json";
  const feedUrl = buildFeedUrl(req);
  const df = getDribbbleFeed();
  const json = await df.gen(feedUrl, DribbbleFeedVersion.V2);
  res.setHeader("cache-control", "public, max-age=900");
  if (type === "atom") {
    const atom = toAtom(json);
    res.setHeader("content-type", "text/xml; charset=UTF-8");
    res.send(atom);
  } else {
    res.setHeader("content-type", "application/json; charset=UTF-8");
    res.send(json);
  }
}

function buildFeedUrl(req: NextApiRequest) {
  return "https://" + req.headers.host + req.url;
}
