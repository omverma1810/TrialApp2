import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';

const SvgComponent = props => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={32}
    height={32}
    fill="none"
    {...props}>
    <Path
      fill="#4B5563"
      fillRule="evenodd"
      d="M.83.455c-.44.439-.44 1.151 0 1.59L6.784 8 .83 13.954a1.125 1.125 0 0 0 1.59 1.591l6.75-6.75a1.128 1.128 0 0 0 .14-1.42 1.124 1.124 0 0 0-.14-.17L2.42.455a1.125 1.125 0 0 0-1.59 0Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgComponent;
