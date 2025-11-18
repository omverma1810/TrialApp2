import * as React from 'react';
import { Svg, Path, SvgProps } from 'react-native-svg';
interface SvgComponentProps extends SvgProps {}

const SvgComponent: React.FC<SvgComponentProps> = props => (
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
      d="M41.144 1.616c-2.074-1.755-5.438-1.755-7.513 0L1.756 28.573a4.89 4.89 0 0 0-.66.68 4.418 4.418 0 0 0-.491.777 4.054 4.054 0 0 0-.303.843 3.854 3.854 0 0 0-.076 1.317 3.85 3.85 0 0 0 .203.864 4.063 4.063 0 0 0 .398.814 4.403 4.403 0 0 0 .58.732c.11.114.226.223.35.327L33.63 61.884c2.075 1.754 5.439 1.754 7.513 0 2.075-1.755 2.075-4.6 0-6.354L13.026 31.75 41.144 7.97c2.075-1.755 2.075-4.6 0-6.354Z"
      clipRule="evenodd"
    />
  </Svg>
);
export default SvgComponent;
