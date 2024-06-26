import * as React from "react"
import { Svg, Path, SvgProps } from 'react-native-svg';
const dots = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={18}
    height={18}
    fill="none"
    {...props}
  >
    <Path
      fill="#636363"
      d="M9 9.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM9 4.5A.75.75 0 1 0 9 3a.75.75 0 0 0 0 1.5ZM9 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
    />
    <Path
      stroke="#636363"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 9.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM9 4.5A.75.75 0 1 0 9 3a.75.75 0 0 0 0 1.5ZM9 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
    />
  </Svg>
)
export default dots
