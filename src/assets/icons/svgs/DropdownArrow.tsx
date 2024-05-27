import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';

const SvgComponent = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={12.728}
    height={7.778}
    {...props}>
    <Path
      d="M6.364 4.95 11.314 0l1.414 1.414-6.364 6.364L0 1.414 1.414 0Z"
      fill="#fff"
    />
  </Svg>
);

export default SvgComponent;
