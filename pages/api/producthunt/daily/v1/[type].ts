import type { NextApiRequest, NextApiResponse } from "next";
import toAtom from "jsonfeed-to-atom";
import { initProductHunt } from "@lib/services/product-hunt.service";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const type = req.query?.type || "json";
  const ph = initProductHunt();
  const jsonFeed = await ph.buildDailyFeed();
  // 30 min cache
  res.setHeader("cache-control", "public, max-age=1800");
  if (type === "atom") {
    const atom = toAtom(jsonFeed);
    res.setHeader("content-type", "text/xml; charset=UTF-8");
    res.send(atom);
  } else {
    res.setHeader("content-type", "application/json; charset=UTF-8");
    res.send(jsonFeed);
  }
}
