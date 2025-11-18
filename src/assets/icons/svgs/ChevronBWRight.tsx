import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';

interface SvgComponentProps extends SvgProps {}

const SvgComponent: React.FC<SvgComponentProps> = (props) => (
    <Svg
        xmlns="http://www.w3.org/2000/svg"
        width={9}
        height={15}
        fill="none"
        {...props}>
        <Path
            fill="#9CA3AF"
            fillRule="evenodd"
            d="M1.24 1.212a.937.937 0 0 0 0 1.326L6.201 7.5l-4.963 4.962a.937.937 0 1 0 1.326 1.326L8.19 8.163a.929.929 0 0 0 .275-.663.929.929 0 0 0-.275-.663L2.565 1.212a.938.938 0 0 0-1.326 0Z"
            clipRule="evenodd"
        />
    </Svg>
);
export default SvgComponent;
