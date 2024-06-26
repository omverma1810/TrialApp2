import {ActivityIndicator} from 'react-native';
import React from 'react';

import {LoaderTypes} from '../../types/components/Loader';

const Loader = ({...props}: LoaderTypes) => {
  return <ActivityIndicator {...props} />;
};

export default Loader;
