import * as React from "react"
import Svg, { SvgProps, Path } from "react-native-svg"
const SvgComponent = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="none"
    {...props}
  >
    <Path
      fill="#000"
      fillOpacity={0.6}
      d="M19.321 9.747c-.027-.062-.689-1.53-2.16-3C15.2 4.785 12.725 3.75 10 3.75c-2.725 0-5.2 1.036-7.16 2.996-1.472 1.471-2.137 2.941-2.161 3a.625.625 0 0 0 0 .509c.027.061.689 1.529 2.16 3 1.96 1.96 4.436 2.995 7.161 2.995 2.725 0 5.2-1.036 7.16-2.995 1.472-1.471 2.134-2.939 2.161-3a.625.625 0 0 0 0-.508ZM10 15c-2.405 0-4.505-.874-6.245-2.598A10.426 10.426 0 0 1 1.953 10a10.416 10.416 0 0 1 1.802-2.402C5.495 5.874 7.595 5 10 5c2.405 0 4.505.874 6.244 2.598.715.709 1.324 1.518 1.807 2.402-.563 1.052-3.017 5-8.051 5Zm0-8.75a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Zm0 6.25a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"
    />
  </Svg>
)
export default SvgComponent
