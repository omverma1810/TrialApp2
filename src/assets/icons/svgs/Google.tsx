import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
const SvgComponent = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={25.001}
    height={25.001}
    {...props}>
    <Path
      fill="#fbbb00"
      d="m5.541 15.109-.87 3.249-3.181.067A12.523 12.523 0 0 1 1.4 6.752l2.832.519 1.24 2.815a7.46 7.46 0 0 0 .07 5.023Z"
      data-name="Path 28"
    />
    <Path
      fill="#518ef8"
      d="M24.783 10.165a12.5 12.5 0 0 1-4.456 12.084l-3.567-.182-.5-3.151a7.45 7.45 0 0 0 3.206-3.8h-6.684v-4.945h12.007Z"
      data-name="Path 29"
    />
    <Path
      fill="#28b446"
      d="M20.326 22.249a12.5 12.5 0 0 1-18.837-3.824l4.051-3.316a7.435 7.435 0 0 0 10.713 3.807Z"
      data-name="Path 30"
    />
    <Path
      fill="#f14336"
      d="m20.48 2.878-4.05 3.315a7.434 7.434 0 0 0-10.956 3.893L1.399 6.752A12.5 12.5 0 0 1 20.48 2.878Z"
      data-name="Path 31"
    />
  </Svg>
);
export default SvgComponent;
