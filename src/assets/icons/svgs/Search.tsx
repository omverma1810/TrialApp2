import * as React from "react"
import Svg, { Path } from "react-native-svg"
const SvgComponent = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    fill="none"
    {...props}
  >
    <Path
      stroke="#161616"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m14.75 14.75-3.262-3.262M13.25 7.25a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z"
    />
  </Svg>
)
export default SvgComponent
