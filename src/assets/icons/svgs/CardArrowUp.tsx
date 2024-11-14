import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const SvgComponent = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={25}
    fill="none"
    {...props}>
    <Path
      stroke="#161616"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m18 15.5-6-6-6 6"
    />
  </Svg>
);
export default SvgComponent;
