import type { MaybePromise } from "@lib/types";
import type { NextApiRequest, NextApiResponse } from "next";

export type SeqHandlerInput<Ctx = unknown> = {
  req: NextApiRequest;
  res: NextApiResponse;
  ctx: Ctx;
};

type IsHandled = boolean;

type SeqHandler<Ctx extends any> = (input: SeqHandlerInput<Ctx>) => MaybePromise<IsHandled | void>;

export function seq<Ctx>(...fns: SeqHandler<Ctx>[]) {
  return async (input: SeqHandlerInput<Ctx>) => {
    for (let fn of fns) {
      const isHandled = await fn(input);
      if (isHandled) break;
    }
  };
}
