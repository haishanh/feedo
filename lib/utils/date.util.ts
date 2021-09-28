import { pad0 } from "@lib/util";

let MONTH_SHORT: string[];
let CN_TIMEZONE_OFFSET_MS = 288e5; // 8hours

function initMonthShort() {
  MONTH_SHORT = "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_");
}

// 2021 Sep 12 21:00 PM
export function formatDate(a: string) {
  if (!MONTH_SHORT) {
    initMonthShort();
  }

  const date = new Date(a);
  const d = new Date(date.getTime() + CN_TIMEZONE_OFFSET_MS);

  const year = d.getUTCFullYear();
  const month = MONTH_SHORT[d.getUTCMonth()];
  const day = d.getUTCDate();
  const hour = d.getUTCHours();
  const minute = d.getUTCMinutes();
  return `${year} ${month} ${day} ${pad0(hour, 2)}:${pad0(minute, 2)} ${hour > 12 ? "PM" : "AM"}`;
}

// 2021-07-22
export function fmt1(a: string) {
  const d = new Date(a);

  const YYYY = d.getFullYear();
  const MM = pad0(d.getMonth() + 1, 2);
  const dd = pad0(d.getDate(), 2);
  return `${YYYY}-${MM}-${dd}`;
}
