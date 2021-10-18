import type { NextApiRequest, NextApiResponse } from "next";
import { Wikipedia } from "@lib/wikipedia";
import toAtom from "jsonfeed-to-atom";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const type = req.query?.type || "json";
  const feedUrl = buildFeedUrl(req);
  const w = new Wikipedia();
  const json = await w.buildFeed(feedUrl);
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
