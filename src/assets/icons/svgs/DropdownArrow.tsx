import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const SvgComponent = ({width= 20, height= 20, ...props }) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    fill="none"
    {...props}>
    <Path
      stroke="#161616"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m4 6.5 4 4 4-4"
    />
  </Svg>
);
export default SvgComponent;
