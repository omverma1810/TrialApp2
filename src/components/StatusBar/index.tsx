import {StatusBar, StatusBarProps} from 'react-native';
import React from 'react';

import useTheme from '../../theme/hooks/useTheme';

const StatusBarComponents = ({...props}: StatusBarProps) => {
  const {COLORS, BAR_STYLE} = useTheme();
  return (
    <StatusBar
      backgroundColor={COLORS.APP.STATUS_BAR_COLOR}
      barStyle={BAR_STYLE}
      {...props}
    />
  );
};

export default StatusBarComponents;
