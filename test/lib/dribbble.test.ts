import { promises } from "fs";
import { resolve } from "path";
import test from "ava";
import { extractPosts } from "@lib/dribbble";

test("extractPosts", async (t) => {
  const f = resolve(__dirname, "../fixture/dribbble-shots-popular.html");
  const cnt = await promises.readFile(f, "utf8");
  const x = extractPosts(cnt);
  t.deepEqual(x,
    [
      {
        id: "123-some-slug",
        url: "https://dribbble.com/shots/123-some-slug",
        title: "Awesome Design",
        image: {
          alt: 'alt',
          src: 'data-src',
          srcSet: 'data-srcset',
        },
        author: {
          name: "John Doe",
        },
      },
    ]
  );
});

test.todo("some other case");
