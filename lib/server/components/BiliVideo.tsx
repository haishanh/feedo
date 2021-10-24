import * as React from "react";

export function BiliVideo(props: { description: string; imageUrl: string; bvid: string }) {
  const iframeSrc = `https://player.bilibili.com/player.html?bvid=${props.bvid}&page=1`;
  return (
    <>
      <p>{props.description}</p>
      <img src={props.imageUrl} width="750" height="469" />
      <iframe
        src={iframeSrc}
        loading="lazy"
        scrolling="no"
        frameBorder={0}
        allowFullScreen
        width="750"
        height="469"
      />
    </>
  );
}
