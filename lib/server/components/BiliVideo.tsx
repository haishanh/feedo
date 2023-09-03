import * as React from "react";

export function BiliVideo(props: { description: string; imageUrl: string; bvid: string }) {
  // https://player.bilibili.com
  const qs = new URLSearchParams({
    bvid: props.bvid,
    page: "1",
    autoplay: "0"
  });
  const iframeSrc = `https://player.bilibili.com/player.html?${qs}`;
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
