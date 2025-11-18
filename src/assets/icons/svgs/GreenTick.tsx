import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';

const SvgComponent = props => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={14}
    fill="none"
    {...props}>
    <Path
      fill="#22C55E"
      d="M6.793 13.646.293 7.65a.872.872 0 0 1 0-1.304l1.414-1.304a1.06 1.06 0 0 1 1.414 0L7.5 9.081l9.379-8.65a1.06 1.06 0 0 1 1.414 0l1.414 1.305c.39.36.39.944 0 1.304l-11.5 10.606a1.06 1.06 0 0 1-1.414 0Z"
    />
  </Svg>
);
export default SvgComponent;
