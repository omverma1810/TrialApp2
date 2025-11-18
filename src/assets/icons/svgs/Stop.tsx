import * as React from 'react';
import Svg, {SvgProps, Rect} from 'react-native-svg';

const Stop = ({color = '#FFFFFF', ...props}: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    {...props}>
    <Rect x={6} y={6} width={12} height={12} rx={2} fill={color} />
  </Svg>
);

export default Stop;
