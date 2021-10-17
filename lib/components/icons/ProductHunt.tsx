import * as React from "react";

export function ProductHunt(props: { width: number; height: number }) {
  return (
    <svg
      width={props.width}
      height={props.height}
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="none" fillRule="evenodd">
        <path
          d="M40 20c0 11.046-8.954 20-20 20S0 31.046 0 20 8.954 0 20 0s20 8.954 20 20"
          fill="#DA552F"
        ></path>
        <path
          d="M22.667 20H17v-6h5.667a3 3 0 010 6m0-10H13v20h4v-6h5.667a7 7 0 100-14"
          fill="#FFF"
        ></path>
      </g>
    </svg>
  );
}
