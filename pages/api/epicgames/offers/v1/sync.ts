import type { NextApiRequest, NextApiResponse } from "next";
import * as epic from "@lib/epicgames";
// import { seq } from "@lib/utils/common.util";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const promotions = await epic.fetchPromotions();
  const promoElements = epic.formatPromotions(promotions);
  const startDate = epic.findPromotionStartDate(promoElements);

  if (!startDate) {
    throw new Error("startDate should be present");
  }

  const astra = epic.initAtra();

  await astra.addRow({
    table: "epicgames_offers",
    data: {
      key: "offers",
      p0: startDate,
      data: JSON.stringify(promoElements),
    },
  });

  res.json({ elements: promoElements });

  // seq<{ astra?: Astra }>(
  //   ({ ctx }) => {
  //     ctx.astra = initAtra();
  //   },
  //   ({ res }) => {
  //     res.json({ ok: s });
  //   }
  // )({ req, res, ctx: {} });
}
