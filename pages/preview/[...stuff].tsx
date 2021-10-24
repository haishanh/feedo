import { useRouter } from "next/router";
import type { GetServerSideProps } from "next";
import s from "./stuff.module.scss";

export default function Preview({
  base,
  feed,
}: {
  base: string;
  feed: {
    title: string;
    home_page_url: string;
    items: Array<{ id: string; title?: string; content_html: string }>;
  };
}) {
  const router = useRouter();
  const { stuff } = router.query;

  return (
    <main className={s.main}>
      <div className={s.title}>
        <h1>{feed.title}</h1>
      </div>
      {feed.items.map((item) => {
        return (
          <section key={item.id} className={s.section}>
            {item.title ? <h2>{item.title}</h2> : null}
            <div dangerouslySetInnerHTML={{ __html: item.content_html }} />
          </section>
        );
      })}
    </main>
  );
}

function deriveBase(host: string) {
  if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) {
    return "http://" + host;
  } else {
    return "https://" + host;
  }
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  let base = deriveBase(ctx.req.headers.host);
  const path = ((ctx.query.stuff as string[]) || []).join("/");
  const url = base + "/api/" + path;
  const res = await fetch(url);
  const feed = await res.json();
  return {
    props: { base, feed },
  };
};
