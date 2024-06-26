import * as React from 'react';
import Svg, {Path, SvgProps} from 'react-native-svg';
const SvgComponent = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={18}
    height={18}
    fill="none"
    {...props}>
    <Path
      stroke="#124D95"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 4v5l3.333 1.667m5-1.667A8.333 8.333 0 1 1 .667 9a8.333 8.333 0 0 1 16.666 0Z"
    />
  </Svg>
);
export default SvgComponent;
