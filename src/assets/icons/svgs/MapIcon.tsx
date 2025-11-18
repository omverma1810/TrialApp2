import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';

interface MapIconProps extends SvgProps {
  color?: string;
}

const MapIcon = ({color = '#1E1E1E', ...props}: MapIconProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={19}
    fill="none"
    viewBox="0 0 48 48"
    {...props}>
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={4}
      d="M42 20c0 14-18 26-18 26S6 34 6 20a18 18 0 1 1 36 0Z"
    />
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={4}
      d="M24 26a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
    />
  </Svg>
);
export default MapIcon;
