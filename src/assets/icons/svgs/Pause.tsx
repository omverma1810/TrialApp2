import * as React from 'react';
import Svg, {SvgProps, Rect} from 'react-native-svg';

const Pause = ({color = '#FFFFFF', ...props}: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    {...props}>
    <Rect x={7} y={5} width={4} height={14} rx={1} fill={color} />
    <Rect x={13} y={5} width={4} height={14} rx={1} fill={color} />
  </Svg>
);

export default Pause;
