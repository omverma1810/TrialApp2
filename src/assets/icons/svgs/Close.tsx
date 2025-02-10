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
      stroke={props?.color || '#F7F7F7'}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="m7 7 10 10M7 17 17 7"
    />
  </Svg>
);
export default SvgComponent;
