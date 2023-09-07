export type MaybePromise<T> = T | Promise<T>;

export type DribbblePost = {
  id: string;
  url: string;
  title: string;
  image: {
    alt: string;
    src: string;
    srcSet: string;
  };
  author: {
    name: string;
  };
};

export enum DribbbleFeedVersion {
  V1 = "v1",
  V2 = "v2",
}
