import * as React from "react"
import { Svg, Path } from 'react-native-svg';
const exp = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="none"
    {...props}
  >
    <Path
      stroke="#454545"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.865 13.358c-.27.306-.554.608-.851.905-4.296 4.296-9.678 5.88-12.021 3.536-1.607-1.606-1.368-4.641.325-7.775M4.64 6.725c.281-.32.578-.636.888-.947C9.824 1.482 15.206-.1 17.55 2.243c1.608 1.607 1.367 4.645-.33 7.781m-3.206-4.246c4.296 4.296 5.88 9.678 3.536 12.021-2.343 2.343-7.725.76-12.02-3.535C1.231 9.968-.352 4.585 1.992 2.242c2.343-2.343 7.725-.76 12.02 3.535ZM10.75 10a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
    />
  </Svg>
)
export default exp
