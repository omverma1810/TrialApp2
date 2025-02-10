import * as React from 'react';
import Svg, {Path, SvgProps} from 'react-native-svg';
const SvgComponent = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={17}
    fill="none"
    {...props}>
    <Path
      stroke="#E53430"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10 6.5v3.334m0 3.333h.008M8.846 2.243l-6.854 11.84c-.38.656-.57.984-.542 1.254a.834.834 0 0 0 .338.587c.22.16.599.16 1.358.16h13.708c.759 0 1.138 0 1.357-.16a.834.834 0 0 0 .339-.587c.028-.27-.162-.598-.542-1.255L11.154 2.243c-.38-.654-.569-.981-.816-1.091a.833.833 0 0 0-.677 0c-.247.11-.436.437-.815 1.091Z"
    />
  </Svg>
);
export default SvgComponent;
