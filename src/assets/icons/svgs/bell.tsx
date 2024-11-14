import * as React from "react"
import { Svg, Path } from 'react-native-svg';
const bell = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={19}
    height={22}
    fill="none"
    {...props}
  >
    <Path
      stroke="#454545"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7.104 20c.705.622 1.632 1 2.646 1s1.94-.378 2.646-1M10.75 1.084A6 6 0 0 0 3.75 7c0 3.09-.78 5.206-1.65 6.605-.735 1.18-1.102 1.771-1.089 1.936.015.182.054.252.2.36.133.099.732.099 1.928.099H16.36c1.196 0 1.794 0 1.927-.098.147-.11.186-.179.2-.361.014-.165-.353-.755-1.088-1.936-.492-.79-.955-1.81-1.264-3.105"
    />
  </Svg>
)
export default bell
