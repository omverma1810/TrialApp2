import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const SvgComponent = (props: SvgProps) => (
  <Svg xmlns="http://www.w3.org/2000/svg" width={13} height={25.003} {...props}>
    <Path
      fill="#3d6ad6"
      d="M3.626 14.117H.638c-.47 0-.638-.176-.638-.668V9.658c0-.486.178-.671.642-.671h2.984V6.236a7.08 7.08 0 0 1 .821-3.519A5.034 5.034 0 0 1 7.126.401a6.406 6.406 0 0 1 2.3-.4h2.956c.424 0 .611.2.612.639v3.565c0 .448-.181.628-.614.633-.808.009-1.616 0-2.423.037-.815 0-1.243.414-1.243 1.291-.02.928-.008 1.856-.008 2.818h3.479c.492 0 .661.176.661.691v3.77c0 .507-.158.669-.654.669H8.701v10.174c0 .542-.164.715-.679.715H4.258c-.455 0-.632-.184-.632-.657V14.117Z"
      data-name="Group 26"
    />
  </Svg>
);
export default SvgComponent;
