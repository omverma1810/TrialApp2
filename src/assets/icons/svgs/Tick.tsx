import * as React from 'react';
import Svg, {Path} from 'react-native-svg';

const SvgComponent = ({color, ...props}) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    {...props}>
    <Path
      d="M18.7 7.2c-.4-.4-1-.4-1.4 0l-7.5 7.5-3.1-3.1c-.4-.4-1-.4-1.4 0s-.4 1 0 1.4l3.8 3.8c.2.2.4.3.7.3s.5-.1.7-.3l8.2-8.2c.4-.4.4-1 0-1.4z"
      fill={color}
    />
  </Svg>
);

export default SvgComponent;
