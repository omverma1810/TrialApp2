import {Text} from 'react-native';
import React from 'react';

import {TextTypes} from '../../types/components/Text';

const TextView = ({children, ...props}: TextTypes) => {
  return <Text {...props}>{children}</Text>;
};

export default TextView;
