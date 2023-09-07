import { DribbblePost } from "@lib/types";
import * as React from "react";

export function LazyImage(props: { alt: string; srcSet: string; src: string }) {
  return <img alt={props.alt} src={props.src} srcSet={props.srcSet} loading="lazy" />;
}

export function Posts(props: { posts: DribbblePost[] }) {
  return (
    <ul>
      {props.posts.map((p) => {
        return (
          <li key={p.id}>
            <a href={p.url}>
              <h2>{p.title}</h2>
            </a>
            <small>{p.author.name}</small>
            <LazyImage {...p.image} />
          </li>
        );
      })}
    </ul>
  );
}
