import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const SvgComponent = (props: SvgProps& {focused: boolean}) => (
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
      d="M17.865 15.358c-.27.306-.554.608-.851.905-4.296 4.296-9.678 5.88-12.021 3.536-1.607-1.606-1.368-4.641.325-7.775M7.64 8.725c.281-.32.578-.636.888-.947C12.824 3.482 18.206 1.9 20.55 4.243c1.608 1.607 1.367 4.645-.33 7.781m-3.206-4.246c4.296 4.296 5.88 9.678 3.536 12.021-2.343 2.343-7.725.76-12.02-3.535-4.297-4.296-5.88-9.678-3.536-12.021 2.343-2.343 7.725-.76 12.02 3.535ZM13.75 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
    />
  </Svg>
);
export default SvgComponent;
