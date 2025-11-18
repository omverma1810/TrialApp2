import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';

const Upload = ({
  color = '#FFFFFF',
  strokeWidth = 1.5,
  ...props
}: SvgProps & {strokeWidth?: number}) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    {...props}>
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      d="M12 15V5m0 0 4 4m-4-4-4 4M5 19h14"
    />
  </Svg>
);

export default Upload;
