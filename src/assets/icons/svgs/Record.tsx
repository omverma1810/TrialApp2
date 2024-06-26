import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const SvgComponent = (props: SvgProps & {focused: boolean}) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={25}
    height={24}
    fill="none"
    {...props}>
    <Path
      stroke={props?.color || '#454545'}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={props?.focused ? 1.5 : 1}
      d="M14.25 11h-6m2 4h-2m8-8h-8m12-.2v10.4c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C17.97 22 17.13 22 15.45 22h-6.4c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C4.25 19.72 4.25 18.88 4.25 17.2V6.8c0-1.68 0-2.52.327-3.162a3 3 0 0 1 1.311-1.311C6.53 2 7.37 2 9.05 2h6.4c1.68 0 2.52 0 3.162.327a3 3 0 0 1 1.311 1.311c.327.642.327 1.482.327 3.162Z"
    />
  </Svg>
);
export default SvgComponent;
