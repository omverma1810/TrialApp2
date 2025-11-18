import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';

const SvgComponent = props => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="none"
    {...props}>
    <Path
      fill="#2563EB"
      d="M7.5 4.5v3h-3v-3h3ZM9 3H3v6h6V3Zm-1.5 9.5v3h-3v-3h3ZM9 11H3v6h6v-6Zm6.5-6.5v3h-3v-3h3ZM17 3h-6v6h6V3Zm-6 8h1.5v1.5H11V11Zm1.5 1.5H14V14h-1.5v-1.5ZM14 11h1.5v1.5H14V11Zm-3 3h1.5v1.5H11V14Zm1.5 1.5H14V17h-1.5v-1.5ZM14 14h1.5v1.5H14V14Zm1.5-1.5H17V14h-1.5v-1.5Zm0 3H17V17h-1.5v-1.5ZM20 5h-2V2h-3V0h5v5Zm0 15v-5h-2v3h-3v2h5ZM0 20h5v-2H2v-3H0v5ZM0 0v5h2V2h3V0H0Z"
    />
  </Svg>
);
export default SvgComponent;
