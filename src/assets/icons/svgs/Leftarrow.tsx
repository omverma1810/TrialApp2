import * as React from "react"
import Svg, { G, Path, Defs, ClipPath, Rect } from "react-native-svg"
const SvgComponent = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={40}
    height={40}
    fill="none"
    {...props}
  >
    <G clipPath="url(#a)">
      <Path
        fill="#636363"
        d="M23.705 15.41 22.295 14l-6 6 6 6 1.41-1.41-4.58-4.59 4.58-4.59Z"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Rect width={40} height={40} fill="#fff" rx={20} />
      </ClipPath>
    </Defs>
  </Svg>
)
export default SvgComponent
