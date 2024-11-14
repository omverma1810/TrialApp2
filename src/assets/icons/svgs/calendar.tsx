import * as React from "react"
import { Svg, Path } from 'react-native-svg';
const calendar = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={14}
    height={15}
    fill="none"
    {...props}
  >
    <Path
      stroke="#0B2E58"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13 6.167H1M9.667.833V3.5M4.333.833V3.5M4.2 14.167h5.6c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874c.218-.428.218-.988.218-2.108v-5.6c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874c-.428-.218-.988-.218-2.108-.218H4.2c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C1 3.686 1 4.246 1 5.367v5.6c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874c.428.218.988.218 2.108.218Z"
    />
  </Svg>
)
export default calendar
