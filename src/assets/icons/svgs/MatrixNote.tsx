import * as React from 'react';
import Svg, {SvgProps, Path, ClipPath, Defs, G} from 'react-native-svg';

const SvgComponent = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={13}
    height={13}
    fill="none"
    {...props}>
    <G stroke="#000" clipPath="url(#a)">
      <Path
        strokeLinejoin="round"
        d="m8.464 7.178-2.24.12.12-2.24 3.76-3.76 2.12 2.12-3.76 3.76Z"
      />
      <Path
        strokeLinecap="round"
        d="M6.314 2.298h-3.68a.41.41 0 0 0-.41.41v8.18a.41.41 0 0 0 .41.41h8.18a.41.41 0 0 0 .41-.41v-3.68"
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" d="M.724.798h12v12h-12z" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default SvgComponent;
