import * as React from 'react';
import Svg, {SvgProps, G, Rect} from 'react-native-svg';
const SvgComponent = (props: SvgProps) => (
  <Svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} {...props}>
    <G fill="none" stroke="#535353" data-name="Rectangle 1188">
      <Rect width={24} height={24} stroke="none" rx={8} />
      <Rect width={23} height={23} x={0.5} y={0.5} rx={7.5} />
    </G>
  </Svg>
);
export default SvgComponent;
