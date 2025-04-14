import * as React from 'react';
import Svg, {Path} from 'react-native-svg';

const SvgComponent = props => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={390}
    height={1}
    fill="none"
    {...props}>
    <Path fill="#000" fillOpacity={0.24} d="M0 0h390v1H0V0Z" />
  </Svg>
);
export default SvgComponent;
