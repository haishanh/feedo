import * as React from "react";
import type { PromoElement } from "@lib/epicgames";
import get from "dlv";
import { formatDate } from "@lib/utils/date.util";

export function EpicGamesOffers({ promos }: { promos: PromoElement[] }) {
  const currentPromos: PromoElement[] = [];
  const upcomingPromos: PromoElement[] = [];

  for (let p of promos) {
    let s = get(p, "promotions.promotionalOffers.0.promotionalOffers.0.startDate");
    if (s) {
      currentPromos.push(p);
    } else {
      upcomingPromos.push(p);
    }
  }

  return (
    <>
      {currentPromos[0] ? (
        <>
          <h1>当前限免</h1>
          {currentPromos.map((p) => (
            <EpicGamesOfferItem promo={p} key={p.id} />
          ))}
        </>
      ) : null}
      {upcomingPromos[0] ? (
        <>
          <h1>即将限免</h1>
          {upcomingPromos.map((p) => (
            <EpicGamesOfferItem promo={p} key={p.id} />
          ))}
        </>
      ) : null}
    </>
  );
}

function EpicGamesOfferItem({ promo }: { promo: PromoElement }) {
  const coverUrl = findCoverImage(promo.keyImages);
  const originalPrice = get(promo, "price.totalPrice.fmtPrice.originalPrice");
  const discountPrice = get(promo, "price.totalPrice.fmtPrice.discountPrice");
  return (
    <div>
      <a href={"https://www.epicgames.com/store/zh-CN/p/" + promo.productSlug}>
        <h2>{promo.title}</h2>
      </a>
      {coverUrl ? <img src={coverUrl} /> : null}
      <Price original={originalPrice} discount={discountPrice} />
      <OfferDate promotions={promo.promotions} />
      <p>{promo.description}</p>
      <CustomAttributes items={promo.customAttributes} />
    </div>
  );
}

function Price({ original, discount }: { original: string; discount: string }) {
  if (!original) return null;

  return (
    <p>
      <s>{original}</s>
      <span> </span>
      <span>{discount === "0" ? "Free" : discount}</span>
    </p>
  );
}

function CustomAttributes({ items }: { items: Array<{ key: string; value: string }> }) {
  const filtered = [];
  for (const item of items) {
    if (item.key === "publisherName") {
      filtered.push({ key: "发行商", value: item.value });
    } else if (item.key === "developerName") {
      filtered.push({ key: "开发商", value: item.value });
    }
  }
  return (
    <>
      {filtered.map((item) => (
        <CustomAttribute key={item.key} item={item} />
      ))}
    </>
  );
}

function CustomAttribute({ item }: { item: { key: string; value: string } }) {
  const { key, value } = item;
  return (
    <p>
      <strong>{key}</strong>
      <span> </span>
      <span>{value}</span>
    </p>
  );
}

function OfferDate({ promotions }: { promotions: PromoElement["promotions"] }) {
  if (promotions.promotionalOffers) {
    let s = get(promotions, "promotionalOffers.0.promotionalOffers.0.startDate");
    let e = get(promotions, "promotionalOffers.0.promotionalOffers.0.endDate");
    if (s && e) {
      return (
        <p>
          <strong>限免时间</strong>(北京时间) {formatDate(s)} - {formatDate(e)}
        </p>
      );
    }
  }
  if (promotions.upcomingPromotionalOffers) {
    let o = get(promotions, "upcomingPromotionalOffers.0.promotionalOffers.0");
    let s = o.startDate;
    let e = o.endDate;
    if (s && e) {
      return (
        <p>
          <strong>即将限免</strong>(北京时间) {formatDate(s)} - {formatDate(e)}
        </p>
      );
    }
  }
  return null;
}

function findCoverImage(images: PromoElement["keyImages"]) {
  let x = images.find((i) => i.type === "DieselStoreFrontWide");
  if (x) return x.url;

  // fallback
  x = images.find((i) => i.type === "OfferImageWide");
  if (x) return x.url;
}
