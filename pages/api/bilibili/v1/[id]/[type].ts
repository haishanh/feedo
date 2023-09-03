import type { NextApiRequest, NextApiResponse } from "next";
import { getBiliFeed } from "@lib/bilibili";

import toAtom from "jsonfeed-to-atom";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const type = req.query?.type || "json";
  const id = req.query?.id;
  const feedUrl = buildFeedUrl(req);
  const bili = getBiliFeed();
  const json = await bili.genFeedFor(id as string, feedUrl);
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
