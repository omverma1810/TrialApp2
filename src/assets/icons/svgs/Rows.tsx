import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const SvgComponent = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={35}
    height={35}
    fill="none"
    {...props}>
    <Path
      stroke="#0B2E58"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.375 13.125h26.25m-26.25 8.75h26.25m-19.25-17.5h12.25c2.45 0 3.675 0 4.611.477a4.374 4.374 0 0 1 1.912 1.912c.477.936.477 2.16.477 4.611v12.25c0 2.45 0 3.675-.477 4.611a4.373 4.373 0 0 1-1.912 1.912c-.936.477-2.16.477-4.611.477h-12.25c-2.45 0-3.675 0-4.611-.477a4.374 4.374 0 0 1-1.912-1.912c-.477-.936-.477-2.16-.477-4.611v-12.25c0-2.45 0-3.675.477-4.611a4.375 4.375 0 0 1 1.912-1.912c.936-.477 2.16-.477 4.611-.477Z"
    />
  </Svg>
);
export default SvgComponent;
