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
      d="M3.25 10.565c0-.574 0-.861.074-1.126a2 2 0 0 1 .318-.65c.163-.22.39-.397.843-.75l6.783-5.275c.351-.273.527-.41.72-.462a1 1 0 0 1 .523 0c.194.052.37.189.721.462l6.783 5.275c.453.353.68.53.843.75.145.195.252.416.318.65.074.265.074.552.074 1.126V17.8c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C19.73 21 19.17 21 18.05 21H6.45c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874c-.218-.428-.218-.988-.218-2.108v-7.235Z"
    />
  </Svg>
);
export default SvgComponent;
