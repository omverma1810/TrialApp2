import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';

const Microphone = ({
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
      d="M12 15a3 3 0 0 0 3-3V8a3 3 0 1 0-6 0v4a3 3 0 0 0 3 3Zm6-4a6 6 0 0 1-12 0m6 6v3"
    />
  </Svg>
);

export default Microphone;
