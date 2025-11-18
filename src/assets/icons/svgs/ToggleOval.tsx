import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';

interface SvgComponentProps extends SvgProps {}

const SvgComponent: React.FC<SvgComponentProps> = (props) => (
    <Svg
        xmlns="http://www.w3.org/2000/svg"
        width={20}
        height={20}
        fill="none"
        {...props}>
        <Path
            fill="#fff"
            d="M10 0C4.477 0 0 4.477 0 10v.015A9.974 9.974 0 0 0 9.985 20H10c5.523 0 10-4.462 10-9.985V10c0-5.523-4.462-10-9.985-10H10Z"
        />
    </Svg>
);
export default SvgComponent;
