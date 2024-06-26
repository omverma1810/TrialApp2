import * as React from "react"
import Svg, { Path , SvgProps } from "react-native-svg"
const SvgComponent = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={18}
    fill="none"
    {...props}
  >
    <Path
      stroke="#124D95"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.667 8.167h-5M6.333 11.5H4.667m6.666-6.666H4.667m10-.167v8.667c0 1.4 0 2.1-.273 2.635a2.5 2.5 0 0 1-1.092 1.092c-.535.273-1.235.273-2.635.273H5.333c-1.4 0-2.1 0-2.635-.273a2.5 2.5 0 0 1-1.092-1.092c-.273-.535-.273-1.235-.273-2.635V4.667c0-1.4 0-2.1.273-2.635A2.5 2.5 0 0 1 2.698.939C3.233.667 3.933.667 5.333.667h5.334c1.4 0 2.1 0 2.635.272a2.5 2.5 0 0 1 1.092 1.093c.273.535.273 1.235.273 2.635Z"
    />
  </Svg>
)
export default SvgComponent
