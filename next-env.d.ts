/// <reference types="next" />
/// <reference types="next/types/global" />

declare module "jsonfeed-to-atom" {
  export default function toAtom(x: any): string;
}
