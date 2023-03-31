import * as renderUtil from "@lib/utils/render.util";

export function HackerNewsList(items: HackerNewsItemSource[]) {
  return (
    <div>
      <ol>
        {items.map((item) => (
          <Item key={item.objectID} {...item} />
        ))}
      </ol>
    </div>
  );
}

function Item({
  title,
  url,
  points,
  author,
  created_at,
  num_comments,
  objectID,
}: HackerNewsItemSource) {
  const base = "https://news.ycombinator.com";
  const authorUrl = `${base}/user?id=${author}`;
  const commentUrl = `${base}/item?id=${objectID}`;
  return (
    <li>
      <p>
        <strong>{renderUtil.link(title, url)}</strong>
        <br />
        {`${points} points by `}
        {renderUtil.link(author, authorUrl)}
        {` ${created_at} | `}
        {renderUtil.link(`${num_comments} comments`, commentUrl)}
      </p>
    </li>
  );
}

export type HackerNewsItemSource = {
  // '2021-07-22T18:32:58.000Z'
  created_at: string;
  title: string;
  url: string;
  author: string;
  points: number;
  // '27922545'
  objectID: string;
  num_comments: number;
};
