import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const SvgComponent = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}>
    <Path
      stroke="#161616"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 12H5m0 0 7 7m-7-7 7-7"
    />
  </Svg>
);
export default SvgComponent;
