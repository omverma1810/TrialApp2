import * as React from 'react';
import Svg, {SvgProps, Path, G} from 'react-native-svg';

const SvgComponent = (props: SvgProps) => (
  <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <G data-name="11.download">
      <Path d="M12 24a12 12 0 1 1 12-12 12.013 12.013 0 0 1-12 12zm0-22a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2z" />
      <Path d="M12 14.414 7.293 9.707l1.414-1.414L12 11.586l3.293-3.293 1.414 1.414L12 14.414z" />
      <Path d="M11 5h2v8h-2zm6 14H7v-3h2v1h6v-1h2v3z" />
    </G>
  </Svg>
);
export default SvgComponent;
