import type { MaybePromise } from "@lib/types";
import { AxiosError } from "axios";
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

export function wrapAxiosError(e: AxiosError) {
  if (e.response) {
    const msg = JSON.stringify(e.response.data);
    // I am lazy :(
    return new Error(`${e.response.status}:${msg}`);
  } else if (e.request) {
    // network error
    return new Error(`network:error:${e.code}`);
  }
  return e;
}

export function join<T = any>(arr: T[], sep: T) {
  const len = arr.length;
  let result: T[] = [];
  for (let i = 0; i < len; i++) {
    result.push(arr[i]);
    if (i !== len - 1) {
      result.push(sep);
    }
  }
  return result;
}
