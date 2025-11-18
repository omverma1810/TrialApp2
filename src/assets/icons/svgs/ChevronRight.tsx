import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';

interface SvgComponentProps extends SvgProps {}

const SvgComponent: React.FC<SvgComponentProps> = (props) => (
    <Svg
        xmlns="http://www.w3.org/2000/svg"
        width={17}
        height={19}
        fill="none"
        {...props}>
        <Path
            fill="#2563EB"
            d="m9.46 19-1.4-1.813 4.864-6.368H.714V8.181h12.21L8.06 1.834 9.46 0l7.254 9.504L9.46 19Z"
        />
    </Svg>
);
export default SvgComponent;
