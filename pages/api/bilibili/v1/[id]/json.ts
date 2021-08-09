import type { NextApiRequest, NextApiResponse } from "next";
import { BilibiliService } from "@lib/bilibili";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = req.query?.id;
  const feedUrl = buildFeedUrl(req);
  const bili = new BilibiliService();
  const json = await bili.genFeedFor(id as string, feedUrl);
  res.setHeader("content-type", "application/json; charset=UTF-8");
  res.setHeader("cache-control", "public, max-age=900");
  res.send(json);
}

function buildFeedUrl(req: NextApiRequest) {
  return "https://" + req.headers.host + req.url;
}
