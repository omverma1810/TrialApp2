import * as React from 'react';
import {Svg, Path, SvgProps} from 'react-native-svg';

const SvgComponent: React.FC<SvgProps> = props => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={43}
    height={64}
    viewBox="0 0 43 64"
    fill="none"
    {...props}>
    <Path
      fill="#1a6dd29a"
      fillRule="evenodd"
      d="M1.856 1.616C3.93-.14 7.294-.14 9.369 1.616l31.875 26.957a4.876 4.876 0 0 1 .66.68 4.426 4.426 0 0 1 .491.777 4.049 4.049 0 0 1 .303.843 3.823 3.823 0 0 1-.127 2.181 4.058 4.058 0 0 1-.398.814 4.41 4.41 0 0 1-.58.732c-.11.114-.226.223-.35.327L9.37 61.884c-2.075 1.754-5.439 1.754-7.513 0-2.075-1.755-2.075-4.6 0-6.354l28.118-23.78L1.856 7.97c-2.075-1.755-2.075-4.6 0-6.354Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgComponent;
