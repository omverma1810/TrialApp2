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
      d="M14.667 5.5v-.733c0-1.027 0-1.54-.2-1.932a1.833 1.833 0 0 0-.801-.802c-.393-.2-.906-.2-1.933-.2h-1.466c-1.027 0-1.54 0-1.933.2a1.833 1.833 0 0 0-.8.802c-.2.392-.2.905-.2 1.932V5.5m-4.584 0h16.5m-1.833 0v10.267c0 1.54 0 2.31-.3 2.898a2.75 2.75 0 0 1-1.202 1.202c-.588.3-1.358.3-2.898.3H8.983c-1.54 0-2.31 0-2.898-.3a2.75 2.75 0 0 1-1.202-1.202c-.3-.588-.3-1.358-.3-2.898V5.5"
    />
  </Svg>
)
export default SvgComponent
