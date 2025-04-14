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
      d="M9.17.455a1.125 1.125 0 0 0-1.59 0L.83 7.205A1.114 1.114 0 0 0 .5 8a1.114 1.114 0 0 0 .33.796l6.75 6.75a1.125 1.125 0 0 0 1.59-1.591L3.217 8l5.955-5.955c.439-.439.439-1.151 0-1.59Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgComponent;
