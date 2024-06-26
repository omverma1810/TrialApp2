import * as React from "react"
import { Svg, Path } from 'react-native-svg';
const iconNotes = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={18}
    height={18}
    fill="none"
    {...props}
  >
    <Path
      fill="#1A6DD2"
      stroke="#1A6DD2"
      strokeWidth={0.6}
      d="M12.75 3h-7.5A2.25 2.25 0 0 0 3 5.25v7.5A2.25 2.25 0 0 0 5.25 15h5.379a1.5 1.5 0 0 0 1.06-.44l2.872-2.87A1.5 1.5 0 0 0 15 10.628V5.25A2.25 2.25 0 0 0 12.75 3Zm-1.5 10.94V12a.75.75 0 0 1 .75-.75h1.94l-2.69 2.69Zm3-3.44H12a1.5 1.5 0 0 0-1.5 1.5v2.25H5.25a1.502 1.502 0 0 1-1.5-1.5v-7.5a1.502 1.502 0 0 1 1.5-1.5h7.5a1.502 1.502 0 0 1 1.5 1.5v5.25Z"
    />
    <Path
      fill="#1A6DD2"
      stroke="#1A6DD2"
      strokeWidth={0.6}
      d="M11.625 6h-5.25a.375.375 0 0 0 0 .75h5.25a.375.375 0 0 0 0-.75ZM11.625 8.25h-5.25a.375.375 0 0 0 0 .75h5.25a.375.375 0 0 0 0-.75Z"
    />
  </Svg>
)
export default iconNotes
