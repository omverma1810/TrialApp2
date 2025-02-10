import * as React from "react"
import { Svg, Path } from 'react-native-svg';
const buttonNavigation = ({width= 48,color = '#1A6DD2', ...props }) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={48}
    fill="none"
    {...props}
  >
    <Path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M18.276 23.163c-.397-.154-.596-.232-.654-.343a.333.333 0 0 1 0-.307c.058-.112.256-.19.653-.344l11.259-4.393c.358-.14.537-.21.651-.172.1.033.177.111.21.21.039.115-.031.294-.17.652L25.83 29.725c-.155.396-.233.595-.344.653a.333.333 0 0 1-.307 0c-.112-.058-.189-.257-.343-.654l-1.752-4.505a.715.715 0 0 0-.072-.155.332.332 0 0 0-.077-.078.715.715 0 0 0-.155-.07l-4.505-1.753Z"
    />
  </Svg>
)
export default buttonNavigation
