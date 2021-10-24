import * as React from "react";
import type { WikiFeatured, WikipediaMostreadArticle, WikiImage } from "lib/wikipedia";

import get from "dlv";

function Image(a: WikiImage) {
  if (!a || !a.source) return null;
  return <img src={a.source} width={a.width} height={a.height} />;
}

function Tfa({ tfa }: { tfa: WikiFeatured["tfa"] | undefined }) {
  if (!tfa) return null;

  return (
    <section>
      <h2>典范条目</h2>{" "}
      <h3>
        <a href={get(tfa, "content_urls.desktop.page")}>{tfa.displaytitle}</a>
      </h3>
      <Image {...tfa.thumbnail} />
      <div dangerouslySetInnerHTML={{ __html: tfa.extract_html }} />
    </section>
  );
}

function MostReadArticle(a: WikipediaMostreadArticle) {
  return (
    <li>
      <div>
        <p>
          <a href={get(a, "content_urls.desktop.page")}>{a.displaytitle}</a>
        </p>
        <p>{a.description}</p>
        <Image {...a.thumbnail} />
      </div>
    </li>
  );
}

function MostRead(a: WikiFeatured["mostread"]) {
  const { articles } = a;
  return (
    <section>
      <h2>最多阅读</h2>
      <ol>
        {articles.slice(0, 10).map((a) => (
          <MostReadArticle key={a.pageid} {...a} />
        ))}
      </ol>
    </section>
  );
}

function DailyImage(o: WikiFeatured["image"]) {
  if (!o || !o.thumbnail) return null;
  return (
    <section>
      <h2>每日图片</h2>
      <Image {...o.thumbnail} />
      {o.description ? <p>{get(o, "description.text")}</p> : null}
    </section>
  );
}

export function WikipediaFeatured(props: WikiFeatured) {
  return (
    <div>
      <Tfa tfa={props.tfa} />
      <MostRead {...props.mostread} />
      <DailyImage {...props.image} />
    </div>
  );
}
