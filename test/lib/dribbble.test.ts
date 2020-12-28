import { promises } from "fs";
import { resolve } from "path";
import test from "ava";
import { buildJsonFeed } from "@lib/dribbble";

test("buildJsonFeed", async (t) => {
  const f = resolve(__dirname, "../fixture/dribbble-shots-popular.html");
  const cnt = await promises.readFile(f, "utf8");
  const x = buildJsonFeed(cnt, "url");
  t.deepEqual(x, {
    version: "https://jsonfeed.org/version/1",
    title: "Dribbble Popular Shots",
    home_page_url: "https://dribbble.com/shots/popular",
    feed_url: "url",
    favicon:
      "https://cdn.dribbble.com/assets/dribbble-ball-192-23ecbdf987832231e87c642bb25de821af1ba6734a626c8c259a20a0ca51a247.png",
    items: [
      {
        id: "123-some-slug",
        url: "https://dribbble.com/shots/123-some-slug",
        title: "Awesome Design",
        content_html:
          '<img alt="alt" src="data-src" srcset="data-srcset" loading="lazy"></img>',
        author: {
          name: "John Doe",
        },
      },
    ],
  });
});

test.todo("some other case");
