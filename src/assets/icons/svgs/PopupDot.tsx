import * as React from 'react';
import {Svg, Path} from 'react-native-svg';

const SvgComponent = props => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={12}
    height={12}
    fill="none"
    {...props}>
    <Path
      fill="#9CA3AF"
      d="M6 .072c-3.314 0-6 2.478-6 5.534v.008c0 3.056 2.677 5.525 5.991 5.525H6c3.314 0 6-2.47 6-5.525v-.008C12 2.55 9.323.072 6.009.072H6Z"
    />
  </Svg>
);
export default SvgComponent;
