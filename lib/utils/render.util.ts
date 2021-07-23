import { createElement } from "react";

export function link(title: string, url: string) {
  return createElement(
    "a",
    { href: url, target: "_blank", rel: "noopener noreferrer" },
    title
  );
}
