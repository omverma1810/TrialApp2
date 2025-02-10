import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const SvgComponent = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    fill="none"
    {...props}>
    <Path
      stroke="#454545"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 8.667a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
    />
    <Path
      stroke="#454545"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 14.667c2.667-2.667 5.333-5.055 5.333-8a5.333 5.333 0 1 0-10.666 0c0 2.945 2.666 5.333 5.333 8Z"
    />
  </Svg>
);
export default SvgComponent;
