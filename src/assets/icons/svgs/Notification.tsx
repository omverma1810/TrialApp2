import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const SvgComponent = (props: SvgProps & {focused: boolean}) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}>
    <Path
      stroke={props?.color || '#454545'}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={props?.focused ? 1.5 : 1}
      d="M9.354 21c.705.622 1.631 1 2.646 1 1.014 0 1.94-.378 2.646-1M18 8A6 6 0 1 0 6 8c0 3.09-.78 5.206-1.65 6.605-.735 1.18-1.102 1.771-1.089 1.936.015.182.054.252.2.36.133.099.731.099 1.928.099H18.61c1.196 0 1.794 0 1.927-.098.147-.11.186-.179.2-.361.014-.165-.353-.755-1.088-1.936C18.78 13.206 18 11.09 18 8Z"
    />
  </Svg>
);
export default SvgComponent;
