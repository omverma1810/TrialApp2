import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const SvgComponent = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={12}
    height={13}
    fill="none"
    {...props}>
    <Path
      stroke="#1A6DD2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M1.438 9.558c.023-.207.034-.31.066-.407a1 1 0 0 1 .116-.242c.056-.085.13-.159.277-.306L8.5 2a1.414 1.414 0 1 1 2 2l-6.603 6.603c-.147.147-.22.22-.306.277a.998.998 0 0 1-.242.116c-.097.031-.2.043-.407.066l-1.692.188.188-1.692Z"
    />
  </Svg>
);
export default SvgComponent;
