import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const SvgComponent = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={17}
    fill="none"
    {...props}>
    <Path
      fill="#1A6DD2"
      stroke="#1A6DD2"
      strokeWidth={0.15}
      d="M11.75 1.925h-7.5A2.325 2.325 0 0 0 1.925 4.25v7.5a2.325 2.325 0 0 0 2.325 2.325h5.379c.417 0 .818-.166 1.113-.461l2.872-2.872a1.576 1.576 0 0 0 .461-1.113V4.25a2.325 2.325 0 0 0-2.325-2.325Zm1.008 8.4-2.433 2.433V11a.676.676 0 0 1 .675-.675h1.758Zm.417-.9H11A1.575 1.575 0 0 0 9.425 11v2.175H4.25a1.426 1.426 0 0 1-1.425-1.425v-7.5A1.427 1.427 0 0 1 4.25 2.825h7.5a1.426 1.426 0 0 1 1.425 1.425v5.175Z"
    />
    <Path
      fill="#1A6DD2"
      stroke="#1A6DD2"
      strokeWidth={0.15}
      d="M10.333 5.758H5.666a.408.408 0 1 0 0 .817h4.667a.408.408 0 1 0 0-.817ZM10.333 7.758H5.666a.408.408 0 1 0 0 .817h4.667a.408.408 0 1 0 0-.817Z"
    />
  </Svg>
);
export default SvgComponent;
