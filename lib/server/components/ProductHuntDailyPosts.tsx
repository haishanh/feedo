import * as React from "react";
import type { ProductHuntPostEdge } from "@lib/services/product-hunt.service";

export function ProductHuntDailyPosts({ edges }: { edges: ProductHuntPostEdge[] }) {
  return (
    <ol>
      {edges.map((e) => {
        return (
          <li key={e.node.id}>
            <ProductHuntPost node={e.node} />
          </li>
        );
      })}
    </ol>
  );
}

function Topics({ edges }: { edges: ProductHuntPostEdge["node"]["topics"]["edges"] }) {
  const len = edges.length;
  return (
    <>
      {edges.map((t, idx) => (
        <span key={t.node.name}>
          {t.node.name}
          {idx !== len - 1 ? ", " : ""}
        </span>
      ))}
    </>
  );
}

function Thumbnail({
  thumbnail,
  name,
}: {
  thumbnail: ProductHuntPostEdge["node"]["thumbnail"];
  name: string;
}) {
  if (!thumbnail) return null;

  if (thumbnail.type === "vidoe") {
    return (
      <p>
        <video src={thumbnail.videoUrl} poster={thumbnail.url} width={60} height={60} />
      </p>
    );
  }

  return (
    <p>
      <img src={thumbnail.url} alt={name + " thumbnail"} style={{ width: 60, height: 60 }} />
    </p>
  );
}

function ProductHuntPost({ node }: { node: ProductHuntPostEdge["node"] }) {
  const postUrl = "https://www.producthunt.com/posts/" + node.slug;
  const productLinks = node.productLinks;
  return (
    <>
      <a href={postUrl}>
        <h2>{node.name}</h2>
      </a>
      <Thumbnail thumbnail={node.thumbnail} name={node.name} />
      <blockquote>{node.tagline}</blockquote>
      <p>{node.description}</p>
      <p>{node?.topics?.edges ? <Topics edges={node.topics.edges} /> : null}</p>
      <p>
        <span>upvotes </span>
        <span>{node.votesCount} </span>
        <span>comments </span>
        <span>{node.commentsCount} </span>
      </p>
      <div>
        <span>🔗 </span>
        {productLinks.map((l, idx) => (
          <a key={l.url} href={l.url}>
            {l.type}
            {idx !== productLinks.length - 1 ? ", " : ""}
          </a>
        ))}
      </div>
    </>
  );
}
