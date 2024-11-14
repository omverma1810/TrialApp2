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
      d="M7.292 20.844c-2.7 1.191-4.375 2.851-4.375 4.687 0 3.624 6.529 6.562 14.583 6.562s14.583-2.938 14.583-6.562c0-1.836-1.675-3.496-4.375-4.687m-1.458-9.167c0 5.926-6.563 8.75-8.75 13.125-2.188-4.375-8.75-7.2-8.75-13.125a8.75 8.75 0 1 1 17.5 0Zm-7.292 0a1.458 1.458 0 1 1-2.916 0 1.458 1.458 0 0 1 2.916 0Z"
    />
  </Svg>
);
export default SvgComponent;
