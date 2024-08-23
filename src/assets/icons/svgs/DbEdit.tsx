import * as React from 'react';
import Svg, {Path, SvgProps} from 'react-native-svg';
const SvgComponent = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="none"
    {...props}
  >
    <Path
      stroke="#636363"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M1.636 15.606c.042-.379.064-.568.12-.746.052-.157.124-.306.215-.444.102-.156.237-.29.507-.56L14.583 1.75a2.593 2.593 0 0 1 3.667 3.667L6.144 17.523c-.27.27-.404.404-.56.506a1.828 1.828 0 0 1-.444.214c-.177.058-.367.079-.746.12l-3.102.345.344-3.102Z"
    />
  </Svg>
)
export default SvgComponent
