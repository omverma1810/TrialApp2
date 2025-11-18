import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';

const Play = ({color = '#FFFFFF', ...props}: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    {...props}>
    <Path d="m9 6 9 6-9 6V6Z" fill={color} />
  </Svg>
);

export default Play;
