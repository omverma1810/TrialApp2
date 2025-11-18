import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';

interface SvgComponentProps extends SvgProps {}

const SvgComponent: React.FC<SvgComponentProps> = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={48}
    height={24}
    fill="none"
    {...props}>
    <Path
      fill="#1976D2"
      d="M12 0C5.373 0 0 5.373 0 12v.018C0 18.645 5.373 24 12 24h24c6.627 0 12-5.355 12-11.982V12c0-6.627-5.373-12-12-12H12Z"
    />
  </Svg>
);
export default SvgComponent;
