import * as React from 'react';
import Svg, {SvgProps, G, Rect, Path} from 'react-native-svg';
const SvgComponent = (props: SvgProps) => (
  <Svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} {...props}>
    <G fill="none" stroke="#bb85bb" data-name="Rectangle 1188">
      <Rect width={24} height={24} stroke="none" rx={8} />
      <Rect width={23} height={23} x={0.5} y={0.5} rx={7.5} />
    </G>
    <Path
      fill="#bb85bb"
      d="m10.418 14.611 6.3-6.278.97.966-7.27 7.244-4.364-4.347.969-.966Z"
      data-name="Path 3129"
    />
  </Svg>
);
export default SvgComponent;
