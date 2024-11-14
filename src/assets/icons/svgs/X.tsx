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
      stroke="#E53430"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 7 7 17M7 7l10 10"
    />
  </Svg>
);
export default SvgComponent;
