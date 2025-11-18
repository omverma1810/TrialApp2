import * as React from 'react';
import {Svg, Path, SvgProps} from 'react-native-svg';

const SvgComponent = props => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={18}
    height={23}
    fill="none"
    {...props}>
    <Path
      fill="#DC2626"
      d="M13.979 7.84v12.444H4.024V7.84h9.955ZM12.112.376H5.891L4.646 1.619H.292v2.489h17.42V1.619h-4.355L12.111.375Zm4.355 4.977H1.536v14.932a2.496 2.496 0 0 0 2.488 2.488h9.955a2.496 2.496 0 0 0 2.488-2.488V5.352Z"
    />
  </Svg>
);
export default SvgComponent;
