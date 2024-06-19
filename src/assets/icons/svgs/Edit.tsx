import * as React from "react"
import Svg, { Path } from "react-native-svg"
const SvgComponent = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={22}
    height={22}
    fill="none"
    {...props}
  >
    <Path
      stroke="#636363"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M2.636 16.606c.042-.379.063-.568.12-.746.052-.157.124-.306.215-.444.102-.156.237-.29.507-.56L15.583 2.75a2.593 2.593 0 0 1 3.667 3.667L7.144 18.523c-.27.27-.404.404-.56.506a1.828 1.828 0 0 1-.444.214c-.177.058-.367.079-.746.12l-3.102.345.344-3.102Z"
    />
  </Svg>
)
export default SvgComponent
