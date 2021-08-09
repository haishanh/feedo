import type { NextApiRequest, NextApiResponse } from "next";
import { BilibiliService } from "@lib/bilibili";

import jsonfeedToAtom from "jsonfeed-to-atom";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { id },
  } = req;
  const feedUrl = buildFeedUrl(req);
  const bili = new BilibiliService();
  const ret = await bili.genFeedFor(id as string, feedUrl);
  const atom = toAtom(ret);
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
