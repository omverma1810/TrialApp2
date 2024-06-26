import * as React from "react";
import Svg, { G, Path , } from "react-native-svg";

const SvgComponent = ({ width = 80, height = 80, ...props }) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    width={width}
    height={height}
    viewBox="0 0 255 250"
    {...props}
  >
    <G
      style={{
        stroke: "none",
        strokeWidth: 0,
        strokeDasharray: "none",
        strokeLinecap: "butt",
        strokeLinejoin: "miter",
        strokeMiterlimit: 10,
        fill: "none",
        fillRule: "nonzero",
        opacity: 1,
      }}
    >
      <Path
        d="M45 88c-11.049 0-21.18-2.003-29.021-8.634C6.212 71.105 0 58.764 0 45 0 20.187 20.187 0 45 0s45 20.187 45 45c0 13.765-6.212 26.105-15.979 34.366C66.181 85.998 56.049 88 45 88z"
        style={{
          stroke: "none",
          strokeWidth: 1,
          strokeDasharray: "none",
          strokeLinecap: "butt",
          strokeLinejoin: "miter",
          strokeMiterlimit: 10,
          fill: "#d6d6d6",
          fillRule: "nonzero",
          opacity: 1,
        }}
        transform="matrix(2.81 0 0 2.81 1.407 1.407)"
      />
      <Path
        d="M45 60.71c-11.479 0-20.818-9.339-20.818-20.817 0-11.479 9.339-20.818 20.818-20.818 11.479 0 20.817 9.339 20.817 20.818 0 11.478-9.338 20.817-20.817 20.817z"
        style={{
          stroke: "none",
          strokeWidth: 1,
          strokeDasharray: "none",
          strokeLinecap: "butt",
          strokeLinejoin: "miter",
          strokeMiterlimit: 10,
          fill: "#a5a4a4",
          fillRule: "nonzero",
          opacity: 1,
        }}
        transform="matrix(2.81 0 0 2.81 1.407 1.407)"
      />
      <Path
        d="M45 90a45.021 45.021 0 0 1-29.028-10.625 2 2 0 0 1-.579-2.237C20.034 64.919 31.933 56.71 45 56.71s24.966 8.209 29.607 20.428a2 2 0 0 1-.579 2.237A45.021 45.021 0 0 1 45 90z"
        style={{
          stroke: "none",
          strokeWidth: 1,
          strokeDasharray: "none",
          strokeLinecap: "butt",
          strokeLinejoin: "miter",
          strokeMiterlimit: 10,
          fill: "#a5a4a4",
          fillRule: "nonzero",
          opacity: 1,
        }}
        transform="matrix(2.81 0 0 2.81 1.407 1.407)"
      />
    </G>
  </Svg>
);

export default SvgComponent;
