import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const SvgComponent = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={25}
    height={24}
    fill="none"
    {...props}>
    <Path
      fill="#fff"
      d="M12.484 2.25a9.75 9.75 0 1 0 9.75 9.75 9.761 9.761 0 0 0-9.75-9.75Zm4.281 8.03-5.25 5.25a.75.75 0 0 1-1.061 0l-2.25-2.25a.75.75 0 1 1 1.061-1.06l1.72 1.72 4.719-4.72a.75.75 0 1 1 1.061 1.06Z"
    />
  </Svg>
);
export default SvgComponent;
