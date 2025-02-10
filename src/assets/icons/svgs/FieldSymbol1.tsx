import * as React from "react"
import Svg, { Path } from "react-native-svg"
const SvgComponent = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={17}
    height={18}
    fill="none"
    {...props}
  >
    <Path
      fill="#0E3C74"
      d="M.333 15a2.667 2.667 0 1 1 5.334 0 2.667 2.667 0 0 1-5.334 0ZM16 3l-5 2.887V.113L16 3ZM3 14.5h9.95v1H3v-1Zm9.95-5.098h-7v-1h7v1Zm-7-6.902h5.55v1H5.95v-1ZM2.5 5.95A3.45 3.45 0 0 1 5.95 2.5v1A2.45 2.45 0 0 0 3.5 5.95h-1Zm3.45 3.452A3.45 3.45 0 0 1 2.5 5.95h1A2.45 2.45 0 0 0 5.95 8.4v1Zm9.55 2.549a2.55 2.55 0 0 0-2.55-2.55v-1a3.55 3.55 0 0 1 3.55 3.55h-1ZM12.95 14.5a2.55 2.55 0 0 0 2.55-2.55h1a3.55 3.55 0 0 1-3.55 3.55v-1Z"
    />
  </Svg>
)
export default SvgComponent
