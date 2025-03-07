import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';

const SvgComponent = (props: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={26}
    height={24}
    viewBox="0 0 90 90"
    fill="#1A6DD2"
    {...props}>
    <Path
      fill="#1A6DD2"
      d="M15.205 90c-1.104 0-2-.896-2-2V55.115c0-1.104.896-2 2-2s2 .896 2 2V88c0 1.104-.896 2-2 2z"
    />
    <Path
      fill="#1A6DD2"
      d="M74.795 59.357c-1.104 0-2-.896-2-2V2c0-1.104.896-2 2-2s2 .896 2 2v55.357c0 1.104-.896 2-2 2z"
    />
    <Path
      fill="#1A6DD2"
      d="M45 90c-1.104 0-2-.896-2-2V27.922c0-1.104.896-2 2-2s2 .896 2 2V88c0 1.104-.896 2-2 2z"
    />
    <Path
      fill="#1A6DD2"
      d="M45 29.922c-5.464 0-9.91-4.445-9.91-9.91s4.445-9.91 9.91-9.91c5.465 0 9.91 4.445 9.91 9.91s-4.445 9.91-9.91 9.91zm0-15.819c-3.259 0-5.91 2.651-5.91 5.91s2.651 5.91 5.91 5.91 5.91-2.651 5.91-5.91-2.651-5.91-5.91-5.91z"
    />
    <Path
      fill="#1A6DD2"
      d="M15.205 57.115c-5.464 0-9.91-4.445-9.91-9.91 0-5.464 4.445-9.91 9.91-9.91s9.91 4.445 9.91 9.91c0 5.465-4.446 9.91-9.91 9.91zm0-15.82c-3.259 0-5.91 2.651-5.91 5.91s2.651 5.91 5.91 5.91 5.91-2.651 5.91-5.91-2.651-5.91-5.91-5.91z"
    />
    <Path
      fill="#1A6DD2"
      d="M74.795 75.177c-5.464 0-9.909-4.445-9.909-9.91 0-5.464 4.445-9.909 9.909-9.909 5.465 0 9.91 4.445 9.91 9.909 0 5.465-4.445 9.91-9.91 9.91zm0-15.82c-3.259 0-5.909 2.65-5.909 5.909s2.65 5.91 5.909 5.91 5.91-2.651 5.91-5.91-2.651-5.909-5.91-5.909z"
    />
    <Path
      fill="#1A6DD2"
      d="M15.205 41.295c-1.104 0-2-.896-2-2V2c0-1.104.896-2 2-2s2 .896 2 2v37.295c0 1.104-.896 2-2 2z"
    />
    <Path
      fill="#1A6DD2"
      d="M45 14.103c-1.104 0-2-.896-2-2V2c0-1.104.896-2 2-2s2 .896 2 2v10.103c0 1.104-.896 2-2 2z"
    />
    <Path
      fill="#1A6DD2"
      d="M74.795 90c-1.104 0-2-.896-2-2V73.177c0-1.104.896-2 2-2s2 .896 2 2V88c0 1.104-.896 2-2 2z"
    />
  </Svg>
);

export default SvgComponent;
