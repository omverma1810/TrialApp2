import * as React from "react"
import { Svg, Path } from 'react-native-svg';
const field = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={14}
    height={14}
    fill="none"
    {...props}
  >
    <Path
      stroke="#0B2E58"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 7h.003M4.2 13h5.6c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874C13 11.48 13 10.92 13 9.8V4.2c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C11.48 1 10.92 1 9.8 1H4.2c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C1 2.52 1 3.08 1 4.2v5.6c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874C2.52 13 3.08 13 4.2 13Zm2.967-6a.167.167 0 1 1-.334 0 .167.167 0 0 1 .334 0Z"
    />
  </Svg>
)
export default field
